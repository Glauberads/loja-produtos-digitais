import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useLocation } from 'react-router-dom';

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pixelId, setPixelId] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchTrackingIds = async () => {
      try {
        const { data } = await supabase
          .from('public_settings')
          .select('value')
          .eq('id', 'tracking_ids')
          .single();

        if (data?.value) {
          const config = data.value as { pixel_id?: string; gtm_id?: string };
          if (config.pixel_id) setPixelId(config.pixel_id);
        }
      } catch (err) {
        // Silently ignore tracking fetch errors for visitors
      }
    };

    fetchTrackingIds();
  }, []);

  // Inject Meta Pixel
  useEffect(() => {
    if (!pixelId) return;

    // Previne múltiplas injeções
    if (document.getElementById('meta-pixel-init')) return;

    const script = document.createElement('script');
    script.id = 'meta-pixel-init';
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    const noscript = document.createElement('noscript');
    noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />`;
    document.head.appendChild(noscript);

  }, [pixelId]);

  // Track page views on route change if pixel is loaded
  useEffect(() => {
    if (pixelId && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [location, pixelId]);

  return <>{children}</>;
};

// Adiciona os tipos pro window.fbq
declare global {
  interface Window {
    fbq: any;
    dataLayer: any[];
  }
}
