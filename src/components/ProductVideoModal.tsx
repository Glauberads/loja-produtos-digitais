import React from 'react';
import { X } from 'lucide-react';

interface ProductVideoModalProps {
  videoUrl: string;
  onClose: () => void;
}

export const ProductVideoModal: React.FC<ProductVideoModalProps> = ({ videoUrl, onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-4xl bg-brand-darkGray border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 animate-scaleIn">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h3 className="text-sm font-bold text-white">Demonstração</h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="relative w-full aspect-video bg-black">
          <iframe 
            src={videoUrl} 
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Video Demonstrativo"
          />
        </div>
      </div>
    </div>
  );
};
