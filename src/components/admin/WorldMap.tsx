// src/components/admin/WorldMap.tsx - Placeholder map component using react-simple-maps
import React from 'react';

// Simple placeholder world map – a stylized SVG circle representing the globe
export const WorldMap: React.FC = () => (
  <svg viewBox="0 0 200 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    {/* Dark background */}
    <rect width="200" height="100" fill="#0B1020" />
    {/* Simple globe outline */}
    <ellipse cx="100" cy="50" rx="80" ry="40" fill="#050505" stroke="#FF6A00" strokeWidth="2" />
    {/* Sample continents (abstract shapes) */}
    <path d="M70,50 q10,-20 20,0 q15,10 25,-10" fill="#0B1020" stroke="#FF7A00" strokeWidth="1" />
    <path d="M120,45 q5,-15 15,0 q10,8 20,-5" fill="#0B1020" stroke="#FF7A00" strokeWidth="1" />
  </svg>
);

export default WorldMap;
