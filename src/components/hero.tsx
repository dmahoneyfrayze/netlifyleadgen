import { Target, Zap, Building2, Users, LineChart, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Testimonials } from "@/components/testimonials";
import React from 'react';

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

export function Hero({ onStartBuilding }: HeroProps): React.ReactElement {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-4 sm:mb-6">
          Build Your Custom Marketing Stack
        </h1>
        <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-8 sm:mb-10">
          Select the services you need and get a personalized quote in minutes
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.name}
                variant="outline"
                size="lg"
                className="h-auto py-4 sm:py-6 flex flex-col items-center justify-center gap-3 hover:border-primary/30 hover:bg-primary/5"
                onClick={onStartBuilding}
              >
                <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${category.color}`} />
                <span className="font-medium">{category.name}</span>
              </Button>
            );
          })}
        </div>
        <div className="flex flex-col items-center gap-4">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-[#0066FF] to-[#00F6A3] hover:from-[#0052CC] hover:to-[#00E69D] text-white px-8 py-6 text-lg h-auto"
            onClick={onStartBuilding}
          >
            Start Building Your Stack
          </Button>
          <button 
            onClick={onStartBuilding}
            className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors"
          >
            Need help? Tell us your goal and we'll build a quote for you
          </button>
        </div>
      </div>
      <Testimonials />
    </div>
  );
}