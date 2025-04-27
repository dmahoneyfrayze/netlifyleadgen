import { useState } from "react";
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
  image: string;
}

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Marketing Director",
      company: "TechStart Inc.",
      content: "Frayze helped us build a custom marketing stack that perfectly fits our needs. The process was smooth and the results have been outstanding.",
      image: "/testimonials/sarah.jpg"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "CEO",
      company: "GrowthLabs",
      content: "The level of customization and attention to detail was impressive. Our marketing team is now more efficient than ever.",
      image: "/testimonials/michael.jpg"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Digital Marketing Manager",
      company: "InnovateCo",
      content: "Working with Frayze was a game-changer for our business. Their expertise in building custom solutions is unmatched.",
      image: "/testimonials/emily.jpg"
    }
  ];

  const nextTestimonial = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev: number) => (prev + 1) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const prevTestimonial = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev: number) => (prev - 1 + testimonials.length) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="relative">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">What Our Clients Say</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              disabled={isAnimating}
              className="w-8 h-8 sm:w-10 sm:h-10"
            >
              <ChevronLeftIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              disabled={isAnimating}
              className="w-8 h-8 sm:w-10 sm:h-10"
            >
              <ChevronRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>

        <div className="relative h-[300px] sm:h-[250px]">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <Card className="h-full">
                <CardContent className="p-4 sm:p-6 lg:p-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 h-full">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-sm sm:text-base lg:text-lg font-medium mb-2">{testimonial.content}</p>
                    <div className="mt-4">
                      <p className="text-sm sm:text-base font-semibold">{testimonial.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-4 sm:mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-primary" : "bg-muted"
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}