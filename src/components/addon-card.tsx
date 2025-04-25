import { 
  CheckCircle, 
  Package, 
  Bot, 
  Target, 
  Lock, 
  Zap, 
  MessageSquare, 
  Mail, 
  FileText, 
  Calendar, 
  Search, 
  Code, 
  CreditCard,
  ShoppingCart,
  LayoutDashboard,
  FileCog,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { type Addon } from "@/types";
import { cn } from "@/lib/utils";
import { formatPricing } from "@/lib/format-utils";

interface AddonCardProps {
  addon: Addon;
  isSelected: boolean;
  onToggle: () => void;
  isIncludedInCore?: boolean;
}

// Function to get appropriate icon based on addon properties
const getAddonIcon = (addon: Addon) => {
  // Check by ID first for specific services
  switch (addon.id) {
    case "ai-chat-bot":
      return <MessageSquare className="w-5 h-5" />;
    case "ai-inbox":
      return <Mail className="w-5 h-5" />;
    case "seo-blog":
      return <FileText className="w-5 h-5" />;
    case "appointment-bot":
      return <Calendar className="w-5 h-5" />;
    case "crm-basic":
    case "crm-custom":
      return <LayoutDashboard className="w-5 h-5" />;
    case "google-merchant":
      return <ShoppingCart className="w-5 h-5" />;
    case "esign":
      return <FileCog className="w-5 h-5" />;
    case "stripe-connect":
    case "stripe-billing":
      return <CreditCard className="w-5 h-5" />;
    case "workflow-integration":
    case "custom-integration":
    case "zapier-pro":
      return <Code className="w-5 h-5" />;
    case "lead-scoring":
    case "lead-attribution":
      return <Target className="w-5 h-5" />;
  }
  
  // Fall back to category for general icons
  switch (addon.category) {
    case "ai":
      return <Bot className="w-5 h-5" />;
    case "seo":
      return <Search className="w-5 h-5" />;
    case "marketing":
      return <Target className="w-5 h-5" />;
    case "client":
      return <Lock className="w-5 h-5" />;
    case "systems":
      return <Zap className="w-5 h-5" />;
    default:
      return <Sparkles className="w-5 h-5" />;
  }
};

export function AddonCard({ addon, isSelected, onToggle, isIncludedInCore = false }: AddonCardProps) {
  const addonIcon = getAddonIcon(addon);
  
  return (
    <Card
      className={cn(
        "cursor-pointer overflow-hidden transition-all duration-300 group hover:shadow-xl relative border-2 h-full min-h-[280px]",
        isSelected 
          ? "ring-2 ring-[#0066FF] border-[#0066FF] bg-gradient-to-br from-[#0066FF] to-[#00F6A3] text-white shadow-lg scale-[1.02]" 
          : isIncludedInCore 
            ? "border-green-300 bg-green-50 hover:bg-white hover:scale-[1.02]"
            : "hover:border-[#0066FF] hover:bg-white hover:scale-[1.02]"
      )}
      onClick={onToggle}
    >
      <CardContent className="p-0">
        <div className="relative h-full">
          {isSelected && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-2 right-2 p-1.5 bg-white/20 text-white rounded-full"
            >
              <CheckCircle className="w-5 h-5" />
            </motion.div>
          )}
          
          {isIncludedInCore && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-medium">
              <Package className="w-3 h-3" />
              Included in Core
            </div>
          )}
          
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-start justify-between mb-3">
              {addon.pricing && (
                <Badge 
                  variant="outline"
                  className={cn(
                    "text-xs font-medium px-3 py-1.5",
                    isSelected 
                      ? "bg-white/20 text-white border-white/30" 
                      : isIncludedInCore
                        ? "border-green-400 text-green-700 bg-green-100/50"
                        : "border-[#0066FF] text-[#0066FF] bg-[#0066FF]/5"
                  )}
                >
                  {isIncludedInCore ? "Included" : formatPricing(addon.pricing)}
                  {addon.pricing.type === 'monthly' && !isIncludedInCore && (
                    <span className="ml-1">📦</span>
                  )}
                </Badge>
              )}
              <div className={cn(
                "text-xs",
                isSelected ? "text-white/70" : "text-muted-foreground"
              )}>
                {isIncludedInCore 
                  ? "Part of your core package" 
                  : addon.pricing?.type === 'monthly' ? "Packaged pricing" : ""}
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-md flex items-center justify-center",
                  isSelected ? "bg-white/20" : "bg-[#0066FF]/10"
                )}>
                  <span className={isSelected ? "text-white" : "text-[#0066FF]"}>
                    {addonIcon}
                  </span>
                </div>
                <h3 className={cn(
                  "text-lg font-semibold",
                  !isSelected && "text-[#1F2937] group-hover:text-[#0066FF] transition-colors duration-300"
                )}>
                  {addon.name}
                </h3>
              </div>
            
              <p className={cn(
                "text-sm",
                isSelected ? "text-white/80" : "text-[#6B7280]"
              )}>
                {addon.description}
              </p>

              {addon.requirements && (
                <>
                  <Separator className={cn(
                    "my-3",
                    isSelected ? "bg-white/20" : "bg-border/60"
                  )} />
                  <p className={cn(
                    "text-sm italic",
                    isSelected ? "text-white/70" : "text-muted-foreground"
                  )}>
                    Requires: {addon.requirements.join(', ')}
                  </p>
                </>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {addon.tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className={cn(
                    "text-xs font-medium",
                    isSelected 
                      ? "bg-white/20 text-white border border-white/30" 
                      : "bg-[#F9FAFB] text-[#6B7280] border border-border/60"
                  )}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}