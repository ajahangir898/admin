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

    const script = document.createElement('script');
    script.id = scriptId;
    script.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod? n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}'${testEventId ? `, {eventID: '${testEventId}'}` : ''});
fbq('track', 'PageView');`;
    document.head.appendChild(script);

    const noscript = document.createElement('noscript');
    noscript.id = noScriptId;
    noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1${facebookPixelConfig.enableTestEvent ? '&cd[event_source_url]=test' : ''}" />`;
    document.body.appendChild(noscript);

    return removePixelArtifacts;
  }, [facebookPixelConfig]);
}
