import { useCallback } from 'react';

export interface DiscountData {
  productId: string;
  discount: number;
  coupon: string;
  originalPrice: number;
  discountedPrice: number;
  expiresAt: number;
  createdAt: number;
}

const DISCOUNT_OPTIONS = [
  { value: 5, weight: 40 },
  { value: 7, weight: 25 },
  { value: 10, weight: 15 },
  { value: 12, weight: 10 },
  { value: 15, weight: 7 },
  { value: 20, weight: 3 }
];

export function useDiscountWheel() {
  const getStorageKey = (productId: string) => `nexus_discount_${productId}`;

  const getActiveDiscount = useCallback((productId: string): DiscountData | null => {
    try {
      const dataStr = localStorage.getItem(getStorageKey(productId));
      if (!dataStr) return null;
      
      const data: DiscountData = JSON.parse(dataStr);
      if (Date.now() > data.expiresAt) {
        localStorage.removeItem(getStorageKey(productId));
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }, []);

  const clearExpiredDiscount = useCallback((productId: string) => {
    localStorage.removeItem(getStorageKey(productId));
    // Trigger storage event so other tabs/components can update
    window.dispatchEvent(new Event('storage'));
  }, []);

  const generateCoupon = useCallback((productId: string, discountValue: number, originalPrice: number): DiscountData => {
    const discountedPrice = originalPrice * (1 - discountValue / 100);
    const data: DiscountData = {
      productId,
      discount: discountValue,
      coupon: `OFF${discountValue}`,
      originalPrice,
      discountedPrice,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
      createdAt: Date.now()
    };
    
    localStorage.setItem(getStorageKey(productId), JSON.stringify(data));
    window.dispatchEvent(new Event('storage'));
    return data;
  }, []);

  const spinWheel = useCallback((): number => {
    const totalWeight = DISCOUNT_OPTIONS.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const option of DISCOUNT_OPTIONS) {
      if (random < option.weight) {
        return option.value;
      }
      random -= option.weight;
    }
    return DISCOUNT_OPTIONS[0].value; // Fallback
  }, []);

  const buildCheckoutUrl = useCallback((checkoutUrl: string | undefined, discountData: DiscountData | null): string => {
    if (!checkoutUrl) return '#';
    if (!discountData) return checkoutUrl;

    try {
      const url = new URL(checkoutUrl);
      url.searchParams.set('coupon', discountData.coupon);
      url.searchParams.set('discount', discountData.discount.toString());
      url.searchParams.set('product_id', discountData.productId);
      return url.toString();
    } catch {
      // Fallback if URL is invalid or relative
      const separator = checkoutUrl.includes('?') ? '&' : '?';
      return `${checkoutUrl}${separator}coupon=${discountData.coupon}&discount=${discountData.discount}&product_id=${discountData.productId}`;
    }
  }, []);

  return {
    getActiveDiscount,
    clearExpiredDiscount,
    generateCoupon,
    spinWheel,
    buildCheckoutUrl,
    discountOptions: DISCOUNT_OPTIONS
  };
}
