/**
 * useFacebookPixel - Facebook Pixel management extracted from App.tsx
 */

import { useEffect } from 'react';
import type { FacebookPixelConfig } from '../types';

export function useFacebookPixel(facebookPixelConfig: FacebookPixelConfig) {
  useEffect(() => {
    const scriptId = 'facebook-pixel-script';
    const noScriptId = 'facebook-pixel-noscript';

    const removePixelArtifacts = () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) existingScript.remove();
      const existingNoScript = document.getElementById(noScriptId);
      if (existingNoScript) existingNoScript.remove();
    };

    if (!facebookPixelConfig?.isEnabled || !facebookPixelConfig.pixelId) {
      removePixelArtifacts();
      return;
    }

    removePixelArtifacts();
    const pixelId = facebookPixelConfig.pixelId.trim();
    const testEventId = facebookPixelConfig.enableTestEvent ? `TEST_${Date.now()}` : null;

    const loadPixel = () => {
      // Guard against double-initialization
      if (typeof (window as any).fbq === 'function') {
        (window as any).fbq('init', pixelId, undefined, testEventId ? { eventID: testEventId } : undefined);
        (window as any).fbq('track', 'PageView');
        return;
      }

      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.defer = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      script.onload = () => {
        if (typeof (window as any).fbq === 'function') {
          (window as any).fbq('init', pixelId, undefined, testEventId ? { eventID: testEventId } : undefined);
          (window as any).fbq('track', 'PageView');
        }
      };
      document.head.appendChild(script);

      const noscript = document.createElement('noscript');
      noscript.id = noScriptId;
      noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1${facebookPixelConfig.enableTestEvent ? '&cd[event_source_url]=test' : ''}" />`;
      document.body.appendChild(noscript);
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(loadPixel, { timeout: 1200 });
    } else {
      setTimeout(loadPixel, 1200);
    }

    return removePixelArtifacts;
  }, [facebookPixelConfig]);
}
