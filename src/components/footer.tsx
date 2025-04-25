import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 mr-1.5 text-[#0066FF]" />
            Powered by Frayze
          </div>
          <div className="text-xs text-center text-muted-foreground">
            © {new Date().getFullYear()} Frayze. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}