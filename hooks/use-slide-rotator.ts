"use client";

import { useState, useEffect } from "react";

export function useSlideRotator(slideCount: number, intervalMs: number = 5000) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideCount);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [slideCount, intervalMs]);

  return currentSlide;
}
