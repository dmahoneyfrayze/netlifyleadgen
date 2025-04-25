import { type Addon, type Category } from "@/types";

export const coreSystems: Addon[] = [
  {
    id: "local-starter",
    name: "Local Starter System",
    description: "Perfect for solo operators or local businesses starting with automation. Includes branded funnel, CRM, email/SMS sequences, and monthly reporting.",
    pricing: {
      type: "monthly",
      amount: 500
    },
    category: "core",
    tags: ["Starter", "CRM", "Automation"]
  },
  {
    id: "growth-engine",
    name: "Growth Engine System",
    description: "For businesses ready to scale with automation, AI, and advertising. Includes multi-step funnel, AI responder, call tracking, lead scoring, and content.",
    pricing: {
      type: "monthly",
      amount: 1250
    },
    category: "core",
    tags: ["Growth", "AI", "Marketing"]
  },
  {
    id: "enterprise-suite",
    name: "Enterprise System Suite",
    description: "Complete business operating system including CRM customization, employee automation, lead scoring, and one custom tool add-on.",
    pricing: {
      type: "monthly",
      amount: 3000
    },
    category: "core",
    tags: ["Enterprise", "Complete", "Custom"]
  }
];
export const addonCategories: Category[] = [
  { 
    id: "ai-recommended",
    name: "Recommended for You",
    emoji: "⭐",
    color: "yellow",
    subcategories: []
  },
  { 
    id: "ai", 
    name: "AI & Automation", 
    emoji: "🔊", 
    color: "blue",
    subcategories: [
      { id: "ai-voice", name: "Voice & Calls" },
      { id: "ai-chat", name: "Chat & Messaging" },
      { id: "ai-automation", name: "Smart Automation" }
    ]
  },
  { 
    id: "systems", 
    name: "Systems & Integration", 
    emoji: "⚙️", 
    color: "indigo",
    subcategories: [
      { id: "systems-crm", name: "CRM & Management" },
      { id: "systems-integration", name: "Integrations" },
      { id: "systems-billing", name: "Billing & Payments" }
    ]
  },
  { 
    id: "seo", 
    name: "SEO & Digital Presence", 
    emoji: "🌐", 
    color: "purple",
    subcategories: [
      { id: "seo-optimization", name: "SEO Optimization" },
      { id: "seo-content", name: "Content & Blogs" },
      { id: "seo-technical", name: "Technical SEO" }
    ]
  },
  { 
    id: "marketing", 
    name: "Lead Gen & Marketing", 
    emoji: "🎯", 
    color: "amber",
    subcategories: [
      { id: "marketing-ads", name: "Ads & Tracking" },
      { id: "marketing-forms", name: "Forms & Funnels" },
      { id: "marketing-analytics", name: "Analytics" }
    ]
  },
  { 
    id: "client", 
    name: "Client Experience & Admin", 
    emoji: "🔐", 
    color: "green",
    subcategories: [
      { id: "client-portal", name: "Client Portal" },
      { id: "client-communication", name: "Communication" },
      { id: "client-documents", name: "Documents" }
    ]
  }
];

// AI-driven recommendation bundles based on business profile
export const getRecommendedAddons = (profile: {
  businessType: string;
  teamSize: string;
  mainGoal: string;
}) => {
  // Simple recommendation logic based on business profile
  const recommendations: Addon[] = [];
  
  // Basic recommendations for all profiles
  recommendations.push(
    addons.find(a => a.id === "ai-inbox")!,
    addons.find(a => a.id === "appointment-bot")!
  );
  
  // Size-based recommendations
  if (profile.teamSize === "medium" || profile.teamSize === "large") {
    recommendations.push(
      addons.find(a => a.id === "hrm")!,
      addons.find(a => a.id === "multi-location")!
    );
  }
  
  // Goal-based recommendations
  if (profile.mainGoal === "leads") {
    recommendations.push(
      addons.find(a => a.id === "lead-scoring")!,
      addons.find(a => a.id === "full-seo")!,
      addons.find(a => a.id === "ads-integration")!
    );
  } else if (profile.mainGoal === "automation") {
    recommendations.push(
      addons.find(a => a.id === "ai-voice-agent")!,
      addons.find(a => a.id === "workflow-integration")!
    );
  }
  
  // Business type specific recommendations
  if (profile.businessType === "retail") {
    recommendations.push(
      addons.find(a => a.id === "ims")!,
      addons.find(a => a.id === "google-merchant")!
    );
  } else if (profile.businessType === "service") {
    recommendations.push(
      addons.find(a => a.id === "messaging-suite")!,
      addons.find(a => a.id === "esign")!
    );
  }
  
  return [...new Set(recommendations)];
};

export const addons: Addon[] = [
  {
    id: "ai-chat-bot",
    name: "AI Chat Assistant",
    description: "24/7 website chat bot with smart responses and lead capture",
    pricing: {
      type: "monthly",
      amount: 149
    },
    category: "ai",
    subcategory: "ai-chat",
    tags: ["AI", "Chat", "Support"]
  },
  {
    id: "smart-automation",
    name: "Smart Workflow Automation",
    description: "AI-powered workflow automation with custom triggers and actions",
    pricing: {
      type: "monthly",
      amount: 199
    },
    category: "ai",
    subcategory: "ai-automation",
    tags: ["AI", "Automation", "Workflow"]
  },
  {
    id: "ai-voice-agent-outbound",
    name: "AI Voice Agent (Outbound)",
    description: "Outbound calling automation for proactive engagement",
    pricing: {
      type: "inquire",
      note: "Volume-dependent pricing"
    },
    category: "ai",
    subcategory: "ai-voice",
    tags: ["AI", "Voice", "Automation", "Outbound"]
  },
  {
    id: "ai-inbox",
    name: "AI Inbox Responder",
    description: "Smart, GPT-powered SMS + email assistant trained on your brand",
    pricing: {
      type: "monthly",
      amount: 199
    },
    category: "ai",
    tags: ["AI", "Email", "Support"]
  },
  {
    id: "lead-scoring",
    name: "Lead Scoring Engine",
    description: "Daily AI-driven lead scoring + summary reports",
    pricing: {
      type: "monthly",
      amount: 59
    },
    category: "marketing",
    tags: ["Analytics", "Sales", "AI"]
  },
  {
    id: "appointment-bot",
    name: "Smart Appointment Bot",
    description: "Automated calendar booking + follow-ups",
    pricing: {
      type: "monthly",
      amount: 49
    },
    category: "ai",
    tags: ["Scheduling", "Automation"],
    requirements: ["any AI service"]
  },
  {
    id: "workflow-integration",
    name: "Custom Workflow Integration",
    description: "Bespoke automation flow development across your tools",
    pricing: {
      type: "inquire"
    },
    category: "systems",
    tags: ["Integration", "Workflow", "Automation"]
  },
  {
    id: "crm-basic",
    name: "Basic CRM Setup",
    description: "Essential CRM setup with custom fields and basic automation",
    pricing: {
      type: "monthly",
      amount: 99
    },
    category: "systems",
    subcategory: "systems-crm",
    tags: ["CRM", "Basic", "Setup"]
  },
  {
    id: "zapier-pro",
    name: "Zapier Pro Integration",
    description: "Connect your tools with premium Zapier workflows",
    pricing: {
      type: "monthly",
      amount: 149
    },
    category: "systems",
    subcategory: "systems-integration",
    tags: ["Integration", "Automation"]
  },
  {
    id: "stripe-connect",
    name: "Stripe Payment Integration",
    description: "Full Stripe payment processing setup with webhooks",
    pricing: {
      type: "monthly",
      amount: 79
    },
    category: "systems",
    subcategory: "systems-billing",
    tags: ["Payments", "Integration"]
  },
  {
    id: "ims",
    name: "Inventory Management System",
    description: "Multi-location product tracking with CRM sync",
    pricing: {
      type: "inquire"
    },
    category: "systems",
    tags: ["Inventory", "Management"]
  },
  {
    id: "hrm",
    name: "HRM Suite",
    description: "Employee onboarding, tasks, checklists, and digital forms",
    pricing: {
      type: "inquire"
    },
    category: "systems",
    tags: ["HR", "Management", "Employees"]
  },
  {
    id: "crm-custom",
    name: "CRM Custom Build",
    description: "Tailored sales pipelines, smart fields, and AI logic",
    pricing: {
      type: "inquire"
    },
    category: "systems",
    tags: ["CRM", "Custom", "Business"]
  },
  {
    id: "stripe-billing",
    name: "Stripe Subscription Billing",
    description: "Automated subscription billing + CRM integration",
    pricing: {
      type: "one-time",
      amount: 250
    },
    category: "systems",
    tags: ["Payments", "Automation"]
  },
  {
    id: "multi-location",
    name: "Multi-Location CRM Sync",
    description: "Unified lead routing across store accounts or regions",
    pricing: {
      type: "inquire"
    },
    category: "systems",
    tags: ["CRM", "Multi-location"]
  },
  {
    id: "seo-blog",
    name: "AI-Powered SEO Blog Engine",
    description: "Monthly blog automation with DALL·E visuals, metadata, and posting",
    pricing: {
      type: "inquire"
    },
    category: "seo",
    tags: ["SEO", "Content", "AI"]
  },
  {
    id: "schema-audit",
    name: "Schema & SEO Audit",
    description: "Rich snippets, metadata, and technical cleanup",
    pricing: {
      type: "one-time",
      amount: 349
    },
    category: "seo",
    tags: ["SEO", "Technical", "Audit"]
  },
  {
    id: "google-merchant",
    name: "Google Merchant Feed Sync",
    description: "Industry-specific product/inventory feed integration",
    pricing: {
      type: "inquire"
    },
    category: "seo",
    tags: ["Google", "Products", "Ecommerce"]
  },
  {
    id: "full-seo",
    name: "Full SEO Services",
    description: "Ongoing strategy, keyword tracking, and content optimization",
    pricing: {
      type: "monthly",
      amount: 499
    },
    category: "seo",
    tags: ["SEO", "Strategy", "Content"]
  },
  {
    id: "promo-funnels",
    name: "Promo Funnels & Campaigns",
    description: "Custom lead magnet builds, giveaways, and ad flows",
    pricing: {
      type: "inquire",
      note: "Based on scope"
    },
    category: "marketing",
    tags: ["Marketing", "Lead Gen"]
  },
  {
    id: "multi-step-forms",
    name: "Multi-Step Lead Forms",
    description: "High-converting, mobile-ready multi-field lead capture",
    pricing: {
      type: "inquire"
    },
    category: "marketing",
    tags: ["Forms", "Conversion", "UX"]
  },
  {
    id: "ads-integration",
    name: "Ads Integration Bundle",
    description: "Meta, TikTok, Google pixel setup, audience syncing, UTM tracking",
    pricing: {
      type: "monthly",
      amount: 199
    },
    category: "marketing",
    tags: ["Advertising", "Integration"]
  },
  {
    id: "lead-attribution",
    name: "Lead Attribution Tracker",
    description: "Full source-to-sale tracking included with CRM",
    pricing: {
      type: "inquire"
    },
    category: "marketing",
    tags: ["Analytics", "Attribution"]
  },
  {
    id: "messaging-suite",
    name: "Omni-Channel Messaging Suite",
    description: "Central inbox across Facebook, Instagram, WhatsApp, LinkedIn, SMS, calls, and email",
    pricing: {
      type: "inquire"
    },
    category: "client",
    tags: ["Communication", "Integration"]
  },
  {
    id: "white-label",
    name: "Custom Client Portal",
    description: "Deliverables, reports, billing, and messaging in one branded space",
    pricing: {
      type: "inquire"
    },
    category: "client",
    tags: ["Branding", "Custom", "Portal"]
  },
  {
    id: "esign",
    name: "eSignatures & Documents",
    description: "Automated contract delivery + e-sign integration",
    pricing: {
      type: "one-time",
      amount: 299
    },
    category: "client",
    tags: ["Documents", "Automation"]
  },
  {
    id: "custom-integration",
    name: "Custom Integrations",
    description: "We connect anything to anything. If it has an API, we build it",
    pricing: {
      type: "inquire"
    },
    category: "systems",
    tags: ["Integration", "Custom", "API"]
  }
];