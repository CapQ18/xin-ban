'use client';

import * as React from 'react';

interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value: number[];
  onValueChange: (value: number[]) => void;
  className?: string;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ min = 0, max = 100, step = 1, value, onValueChange, className, ...props }, ref) => {
    return (
      <input
        type="range"
        ref={ref}
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={(e) => onValueChange([Number(e.target.value)])}
        className={`w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer ${className}`}
        {...props}
      />
    );
  }
);
Slider.displayName = 'Slider';

export { Slider };
