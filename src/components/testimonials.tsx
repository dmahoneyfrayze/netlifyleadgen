import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";

const testimonials = [
  {
    quote: "Our lead volume doubled in 30 days with Frayze's AI automation. The system practically runs itself.",
    name: "Michael Anderson",
    role: "CEO, Anderson Auto Group",
    industry: "Automotive"
  },
  {
    quote: "The seamless integration between tools saved our team 25+ hours per week. Worth every penny.",
    name: "Sarah Chen",
    role: "Operations Director, TechFlow Solutions",
    industry: "Technology"
  },
  {
    quote: "From chaos to clarity - Frayze transformed how we handle client communication and follow-ups.",
    name: "David Martinez",
    role: "Founder, Elite Properties",
    industry: "Real Estate"
  },
  {
    quote: "The AI-powered lead scoring changed our game. We're converting 40% more leads into clients.",
    name: "Rachel Thompson",
    role: "Marketing Director, Wellness Hub",
    industry: "Healthcare"
  },
  {
    quote: "Finally, a system that actually delivers ROI. Our customer acquisition cost dropped by 35%.",
    name: "James Wilson",
    role: "Growth Lead, Scale Commerce",
    industry: "E-commerce"
  }
];

export function Testimonials() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-gradient-to-b from-white/50 to-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-[1200px] mx-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <Card className="bg-white/95 backdrop-blur-sm border border-primary/20 h-full shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="px-6 md:px-16 py-10 text-center">
                  <p className="text-xl md:text-3xl font-medium text-[#1F2937] mb-8 leading-relaxed">
                    "{testimonials[currentTestimonial].quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0066FF]/10 to-[#00F6A3]/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-[#1F2937] text-lg">{testimonials[currentTestimonial].name}</div>
                      <div className="text-sm text-primary/80">{testimonials[currentTestimonial].role}</div>
                      <div className="text-xs text-muted-foreground">{testimonials[currentTestimonial].industry}</div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
          <div className="mt-6 flex justify-center gap-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentTestimonial === index 
                    ? 'bg-primary w-10' 
                    : 'bg-primary/20 hover:bg-primary/40'
                }`}
                onClick={() => setCurrentTestimonial(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}