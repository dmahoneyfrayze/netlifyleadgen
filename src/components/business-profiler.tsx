import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Building2, Users, Target, HelpCircle, Sparkles, Bolt } from "lucide-react";
import { motion } from "framer-motion";
import { coreSystems } from "@/data/addons";
import { formatPricing } from "@/lib/format-utils";

interface BusinessProfilerProps {
  onSubmit: (profile: {
    businessType: string;
    teamSize: string;
    mainGoal: string;
  }) => void;
}

export function BusinessProfiler({ onSubmit }: BusinessProfilerProps) {
  const [profile, setProfile] = useState({
    businessType: "",
    teamSize: "",
    mainGoal: ""
  });
  const [showProfiler, setShowProfiler] = useState(false);
  
  return (
    <div className="space-y-6 business-profiler">
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-[#0066FF] text-white flex items-center justify-center font-bold">
            1
          </div>
          <div className="h-px w-12 bg-border" />
          <div className="w-8 h-8 rounded-full bg-muted/50 text-muted-foreground flex items-center justify-center font-bold">
            2
          </div>
          <div className="h-px w-12 bg-border" />
          <div className="w-8 h-8 rounded-full bg-muted/50 text-muted-foreground flex items-center justify-center font-bold">
            3
          </div>
        </div>
        <div className="flex items-center justify-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[#0066FF] to-[#00F6A3] flex items-center justify-center rounded">
            <Bolt className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-br from-[#0066FF] to-[#00F6A3] bg-clip-text text-transparent ml-2">Start Here</span>
        </div>
        <h2 className="text-3xl font-bold mb-3">Start with a Core System</h2>
        <p className="text-muted-foreground">
          Every Frayze setup begins with one of our foundational systems.
          Choose the package that best fits your size, goals, or team structure.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1800px] mx-auto">
          {coreSystems.map((system) => (
            <Card
              key={system.id}
              className="cursor-pointer hover:border-primary/60 hover:shadow-lg transition-all duration-300"
              onClick={() => {
                onSubmit({
                  businessType: system.id,
                  teamSize: "core",
                  mainGoal: "core"
                });
              }}
            >
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-[#0066FF] hover:text-[#0052CC] transition-colors">
                      {system.name}
                    </h3>
                    <div className="text-lg font-bold">{formatPricing(system.pricing)}</div>
                  </div>
                  
                  <p className="text-muted-foreground">{system.description}</p>
                  
                  <Button className="w-full group">
                    Select This Package
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center">
          <Card
            className="hover:border-primary/60 hover:shadow-lg transition-all duration-300 max-w-[500px] bg-gradient-to-br from-white to-blue-50/30"
          >
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-center items-center">
                  <h3 className="text-2xl font-semibold text-[#1F2937] flex items-center">
                    <HelpCircle className="w-5 h-5 mr-2" />
                    Not sure where to start?
                  </h3>
                </div>
                <p className="text-center text-muted-foreground">
                  Tell us about your business and we'll recommend the right system.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="text-base px-6 py-5 w-full sm:w-auto group bg-white hover:bg-blue-50 border-2 border-[#0066FF]/20 hover:border-[#0066FF]/40 font-medium"
                    onClick={() => setShowProfiler(true)}
                  >
                    Help Me Choose
                    <Sparkles className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    size="lg"
                    className="text-base px-6 py-5 w-full sm:w-auto group bg-gradient-to-r from-[#0066FF] via-[#6366F1] to-[#00F6A3] hover:from-[#0052CC] hover:via-[#5558EA] hover:to-[#00E69D] shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => window.open('https://calendly.com/frayze/demo', '_blank')}
                  >
                    Book a Discovery Call
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showProfiler && (
        <motion.div 
          className="fixed inset-0 bg-white/95 backdrop-blur z-50 overflow-auto flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Tell Us About Your Business</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                   What industry are you in?
                  </label>
                  <Select
                    value={profile.businessType}
                    onValueChange={(value) => setProfile({ ...profile, businessType: value })}
                  >
                    <SelectTrigger>
                     <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                     <SelectItem value="healthcare">Healthcare</SelectItem>
                     <SelectItem value="realestate">Real Estate</SelectItem>
                      <SelectItem value="service">Service Business</SelectItem>
                      <SelectItem value="retail">Retail / E-commerce</SelectItem>
                     <SelectItem value="finance">Finance</SelectItem>
                     <SelectItem value="education">Education</SelectItem>
                     <SelectItem value="hospitality">Hospitality</SelectItem>
                     <SelectItem value="technology">Technology</SelectItem>
                     <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                    How many people are on your team?
                  </label>
                  <Select
                    value={profile.teamSize}
                    onValueChange={(value) => setProfile({ ...profile, teamSize: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solo">Just me</SelectItem>
                      <SelectItem value="small">2-5 people</SelectItem>
                      <SelectItem value="medium">6-20 people</SelectItem>
                      <SelectItem value="large">20+ people</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <Target className="w-4 h-4 mr-2 text-muted-foreground" />
                    What's your main goal right now?
                  </label>
                  <Select
                    value={profile.mainGoal}
                    onValueChange={(value) => setProfile({ ...profile, mainGoal: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your main goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leads">Get more leads</SelectItem>
                      <SelectItem value="organization">Better organization</SelectItem>
                      <SelectItem value="automation">Automate tasks</SelectItem>
                      <SelectItem value="growth">Scale the business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowProfiler(false)}>
                  Cancel
                </Button>
                <Button 
                  disabled={!profile.businessType || !profile.teamSize || !profile.mainGoal}
                  onClick={() => {
                    onSubmit({
                      businessType: profile.businessType,
                      teamSize: profile.teamSize,
                      mainGoal: profile.mainGoal
                    });
                    setShowProfiler(false);
                  }}
                >
                  Get AI Recommendations
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
              
              <div className="mt-6 pt-6 border-t text-xs text-muted-foreground">
                <p>
                  By submitting this form, you consent to Frayze collecting and using the personal information you provide 
                  in accordance with PIPEDA (Personal Information Protection and Electronic Documents Act). We may contact 
                  you via email, phone, or SMS about your quote request and our services. You can withdraw your consent at any time.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}