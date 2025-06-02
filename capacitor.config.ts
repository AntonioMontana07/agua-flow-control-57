
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.biox.aguaflowcontrol',
  appName: 'BIOX - Sistema de Reparto',
  webDir: 'dist',
  server: {
    url: 'https://7c06eb89-abb6-42c3-9b5f-0baf861c8e06.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;
