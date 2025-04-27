import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "David Martinez",
    role: "Founder",
    company: "Elite Properties",
    content: "From chaos to clarity - Frayze transformed how we handle client communication and follow-ups."
  },
  {
    id: 2,
    name: "Sarah Johnson",
    role: "Marketing Director",
    company: "TechStart Inc.",
    content: "Frayze helped us build a custom marketing stack that perfectly fits our needs. The process was smooth and the results have been outstanding."
  },
  {
    id: 3,
    name: "Michael Chen",
    role: "CEO",
    company: "GrowthLabs",
    content: "The level of customization and attention to detail was impressive. Our marketing team is now more efficient than ever."
  }
];

export function Testimonials(): React.ReactElement {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const nextTestimonial = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const prevTestimonial = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div className="w-full bg-gradient-to-b from-white to-primary/5 py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              What Our Clients Say
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                disabled={isAnimating}
                className="w-8 h-8 sm:w-10 sm:h-10 hover:bg-primary/5 hover:border-primary/30"
              >
                <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                disabled={isAnimating}
                className="w-8 h-8 sm:w-10 sm:h-10 hover:bg-primary/5 hover:border-primary/30"
              >
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>

          <div className="relative h-[200px] sm:h-[180px]">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: index === currentIndex ? 1 : 0,
                  y: index === currentIndex ? 0 : 20,
                  pointerEvents: index === currentIndex ? "auto" : "none"
                }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                <Card className="h-full border-primary/10 bg-white/50 backdrop-blur-sm">
                  <CardContent className="p-6 sm:p-8 flex flex-col justify-center h-full text-center">
                    <p className="text-lg sm:text-xl font-medium mb-4 text-foreground/90">
                      "{testimonial.content}"
                    </p>
                    <div>
                      <p className="font-semibold text-base sm:text-lg text-foreground">
                        {testimonial.name}
                      </p>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-4">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  index === currentIndex ? "bg-primary" : "bg-primary/20"
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}