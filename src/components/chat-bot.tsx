import { useState, useEffect } from "react";
import { Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface ChatBotProps {
  onHelpMeChoose: () => void;
}

export function ChatBot({ onHelpMeChoose }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  
  // Handle idle time detection
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      if (!hasInteracted) {
        idleTimer = setTimeout(() => {
          setShouldShow(true);
        }, 10000); // 10 seconds
      }
    };
    
    // Reset timer on user activity
    const handleActivity = () => {
      resetIdleTimer();
    };
    
    // Add event listeners for user activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);
    
    // Start initial timer
    resetIdleTimer();
    
    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [hasInteracted]);
  
  // Handle leave intent detection
  useEffect(() => {
    let isNearTop = false;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!hasInteracted) {
        // Check if mouse is moving towards top of page
        if (e.clientY < 50 && !isNearTop) {
          isNearTop = true;
          setShouldShow(true);
        } else if (e.clientY > 100) {
          isNearTop = false;
        }
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [hasInteracted]);
  
  // Handle user interaction with chatbot
  const handleInteraction = () => {
    setHasInteracted(true);
    setShouldShow(false);
    setIsOpen(true);
  };
  
  const handleClose = () => {
    setIsOpen(false);
    setHasInteracted(true);
    setShouldShow(false);
  };

  if (!shouldShow && !isOpen) {
    return null;
  }

  if (!isOpen) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          className="rounded-full w-12 h-12 bg-gradient-to-r from-[#0066FF] to-[#00F6A3] hover:from-[#0052CC] hover:to-[#00E69D] shadow-lg hover:shadow-xl p-0"
          onClick={handleInteraction}
        >
          <Bot className="w-6 h-6 text-white" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-4 right-4 z-50 w-[300px] sm:w-[350px] md:w-[400px]"
    >
      <Card className="w-full overflow-hidden shadow-xl border-2">
        <div className="p-4 border-b bg-gradient-to-r from-[#0066FF]/10 to-[#00F6A3]/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <span className="font-semibold text-sm sm:text-base">Hello, I'm Frayzi</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/10"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-4">
          <p className="text-sm text-muted-foreground mb-4">
            Tell me about your business and I'll recommend the best tools for you.
          </p>
          
          <Button 
            className="w-full bg-gradient-to-r from-[#0066FF] to-[#00F6A3] hover:from-[#0052CC] hover:to-[#00E69D] text-white text-sm sm:text-base"
            onClick={() => {
              setHasInteracted(true);
              onHelpMeChoose();
            }}
          >
            Start Building My Stack
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}