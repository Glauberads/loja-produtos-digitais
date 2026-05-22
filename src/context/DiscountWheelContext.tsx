import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Product } from '../data/products';
import { DiscountWheelModal } from '../components/wheel/DiscountWheelModal';

interface DiscountWheelContextData {
  wheelProduct: Product | null;
  isWheelOpen: boolean;
  openWheel: (product: Product) => void;
  closeWheel: () => void;
}

const DiscountWheelContext = createContext<DiscountWheelContextData>({} as DiscountWheelContextData);

export const useDiscountWheelContext = () => useContext(DiscountWheelContext);

interface DiscountWheelProviderProps {
  children: ReactNode;
}

export const DiscountWheelProvider: React.FC<DiscountWheelProviderProps> = ({ children }) => {
  const [wheelProduct, setWheelProduct] = useState<Product | null>(null);
  const [isWheelOpen, setIsWheelOpen] = useState(false);

  const openWheel = (product: Product) => {
    console.log("CONTEXT: ABRINDO ROLETA", product);
    setWheelProduct(product);
    setIsWheelOpen(true);
  };

  const closeWheel = () => {
    setIsWheelOpen(false);
  };

  return (
    <DiscountWheelContext.Provider value={{ wheelProduct, isWheelOpen, openWheel, closeWheel }}>
      {children}



      {/* Real Modal */}
      <DiscountWheelModal
        isOpen={isWheelOpen}
        product={wheelProduct}
        onClose={closeWheel}
      />
    </DiscountWheelContext.Provider>
  );
};
