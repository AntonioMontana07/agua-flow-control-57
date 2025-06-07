
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.biox.aguaflowcontrol',
  appName: 'BIOX - Sistema de Reparto',
  webDir: 'dist',
  bundledWebRuntime: false,
  // server: {
  //   url: "https://0d052641-7b9a-4737-8f01-403a821e2261.lovableproject.com?forceHideBadge=true",
  //   cleartext: true
  // },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav"
    },
    Geolocation: {
      permissions: {
        location: "always"
      }
    }
  },
  android: {
    permissions: [
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.ACCESS_BACKGROUND_LOCATION",
      "android.permission.POST_NOTIFICATIONS",
      "android.permission.WAKE_LOCK",
      "android.permission.RECEIVE_BOOT_COMPLETED"
    ]
  },
  ios: {
    permissions: [
      "NSLocationWhenInUseUsageDescription",
      "NSLocationAlwaysAndWhenInUseUsageDescription"
    ]
  ]
};

export default config;
