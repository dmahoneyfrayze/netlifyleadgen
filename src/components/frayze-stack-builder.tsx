import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  CheckIcon, 
  ChevronLeftIcon, 
  CalendarIcon, 
  DocumentTextIcon, 
  SparklesIcon, 
  XMarkIcon 
} from "@heroicons/react/24/outline";
import { AddonGrid } from "@/components/addon-grid";
import { AddonSummary } from "@/components/addon-summary";
import { AddonSearch } from "@/components/addon-search";
import { CategoryTabs } from "@/components/category-tabs";
import { Hero } from "@/components/hero";
import { BusinessProfiler } from "@/components/business-profiler";
import { ContactForm } from "@/components/contact-form";
import { ChatBot } from "@/components/chat-bot";
import { Footer } from "@/components/footer";
import { addonCategories, addons, getRecommendedAddons, coreSystems } from "@/data/addons";
import { type Addon } from "@/types";
import { Card } from "@/components/ui/card";
import { generateQuotePDF } from "@/lib/pdf-utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import * as LucideIcons from 'lucide-react';
import { getStoredResponse } from "@/lib/callback-storage";

export default function FrayzeStackBuilder() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selected, setSelected] = useState<Addon[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("ai-recommended");
  const [activeSubcategory, setActiveSubcategory] = useState("");
  const [selectedCore, setSelectedCore] = useState<Addon | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showHero, setShowHero] = useState(true);
  const [formData, setFormData] = useState<any>(null);
  const [businessProfile, setBusinessProfile] = useState<{
    businessType: string;
    teamSize: string;
    mainGoal: string;
  } | null>(null);
  const [showActionPlanModal, setShowActionPlanModal] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoadingActionPlan, setIsLoadingActionPlan] = useState(false);
  const [formId, setFormId] = useState<string | null>(null);
  
  // --- Start: Polling Logic for Action Plan Modal ---
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null;
    let pollingAttempts = 0;
    const MAX_POLLING_ATTEMPTS = 15; // Poll for ~45 seconds (15 * 3s)

    const pollForResponse = async () => {
      pollingAttempts++;
      console.log(`Modal polling attempt ${pollingAttempts} for formId: ${formId}`);

      await checkForCallbackResults(); // This will try API then localStorage

      // Check if aiResponse was set by checkForCallbackResults
      // Need to check localStorage directly as state update might be async
      const currentResponse = getStoredResponse(formId!, false);
      if (currentResponse?.aiResponse) {
        console.log('Modal polling found response, stopping.');
        setAiResponse(currentResponse.aiResponse); // Ensure state is updated
        if (pollingInterval) clearInterval(pollingInterval);
      } else if (pollingAttempts >= MAX_POLLING_ATTEMPTS) {
        console.log('Modal polling timed out.');
        if (pollingInterval) clearInterval(pollingInterval);
        // Optional: Set an error message or fallback content here if needed
        // setAiResponse("Could not retrieve action plan after timeout.");
      }
    };

    if (showActionPlanModal && formId && !aiResponse) {
      console.log('Starting modal polling for action plan...');
      // Initial check immediately
      pollForResponse(); 
      // Set interval for subsequent checks
      pollingInterval = setInterval(pollForResponse, 3000); // Poll every 3 seconds
    }

    // Cleanup function
    return () => {
      if (pollingInterval) {
        console.log('Clearing modal polling interval.');
        clearInterval(pollingInterval);
      }
    };
  }, [showActionPlanModal, formId, aiResponse]); // Rerun effect if modal opens, formId changes, or aiResponse is set
  // --- End: Polling Logic for Action Plan Modal ---

  const totalPrice = selected.reduce((sum, addon) => {
    // If this is a core system, only count its price
    if (addon.category === "core") {
      return sum + (addon.pricing.type === 'monthly' && addon.pricing.amount ? addon.pricing.amount : 0);
    }
    
    // If we have a selected core system
    if (selectedCore && selectedCore.includes) {
      // Check if this add-on is included in the core system
      if (selectedCore.includes.includes(addon.id)) {
        // Don't add its price to the total (it's included in the core system)
        return sum;
      }
    }
    
    // Add the price for add-ons not included in the core system
    if (addon.pricing.type === 'monthly' && addon.pricing.amount) {
      return sum + addon.pricing.amount;
    }
    return sum;
  }, 0);
  
  const handleStartBuilding = () => {
    setShowHero(false);
    setCurrentStep(1);
  };
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      if (currentStep === 2) {
        setSelected([]);
        setBusinessProfile(null);
        setActiveCategory("ai-recommended");
        setActiveSubcategory("");
      }
    } else {
      // Go back to hero when pressing back from step 1
      setShowHero(true);
    }
  };
  
  const handleContactSubmit = useCallback((data: any, responseData?: { aiResponse?: string, formId?: string }) => {
    // Log submission data for debugging
    console.log('Quote Request Submitted:', {
      selectedAddons: selected,
      totalPrice,
      ...data
    });
    
    // Store form data
    setFormData(data);
    
    // Store AI response if available
    if (responseData?.aiResponse) {
      setAiResponse(responseData.aiResponse);
    }
    
    // Store form ID for callback reference
    if (responseData?.formId) {
      setFormId(responseData.formId);
    }
    
    // Close contact form and move to success step
    setShowContactForm(false);
    setCurrentStep(3);
  }, [selected, totalPrice]);
  
  const handleProfileSubmit = (profile: typeof businessProfile) => {
    if (!profile) return;
    setBusinessProfile(profile);
    setCurrentStep(2);
    setActiveCategory(profile.teamSize === "core" ? "all" : "ai-recommended");
    if (profile) {
      let recommendations: Addon[] = [];
      
      if (profile.teamSize === "core") {
        // Direct core system selection
        const selectedSystem = coreSystems.find(system => system.id === profile.businessType);
        if (selectedSystem) {
          setSelectedCore(selectedSystem);
          
          // Start with the core system
          const selectedAddons = [selectedSystem];
          
          // Include all add-ons that come with this core system
          if (selectedSystem.includes) {
            const includedAddons = addons.filter(a => selectedSystem.includes?.includes(a.id));
            selectedAddons.push(...includedAddons);
          }
          
          setSelected(selectedAddons);
        }
      } else {
        // AI recommendations
        setSelectedCore(null);
        recommendations = getRecommendedAddons(profile);
        setSelected(recommendations);
      }
      
      document.getElementById('addons')?.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const toggleAddon = (addon: Addon) => {
    // If this is a core system, replace everything and add the included add-ons
    if (addon.category === "core") {
      setSelectedCore(addon);
      
      // Start with the core system
      const selectedAddons = [addon];
      
      // Include all add-ons that come with this core system
      if (addon.includes) {
        const includedAddons = addons.filter(a => addon.includes?.includes(a.id));
        selectedAddons.push(...includedAddons);
      }
      
      setSelected(selectedAddons);
      return;
    }

    // For bundles
    if (addon.includes) {
      // For bundles, toggle all included add-ons
      const includedAddons = addons.filter(a => addon.includes?.includes(a.id));
      setSelected(prev => {
        const hasAll = includedAddons.every(a => prev.some(p => p.id === a.id));
        if (hasAll) {
          return prev.filter(p => !addon.includes?.includes(p.id));
        } else {
          const newSelection = [...prev];
          includedAddons.forEach(a => {
            if (!newSelection.some(p => p.id === a.id)) {
              newSelection.push(a);
            }
          });
          return newSelection;
        }
      });
      return;
    }

    // If user tries to remove an add-on that's included in the core system, don't allow it
    if (selectedCore && selectedCore.includes && selectedCore.includes.includes(addon.id)) {
      // Display the info that this add-on is included in the core package
      alert(`${addon.name} is included in your core package and cannot be removed.`);
      return;
    }

    // For regular add-ons
    setSelected(prev =>
      prev.some(a => a.id === addon.id) 
        ? prev.filter(a => a.id !== addon.id) 
        : [...prev, addon]
    );
  };
  
  const filteredAddons = addons.filter(addon => {
    const matchesSearch = addon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         addon.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Basic search filter
    if (!matchesSearch) return false;
    
    // Don't show core systems in the add-ons grid
    if (addon.category === "core") return false;
    
    if (activeCategory === "all") {
      return true;
    }

    // For specific categories, check both category and subcategory
    if (activeCategory === addon.category) {
      return !activeSubcategory || addon.subcategory === activeSubcategory;
    }

    // For AI recommendations
    if (activeCategory === "ai-recommended" && businessProfile) {
      const recommendations = getRecommendedAddons(businessProfile);
      return recommendations.some(rec => rec.id === addon.id);
    }

    return false;
  });
  
  // Function to check for callback results from n8n
  const checkForCallbackResults = async () => {
    if (!formId) {
      console.warn('No form ID available to check for callback results');
      return;
    }
    
    setIsLoadingActionPlan(true);
    
    try {
      console.log('Checking for real webhook data from server...');
      
      // First try to fetch from the server API directly
      try {
        const response = await fetch(`/.netlify/functions/webhook-callback?formId=${formId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.aiResponse) {
            console.log('Retrieved real response from server API');
            setAiResponse(data.aiResponse);
            setIsLoadingActionPlan(false);
            return;
          }
        }
      } catch (apiError) {
        console.error('Error fetching from API:', apiError);
      }
      
      // If server API fails, check localStorage without fallbacks first
      console.log('Server API check failed, trying localStorage for exact matches');
      const result = getStoredResponse(formId, false);  // false = no fallbacks
      
      if (result && result.aiResponse) {
        console.log('Found exact match response for formId:', formId);
        setAiResponse(result.aiResponse);
      } else {
        // If no exact match is found, keep aiResponse as null.
        // The modal will show the loading state or "Check for Action Plan" button.
        console.log('No exact response found in API or localStorage yet.');
        // We intentionally do NOT set aiResponse here to allow the loading UI to persist.
        // The user can click "Check for Action Plan" again later.
        // DO NOT call getStoredResponse(formId, true) here.
      }
    } catch (error) {
      console.error('Error checking for callback results:', error);
    } finally {
      setIsLoadingActionPlan(false);
    }
  };
  
  return (
    <div className="relative w-full min-h-screen flex flex-col bg-gradient-to-b from-background to-background/90">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(0,102,255,0.1),rgba(255,255,255,0)_50%)]" />
      </div>
      
      {!showHero && (
        <Button
          variant="ghost"
          size="default"
          className="fixed top-4 left-4 z-20 bg-white/80 backdrop-blur-sm border shadow-sm hover:bg-white/90 hover:shadow-md transition-all duration-300"
          onClick={handleBack}
        >
          <ChevronLeftIcon className="w-5 h-5" />
          Back
        </Button>
      )}

      <div className="flex-grow w-full">
        {showHero ? (
          <Hero onStartBuilding={handleStartBuilding} />
        ) : (
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="container px-4 py-8 mx-auto max-w-7xl"
                id="profiler-step"
              >
                <BusinessProfiler 
                  onSubmit={handleProfileSubmit}
                />
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="container px-4 py-8 mx-auto max-w-7xl"
                id="addons"
              >
                {/* Mobile Summary Section - Shown only on smaller screens */}
                <div className="block md:hidden mb-6">
                  <AddonSummary 
                    selected={selected} 
                    totalPrice={totalPrice} 
                    toggleAddon={toggleAddon}
                    onNext={() => setShowContactForm(true)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_350px] gap-8">
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b">
                      <div>
                        <h2 className="text-2xl font-bold mb-1">
                          {businessProfile ? 'Additional Options!' : 'Available Add-ons'}
                        </h2>
                        {businessProfile?.teamSize !== "core" && (
                          <p className="text-sm text-muted-foreground">
                            AI-recommended services based on your business profile
                          </p>
                        )}
                      </div>
                      <AddonSearch 
                        searchQuery={searchQuery} 
                        setSearchQuery={setSearchQuery} 
                      />
                    </div>
                    
                    <CategoryTabs 
                      categories={addonCategories} 
                      activeCategory={activeCategory}
                      showRecommended={businessProfile?.teamSize !== "core"}
                      activeSubcategory={activeSubcategory}
                      setActiveCategory={setActiveCategory}
                      setActiveSubcategory={setActiveSubcategory}
                    />
                    
                    <AddonGrid
                      addons={filteredAddons}
                      selected={selected}
                      onToggle={toggleAddon}
                      selectedCore={selectedCore}
                    />
                    
                    {filteredAddons.length === 0 && (
                      <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg border-border bg-muted/30">
                        <p className="text-lg text-muted-foreground text-center">
                          No add-ons found matching your criteria. Try adjusting your search or category.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Desktop Summary Section - Hidden on mobile */}
                  <div className="hidden md:block lg:sticky lg:top-6 h-fit">
                    <AddonSummary 
                      selected={selected} 
                      totalPrice={totalPrice} 
                      toggleAddon={toggleAddon}
                      onNext={() => setShowContactForm(true)}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="container px-4 py-8 mx-auto max-w-7xl"
              >
                <div className="max-w-2xl mx-auto">
                  <div className="inline-flex items-center justify-center p-3 rounded-full bg-gradient-to-br from-[#0066FF] to-[#00F6A3] text-white mb-4 mx-auto">
                    <CheckIcon className="w-6 h-6" />
                  </div>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">Thanks! Your Quote Request is Confirmed</h2>
                    <p className="text-muted-foreground">
                      A Frayze strategist will review your stack and follow up within 24 hours.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-[#0066FF] to-[#00F6A3] hover:from-[#0052CC] hover:to-[#00E69D] text-white"
                      onClick={() => window.open('https://calendly.com/frayze/demo', '_blank')}
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Book a Call Now
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                      onClick={() => {
                        try {
                          generateQuotePDF(selected, totalPrice, formData);
                        } catch (error) {
                          console.error('Error generating PDF:', error);
                          alert('There was an error generating your PDF. Please try again or contact support.');
                        }
                      }}
                    >
                      <DocumentTextIcon className="w-5 h-5 mr-2" />
                      Download Estimate PDF
                    </Button>
                  </div>
                  
                  <div className="mb-8">
                    <Button
                      variant="default"
                      size="lg"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => {
                        if (!aiResponse) {
                          // If we don't have the AI response yet, check for it
                          checkForCallbackResults();
                        }
                        setShowActionPlanModal(true);
                      }}
                    >
                      <SparklesIcon className="w-5 h-5 mr-2" />
                      View Your Custom Frayze Action Plan
                    </Button>
                  </div>
                  
                  <Card className="bg-muted/30 p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <SparklesIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium">What happens next?</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <CheckIcon className="w-4 h-4 text-primary" />
                            A Frayze strategist will review your requirements
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckIcon className="w-4 h-4 text-primary" />
                            We'll prepare a detailed proposal with exact pricing
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckIcon className="w-4 h-4 text-primary" />
                            Schedule a call to discuss implementation details
                          </li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                  
                  <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      variant="ghost"
                      onClick={() => {
                        setShowHero(true);
                        setCurrentStep(1);
                      }}
                      className="w-full sm:w-auto"
                    >
                      Start Another Quote
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setShowHero(true);
                        setCurrentStep(1);
                        setSelected([]);
                        setBusinessProfile(null);
                        setActiveCategory("ai-recommended");
                        setActiveSubcategory("");
                      }}
                      className="w-full sm:w-auto"
                    >
                      <XMarkIcon className="w-4 h-4 mr-2" />
                      Close
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
      
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <ContactForm
              totalPrice={totalPrice}
              selected={selected}
              onSubmit={handleContactSubmit}
              onBack={() => setShowContactForm(false)}
            />
          </div>
        </div>
      )}
      
      <Footer />
      
      <ChatBot 
        onHelpMeChoose={() => {
          setShowHero(false);
        }}
      />
      
      {/* Action Plan Modal */}
      <Dialog open={showActionPlanModal} onOpenChange={setShowActionPlanModal}>
        <DialogContent className="max-w-4xl" aria-describedby="action-plan-description">
          <DialogHeader>
            <DialogTitle className="text-2xl">Your Custom Action Plan</DialogTitle>
            <p id="action-plan-description" className="text-muted-foreground">
              Review your personalized action plan based on your selections
            </p>
          </DialogHeader>
          
          <div className="max-h-[70vh] overflow-y-auto my-4">
            {aiResponse ? (
              <div dangerouslySetInnerHTML={{ __html: aiResponse }} />
            ) : (
              <div className="p-8 text-center">
                <SparklesIcon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">Your action plan is being prepared</h3>
                <p className="text-muted-foreground mb-6">
                  We're waiting to receive your custom action plan from Frayzi.
                  This can take up to 30 seconds.
                </p>
                
                <div className="flex items-center justify-center">
                  <LucideIcons.Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                  <span>Loading... Please wait.</span>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setShowActionPlanModal(false)}
            >
              Close
            </Button>
            
            {aiResponse && (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  try {
                    // This implementation uses inline script to download as HTML
                    // In production, you'd use jsPDF for proper PDF formatting
                    const blob = new Blob([aiResponse], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `frayze-action-plan-${Date.now()}.html`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  } catch (error) {
                    console.error('Error downloading action plan:', error);
                    alert('There was an error downloading your action plan. Please try again or contact support.');
                  }
                }}
              >
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                Download Action Plan
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}