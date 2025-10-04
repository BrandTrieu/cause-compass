"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { useEffect, useRef } from "react";

interface InfiniteScrollCardsProps {
  children: React.ReactNode;
  direction?: "left" | "right";
  speed?: number; // seconds for one complete cycle
  className?: string;
}

export default function InfiniteScrollCards({
  children,
  direction = "left",
  speed = 50,
  className = "",
}: InfiniteScrollCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    // Set the animation duration based on speed
    const animationDuration = speed;
    scrollContainer.style.animationDuration = `${animationDuration}s`;

    // Ensure the animation starts immediately
    scrollContainer.style.animation = `scroll-${direction} ${animationDuration}s linear infinite`;
  }, [direction, speed]);

  return (
    <div 
      ref={containerRef} 
      className={`relative overflow-hidden ${className}`}
    >
      <div 
        ref={scrollContainerRef}
        className={`scroll-content flex animate-scroll-${direction}`}
        style={{ 
          '--animation-duration': `${speed}s`,
          width: 'max-content'
        } as React.CSSProperties}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
