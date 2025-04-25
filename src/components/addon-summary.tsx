import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, ArrowRight, Package, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { type Addon } from "@/types";
import { formatCurrency, formatPricing } from "@/lib/format-utils";

interface AddonSummaryProps {
  selected: Addon[];
  totalPrice: number;
  toggleAddon: (addon: Addon) => void;
  onNext: () => void;
}

export function AddonSummary({ selected, totalPrice, toggleAddon, onNext }: AddonSummaryProps) {
  const progressValue = Math.min(Math.max((selected.length / 5) * 100, 5), 100);
  const coreSystem = selected.find(addon => addon.category === "core");
  
  // Check if an addon is included in the core package
  const isIncludedInCore = (addonId: string) => {
    return coreSystem?.includes?.includes(addonId) || false;
  };
  
  return (
    <Card className="sticky top-6 shadow-lg border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-xl">Your Estimated System</CardTitle>
          <Badge variant="outline" className="font-normal bg-primary/5 px-3 py-1 border-primary/20">
            {selected.length} items
          </Badge>
        </div>
        
        {coreSystem && (
          <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg mb-3">
            <Package className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              Core System: {coreSystem.name}
            </span>
          </div>
        )}

        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Configure your stack</span>
            <span className="font-medium">{selected.length}/5+ recommended</span>
          </div>
          <Progress 
            value={progressValue} 
            className="h-2 bg-primary/10" 
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Estimated monthly total based on standard usage. Final pricing may vary.
        </p>
      </CardHeader>
      
      <CardContent className="pb-3">
        {selected.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <ShoppingCart className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground">
              Start building your custom system. <br />
              Click on items below to add to your quote.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
            <AnimatePresence>
              {/* Show core system first */}
              {selected.filter(addon => addon.category === "core").map((addon) => (
                <motion.div
                  key={addon.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="group relative"
                >
                  <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50/30">
                    <div className="flex-1">
                      <div className="font-medium">{addon.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatPricing(addon.pricing)}
                      </div>
                    </div>
                  </div>
                  <Separator />
                </motion.div>
              ))}
              
              {/* Then show all other add-ons */}
              {selected.filter(addon => addon.category !== "core").map((addon) => (
                <motion.div
                  key={addon.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="group relative"
                >
                  <div className="flex justify-between items-center p-3 rounded-lg hover:bg-primary/5 transition-colors duration-200">
                    <div className="flex-1">
                      <div className="font-medium flex items-center">
                        {addon.name}
                        {isIncludedInCore(addon.id) && (
                          <Badge className="ml-2 bg-green-100 text-green-700 border-green-200 px-2 py-0 text-xs font-normal">
                            <Check className="h-3 w-3 mr-1" />
                            Included
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {isIncludedInCore(addon.id) ? (
                          <span className="text-green-600 font-medium">No extra cost</span>
                        ) : (
                          formatPricing(addon.pricing)
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`transition-all duration-200 hover:bg-primary/10 ${
                        isIncludedInCore(addon.id) ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAddon(addon);
                      }}
                      disabled={isIncludedInCore(addon.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Separator />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col">
        <div className="flex justify-between items-center w-full p-3 bg-primary/5 rounded-lg">
          <div className="font-semibold">Total Estimated</div>
          <div className="text-lg font-bold">{formatCurrency(totalPrice)}</div>
        </div>
        
        <Button 
          disabled={selected.length === 0}
          size="lg"
          variant="default"
          onClick={onNext}
          className="w-full mt-3 group bg-gradient-to-r from-[#0066FF] to-[#00F6A3] hover:from-[#0052CC] hover:to-[#00E69D] transition-all duration-300"
        >
          <span>Request Full Quote</span>
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
        
        <Button 
          variant="ghost" 
          className="w-full mt-2 text-muted-foreground hover:text-foreground hover:bg-destructive/5" 
          onClick={() => toggleAddon(selected[0])}
          disabled={selected.length === 0}
        >
          Clear Selection
        </Button>
        
        <div className="flex items-center gap-2 mt-4 p-3 bg-muted/30 rounded-lg">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <p className="text-xs text-muted-foreground">
          This estimate is based on your selected tools. A Frayze expert will review your needs and follow up with a custom proposal.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}