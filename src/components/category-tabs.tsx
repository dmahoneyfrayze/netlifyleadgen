import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Bot, Globe, Target, Lock, Zap, BarChart3 } from "lucide-react";
import { type Category } from "@/types";
import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  showRecommended: boolean;
  activeSubcategory: string;
  setActiveCategory: (category: string) => void;
  setActiveSubcategory: (subcategory: string) => void;
}

export function CategoryTabs({ 
  categories, 
  activeCategory, 
  showRecommended,
  activeSubcategory,
  setActiveCategory,
  setActiveSubcategory
}: CategoryTabsProps) {
  const [showSubcategories, setShowSubcategories] = useState(true);
  const getSubcategoryColor = (category: string) => {
    switch (category) {
      case "ai":
        return "bg-blue-50 text-blue-600 hover:bg-blue-100";
      case "systems":
        return "bg-purple-50 text-purple-600 hover:bg-purple-100";
      case "marketing":
        return "bg-amber-50 text-amber-600 hover:bg-amber-100";
      case "seo":
        return "bg-emerald-50 text-emerald-600 hover:bg-emerald-100";
      case "client":
        return "bg-rose-50 text-rose-600 hover:bg-rose-100";
      default:
        return "bg-gray-50 text-gray-600 hover:bg-gray-100";
    }
  };
  
  const activeMainCategory = categories.find(c => c.id === activeCategory);

  return (
    <div className="space-y-6">
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="w-full h-auto flex flex-wrap gap-3 bg-transparent p-1 mb-3">
          <TabsTrigger 
            value="all"
            className={cn(
              "transition-all duration-300 px-6 py-3",
              "data-[state=active]:bg-[#0066FF] data-[state=active]:text-white data-[state=active]:shadow-lg",
              "data-[state=inactive]:bg-white data-[state=inactive]:hover:bg-[#F9FAFB] data-[state=inactive]:hover:shadow",
              "border border-border/40"
            )}
            onClick={() => setActiveSubcategory("")}
          >
            All Add-ons
          </TabsTrigger>
          
          {categories.filter(c => showRecommended || c.id !== "ai-recommended").map((category) => (
            <TabsTrigger 
              key={category.id} 
              value={category.id}
              className={cn(
                "transition-all duration-300 px-6 py-3",
                "data-[state=active]:bg-[#0066FF] data-[state=active]:text-white data-[state=active]:shadow-lg",
                "data-[state=inactive]:bg-white data-[state=inactive]:hover:bg-[#F9FAFB] data-[state=inactive]:hover:shadow",
                "border border-border/40"
              )}
              onClick={() => setActiveSubcategory("")}
            >
              <span className="mr-2">{category.emoji}</span>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
      {activeMainCategory?.subcategories && activeMainCategory.subcategories.length > 0 && (
        <div className="flex flex-wrap gap-3 p-1 sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Button
            variant="ghost"
            size="default"
            className={cn(
              "transition-all duration-300 font-medium",
              !activeSubcategory ? "bg-gradient-to-br from-[#0066FF] to-[#00F6A3] text-white shadow-md" : getSubcategoryColor(activeMainCategory.id),
              "border border-transparent"
            )}
            onClick={() => setActiveSubcategory("")}
          >
            All {activeMainCategory.name}
          </Button>
          {activeMainCategory.subcategories.map((sub) => (
            <Button
              key={sub.id}
              variant="ghost"
              size="default"
              className={cn(
                "transition-all duration-300 font-medium",
                activeSubcategory === sub.id ? "bg-gradient-to-br from-[#0066FF] to-[#00F6A3] text-white shadow-md" : getSubcategoryColor(activeMainCategory.id),
                "border border-transparent"
              )} 
              onClick={() => setActiveSubcategory(sub.id)}
            >
              {sub.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}