import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const AFFILIATE_COOKIE_NAME = 'nexus_ref_code';
const COOKIE_EXPIRATION_DAYS = 60;

export function useAffiliateTracking() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref') || searchParams.get('aff');
    
    if (refCode) {
      // Salva no localStorage com timestamp para expiração manual
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + COOKIE_EXPIRATION_DAYS);
      
      const affiliateData = {
        code: refCode,
        expiresAt: expirationDate.getTime()
      };
      
      localStorage.setItem(AFFILIATE_COOKIE_NAME, JSON.stringify(affiliateData));
      console.log(`[Affiliate Tracking] Ref code '${refCode}' saved.`);
    }
  }, [searchParams]);
}

export function getAffiliateCode(): string | null {
  try {
    const dataStr = localStorage.getItem(AFFILIATE_COOKIE_NAME);
    if (!dataStr) return null;
    
    const data = JSON.parse(dataStr);
    
    // Verifica se expirou
    if (data.expiresAt && Date.now() > data.expiresAt) {
      localStorage.removeItem(AFFILIATE_COOKIE_NAME);
      return null;
    }
    
    return data.code;
  } catch (err) {
    console.error('Error reading affiliate code', err);
    return null;
  }
}
