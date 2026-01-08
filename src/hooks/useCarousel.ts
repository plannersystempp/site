import { useState, useEffect } from 'react';

export const useCarousel = (items: any[], interval = 5000) => {
  const [current, setCurrent] = useState(0);
  
  const next = () => setCurrent((prev) => (prev + 1) % items.length);
  const prev = () => setCurrent((prev) => (prev - 1 + items.length) % items.length);
  
  useEffect(() => {
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [current, interval, items.length]);
  
  return { current, next, prev };
};