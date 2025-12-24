/**
 * useThemeEffects - Theme application and persistence extracted from App.tsx
 */

import { useEffect, useRef } from 'react';
import type { ThemeConfig, WebsiteConfig } from '../types';
import { DataService, isKeyFromSocket, clearSocketFlag } from '../services/DataService';
import { hexToRgb } from '../utils/appHelpers';

interface UseThemeEffectsOptions {
  themeConfig: ThemeConfig | null;
  websiteConfig?: WebsiteConfig;
  activeTenantId: string;
  isLoading: boolean;
  currentView: string;
}

export function useThemeEffects({
  themeConfig,
  websiteConfig,
  activeTenantId,
  isLoading,
  currentView,
}: UseThemeEffectsOptions) {
  const themeLoadedRef = useRef(false);
  const lastSavedThemeRef = useRef<string>('');
  const websiteConfigLoadedRef = useRef(false);
  const lastSavedWebsiteConfigRef = useRef<string>('');

  // Reset on tenant change
  useEffect(() => {
    websiteConfigLoadedRef.current = false;
  }, [activeTenantId]);

  // Apply theme colors to CSS variables
  useEffect(() => { 
    if(!themeConfig || !activeTenantId) return;
    const root = document.documentElement;

    // Store theme colors - apply for ALL views (store needs these too)
    root.style.setProperty('--color-primary-rgb', hexToRgb(themeConfig.primaryColor));
    root.style.setProperty('--color-secondary-rgb', hexToRgb(themeConfig.secondaryColor));
    root.style.setProperty('--color-tertiary-rgb', hexToRgb(themeConfig.tertiaryColor));
    root.style.setProperty('--color-font-rgb', hexToRgb(themeConfig.fontColor));
    root.style.setProperty('--color-hover-rgb', hexToRgb(themeConfig.hoverColor));
    root.style.setProperty('--color-surface-rgb', hexToRgb(themeConfig.surfaceColor));

    // Admin-only theme tokens - only apply when admin shell is active
    const isAdminView = currentView === 'admin' || currentView === 'admin-login';
    if (!isAdminView) {
      ['--admin-bg','--admin-bg-input','--admin-border-rgb','--admin-focus-rgb']
        .forEach((key) => root.style.removeProperty(key));
      root.classList.remove('dark');
    } else {
      if (themeConfig.adminBgColor) {
        root.style.setProperty('--admin-bg', hexToRgb(themeConfig.adminBgColor));
      }
      if (themeConfig.adminInputBgColor) {
        root.style.setProperty('--admin-bg-input', hexToRgb(themeConfig.adminInputBgColor));
      }
      if (themeConfig.adminBorderColor) {
        root.style.setProperty('--admin-border-rgb', hexToRgb(themeConfig.adminBorderColor));
      }
      if (themeConfig.adminFocusColor) {
        root.style.setProperty('--admin-focus-rgb', hexToRgb(themeConfig.adminFocusColor));
      }
      
      if (themeConfig.darkMode) root.classList.add('dark');
      else root.classList.remove('dark');
    }
    
    // Only save to server AFTER initial data has loaded
    if(!isLoading && themeLoadedRef.current) {
      if (isKeyFromSocket('theme_config', activeTenantId)) {
        clearSocketFlag('theme_config', activeTenantId);
        lastSavedThemeRef.current = JSON.stringify(themeConfig);
        return;
      }
      
      const currentThemeStr = JSON.stringify(themeConfig);
      if (currentThemeStr !== lastSavedThemeRef.current) {
        lastSavedThemeRef.current = currentThemeStr;
        DataService.saveImmediate('theme_config', themeConfig, activeTenantId);
      }
    }
    
    if(!isLoading && !themeLoadedRef.current) {
      themeLoadedRef.current = true;
      lastSavedThemeRef.current = JSON.stringify(themeConfig);
    }
  }, [themeConfig, isLoading, activeTenantId, currentView]);

  // Website config persistence & favicon
  useEffect(() => { 
    if(!isLoading && websiteConfig && activeTenantId) {
      if (websiteConfigLoadedRef.current) {
        if (isKeyFromSocket('website_config', activeTenantId)) {
          clearSocketFlag('website_config', activeTenantId);
          lastSavedWebsiteConfigRef.current = JSON.stringify(websiteConfig);
        } else {
          const currentConfigStr = JSON.stringify(websiteConfig);
          if (currentConfigStr !== lastSavedWebsiteConfigRef.current) {
            lastSavedWebsiteConfigRef.current = currentConfigStr;
            DataService.saveImmediate('website_config', websiteConfig, activeTenantId);
          }
        }
      }
      
      if (!websiteConfigLoadedRef.current) {
        websiteConfigLoadedRef.current = true;
        lastSavedWebsiteConfigRef.current = JSON.stringify(websiteConfig);
      }
      
      if (websiteConfig.favicon) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = websiteConfig.favicon;
      }
    }
  }, [websiteConfig, isLoading, activeTenantId]);

  return {
    websiteConfigLoadedRef,
  };
}
