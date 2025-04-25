import { Target, Zap, Building2, Users, LineChart, Globe, Bolt, Bot } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { Testimonials } from "@/components/testimonials";

const categories = [
  {
    name: "Lead Generation",
    icon: Target,
    color: "text-rose-500",
    description: "Bring in qualified leads with ads, SEO, forms, funnels, and landing pages.",
    includes: [
      "SEO Blog Engine",
      "Funnels & Promotions",
      "Ads Integration (Meta, Google, TikTok)",
      "Lead Attribution Tracker",
      "Multi-Step Lead Forms"
    ]
  },
  {
    name: "Automation & AI",
    icon: Zap,
    color: "text-blue-500",
    description: "Automate your follow-up, replies, and booking with intelligent workflows and AI tools.",
    includes: [
      "AI Inbox Responder",
      "AI Voice Agent (Inbound & Outbound)",
      "Smart Appointment Bot",
      "Lead Scoring Engine",
      "CRM Automations"
    ]
  },
  {
    name: "Operations",
    icon: Building2,
    color: "text-amber-500",
    description: "Streamline internal systems — billing, HR, inventory, team workflows.",
    includes: [
      "IMS (Inventory Management System)",
      "HRM (Employee Tools)",
      "Stripe Billing Automation",
      "Moneris Integration",
      "Multi-location Sync",
      "Custom Integrations"
    ]
  },
  {
    name: "Client Experience",
    icon: Users,
    color: "text-emerald-500",
    description: "Deliver a professional, seamless experience for your clients from signup to service.",
    includes: [
      "Client Portal",
      "Document Signing",
      "Onboarding Flows",
      "Scheduling Tools"
    ]
  },
  {
    name: "Insights & Analytics",
    icon: LineChart,
    color: "text-purple-500",
    description: "Know what's working. See your performance clearly across channels.",
    includes: [
      "Dashboards & Reporting",
      "Lead Scoring",
      "SEO Audit + Schema",
      "Attribution Tracking"
    ]
  },
  {
    name: "Website & Branding",
    icon: Globe,
    color: "text-indigo-500",
    description: "Your digital front door — built to convert.",
    includes: [
      "Website Design",
      "Technical SEO Services",
      "Google Merchant Sync",
      "Hosting / Landing Pages"
    ]
  }
];

interface HeroProps {
  onStartBuilding: () => void;
}

export function Hero({ onStartBuilding }: HeroProps) {
  // Function to scroll to the addons section
  const scrollToAddons = () => {
    const addonsElement = document.querySelector('#addons');
    if (addonsElement) {
      addonsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background py-16 border-b border-border">
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white" />
      <div className="container relative px-4 mx-auto max-w-7xl">
        <div className="absolute top-0 left-4 flex items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-[#0066FF] to-[#00F6A3] flex items-center justify-center rounded">
              <Bolt className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-br from-[#0066FF] to-[#00F6A3] bg-clip-text text-transparent ml-2">FRAYZE</span>
          </div>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center justify-center p-2 mb-5 bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors duration-300">
            <Zap className="w-5 h-5 mr-2 text-primary" strokeWidth={2.5} />
            <span className="text-sm font-medium text-[#1F2937]">Build Your Custom System</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Build Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">Perfect Stack</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-4">
            Select a core system, then choose any add-ons you need.
            Your estimate will update in real time — no commitment, just clarity.
          </p>
          <p className="text-sm text-muted-foreground mb-8 flex items-center gap-2">
            <span>🧾</span> All prices are estimates. Final proposal may vary based on usage, business size, or tech requirements.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl">
            {categories.map((category) => (
              <HoverCard key={category.name}>
                <HoverCardTrigger asChild>
                  <button 
                    onClick={onStartBuilding}
                    className="flex flex-col items-center p-4 rounded-lg bg-card border hover:border-primary/60 hover:shadow-md hover:bg-primary/5 transition-all duration-300 w-full"
                  >
                    <category.icon className={`w-8 h-8 mb-2 ${category.color}`} />
                    <span className="text-sm font-medium text-[#1F2937]">{category.name}</span>
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 p-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">{category.description}</h4>
                    <div className="pt-2">
                      <h5 className="text-xs font-medium text-muted-foreground mb-1">What goes here:</h5>
                      <ul className="text-xs space-y-1">
                        {category.includes.map((item) => (
                          <li key={item} className="flex items-center">
                            <span className="w-1 h-1 rounded-full bg-primary/60 mr-2" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
          
          <div className="mt-8 flex flex-col items-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#0066FF] to-[#00F6A3] hover:from-[#0052CC] hover:to-[#00E69D] text-white shadow-lg hover:shadow-xl transition-all duration-300 mb-6 px-8"
              onClick={onStartBuilding}
            >
              Start Building Your Stack
            </Button>
            
            <div className="mb-6 flex items-center justify-center gap-2 text-sm">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-primary hover:bg-blue-100 transition-colors cursor-pointer"
                onClick={onStartBuilding}
              >
                <Bot className="w-4 h-4" />
                <span>Need help? Tell us your goal and we'll build a quote for you</span>
              </div>
            </div>
            
            <Testimonials />
          </div>
        </div>
      </div>
    </div>
  );
}