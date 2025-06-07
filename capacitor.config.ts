
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.biox.aguaflowcontrol',
  appName: 'BIOX - Sistema de Reparto',
  webDir: 'dist',
  bundledWebRuntime: false,
  // server: {
  //   url: "https://293fbde2-eb7e-436a-b129-0340718369ba.lovableproject.com?forceHideBadge=true",
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
      // Permisos básicos
      "android.permission.INTERNET",
      
      // Permisos de ubicación
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.ACCESS_BACKGROUND_LOCATION",
      
      // Permisos de notificaciones
      "android.permission.POST_NOTIFICATIONS",
      "android.permission.WAKE_LOCK",
      "android.permission.RECEIVE_BOOT_COMPLETED",
      
      // Permisos adicionales para mejor funcionamiento
      "android.permission.ACCESS_WIFI_STATE",
      "android.permission.ACCESS_NETWORK_STATE",
      "android.permission.VIBRATE"
    ]
  },
  ios: {
    permissions: [
      "NSLocationWhenInUseUsageDescription",
      "NSLocationAlwaysAndWhenInUseUsageDescription"
    ]
  }
};

export default config;
