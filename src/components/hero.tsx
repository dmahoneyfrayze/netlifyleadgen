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
  const handleStartBuilding = () => {
    onStartBuilding();
  };
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight mb-4 sm:mb-6">
          Build Your Custom Marketing Stack
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8">
          Select the services you need and get a personalized quote in minutes
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {categories.map((category) => (
            <Button
              key={category.name}
              variant="outline"
              size="lg"
              className="h-auto py-3 sm:py-4 px-4 sm:px-6 flex flex-col items-center justify-center gap-2 text-sm sm:text-base"
              onClick={handleStartBuilding}
            >
              <category.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="font-medium">{category.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}