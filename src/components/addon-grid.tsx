import { motion } from "framer-motion";
import { type Addon } from "@/types";
import { AddonCard } from "@/components/addon-card";
import { Bot, Globe, Target, Lock, Zap, BarChart3 } from "lucide-react";

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "ai":
      return Bot;
    case "seo":
      return Globe;
    case "marketing":
      return Target;
    case "client":
      return Lock;
    case "systems":
      return Zap;
    default:
      return BarChart3;
  }
};

interface AddonGridProps {
  addons: Addon[];
  selected: Addon[];
  toggleAddon: (addon: Addon) => void;
}

export function AddonGrid({ addons, selected, toggleAddon }: AddonGridProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0
    }
  };

  // Find the core system if one is selected
  const selectedCore = selected.find(addon => addon.category === "core");
  
  // Check if an addon is included in the core system
  const isIncludedInCore = (addonId: string) => {
    return selectedCore?.includes?.includes(addonId) || false;
  };

  const sortedAddons = addons.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <motion.div 
      layout 
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
      initial="hidden"
      animate="show"
      variants={container}
    >
      {sortedAddons.map((addon) => (
        <motion.div 
          key={addon.id} 
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          variants={item}
        >
          <AddonCard
            addon={addon}
            isSelected={selected.some(a => a.id === addon.id)}
            onToggle={() => toggleAddon(addon)}
            isIncludedInCore={isIncludedInCore(addon.id)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}