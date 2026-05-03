import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdBannerProps {
  slot?: string;
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ 
  slot = '', 
  format = 'auto',
  className 
}) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div 
      className={cn(
        "w-full flex items-center justify-center bg-secondary/30 rounded-xl border border-border/50 overflow-hidden",
        format === 'horizontal' && "min-h-[90px]",
        format === 'vertical' && "min-h-[250px]",
        format === 'rectangle' && "min-h-[250px]",
        format === 'auto' && "min-h-[90px]",
        className
      )}
      ref={adRef}
    >
      {slot ? (
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', height: '100%' }}
          data-ad-client="ca-pub-2873764075574937"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      ) : (
        <div className="text-center py-6 text-muted-foreground text-sm">
          <div className="text-2xl mb-2">📢</div>
          <div className="font-medium">កន្លែងផ្សាយពាណិជ្ជកម្ម</div>
          <div className="text-xs opacity-60">កំណត់លេខផ្សាយក្នុង AdSense</div>
        </div>
      )}
    </div>
  );
};
