import { motion } from "framer-motion";
import { type Addon } from "@/types";
import { AddonCard } from "@/components/addon-card";
import React from "react";

interface AddonGridProps {
  addons: Addon[];
  selected: Addon[];
  onToggle: (addon: Addon) => void;
  selectedCore: Addon | null;
}

export function AddonGrid({ addons, selected, onToggle, selectedCore }: AddonGridProps): React.ReactElement {
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

  // Check if an addon is included in the core system
  const isIncludedInCore = (addonId: string): boolean => {
    return selectedCore?.includes?.includes(addonId) || false;
  };

  const sortedAddons = addons.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <motion.div 
      layout 
      className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2 xs:gap-3 sm:gap-4 md:gap-6 px-0.5 xs:px-0"
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
          className="min-w-[220px] xs:min-w-0"
        >
          <AddonCard
            addon={addon}
            isSelected={selected.some(a => a.id === addon.id)}
            onToggle={() => onToggle(addon)}
            isIncludedInCore={isIncludedInCore(addon.id)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}