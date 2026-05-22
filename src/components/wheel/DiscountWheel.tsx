import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

export interface WheelOption {
  value: number;
  weight: number;
}

interface DiscountWheelProps {
  options: WheelOption[];
  onSpinEnd: (value: number) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
  targetValue: number | null;
}

export const DiscountWheel: React.FC<DiscountWheelProps> = ({ 
  options, 
  onSpinEnd, 
  isSpinning, 
  setIsSpinning,
  targetValue
}) => {
  const [rotation, setRotation] = useState(0);
  const controls = useAnimation();
  
  const COLORS = [
    '#F97316', // Orange
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#EAB308', // Yellow
  ];

  const sliceAngle = 360 / options.length;

  useEffect(() => {
    if (isSpinning && targetValue !== null) {
      // Find index of target
      const targetIndex = options.findIndex(opt => opt.value === targetValue);
      if (targetIndex === -1) return;

      // Calculate where to stop
      // The pointer is at the top (0 degrees or 270 depending on how SVG is drawn).
      // Let's assume pointer is at Top (0 degrees for the wheel container)
      const targetSliceCenterAngle = (targetIndex * sliceAngle) + (sliceAngle / 2);
      
      // We want the wheel to spin multiple times (e.g., 5 full rotations = 1800 degrees)
      // and land such that the top pointer points to the target slice.
      // So final rotation = 1800 + (360 - targetSliceCenterAngle)
      
      // Add a slight random offset inside the slice so it doesn't always land dead center
      const randomOffset = (Math.random() - 0.5) * (sliceAngle * 0.6); 
      
      const newRotation = rotation + 1800 + (360 - targetSliceCenterAngle) + randomOffset;
      
      controls.start({
        rotate: newRotation,
        transition: {
          duration: 4,
          ease: [0.15, 0.9, 0.25, 1], // Custom bouncy/casino ease
        }
      }).then(() => {
        setRotation(newRotation % 360);
        setIsSpinning(false);
        onSpinEnd(targetValue);
      });
    }
  }, [isSpinning, targetValue, options, controls, rotation, sliceAngle, onSpinEnd, setIsSpinning]);

  return (
    <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] mx-auto filter drop-shadow-[0_0_25px_rgba(249,115,22,0.4)]">
      
      {/* Outer Glow & Border */}
      <div className="absolute inset-0 rounded-full border-4 border-brand-orange/40 bg-[#0B1020] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Wheel SVG */}
        <motion.div 
          className="w-full h-full relative"
          animate={controls}
          initial={{ rotate: rotation }}
          style={{ transformOrigin: 'center center' }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {options.map((option, i) => {
              const startAngle = i * sliceAngle;
              const endAngle = (i + 1) * sliceAngle;
              
              // SVG path calculations
              const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
              const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
              const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
              const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
              
              const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
              const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
              
              // Text positioning
              const textAngle = startAngle + sliceAngle / 2;
              const textRadius = 35; // How far from center
              const tx = 50 + textRadius * Math.cos((Math.PI * textAngle) / 180);
              const ty = 50 + textRadius * Math.sin((Math.PI * textAngle) / 180);

              return (
                <g key={i}>
                  <path 
                    d={pathData} 
                    fill={COLORS[i % COLORS.length]} 
                    stroke="#111"
                    strokeWidth="0.5"
                  />
                  <text
                    x={tx}
                    y={ty}
                    fill="white"
                    fontSize="6"
                    fontWeight="900"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textAngle}, ${tx}, ${ty})`}
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                  >
                    {option.value}%
                  </text>
                </g>
              );
            })}
            
            {/* Center Hub */}
            <circle cx="50" cy="50" r="12" fill="#0B1020" stroke="#F97316" strokeWidth="2" />
            <circle cx="50" cy="50" r="4" fill="#F97316" />
          </svg>
        </motion.div>
      </div>

      {/* Pointer at the top */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
        <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 32L0 0H24L12 32Z" fill="#F97316" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
        </svg>
      </div>

    </div>
  );
};
