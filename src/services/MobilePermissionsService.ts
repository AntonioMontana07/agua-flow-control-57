
import { Capacitor } from '@capacitor/core';

export class MobilePermissionsService {
  
  static async solicitarPermisosUbicacion(): Promise<{granted: boolean, status: string}> {
    console.log('📱 Solicitando permisos de ubicación...');
    
    if (Capacitor.isNativePlatform()) {
      try {
        const { Geolocation } = await import('@capacitor/geolocation');
        
        // Verificar permisos actuales
        const currentPermission = await Geolocation.checkPermissions();
        console.log('📍 Estado actual de permisos de ubicación:', currentPermission);
        
        if (currentPermission.location === 'granted') {
          console.log('✅ Permisos de ubicación ya concedidos');
          return { granted: true, status: 'granted' };
        }
        
        if (currentPermission.location === 'denied') {
          console.log('❌ Permisos de ubicación denegados permanentemente');
          return { 
            granted: false, 
            status: 'denied_permanently'
          };
        }
        
        // Solicitar permisos
        console.log('❓ Solicitando permisos de ubicación...');
        const requestResult = await Geolocation.requestPermissions();
        console.log('📝 Resultado de solicitud:', requestResult);
        
        return {
          granted: requestResult.location === 'granted',
          status: requestResult.location
        };
        
      } catch (error) {
        console.error('❌ Error al solicitar permisos de ubicación:', error);
        return { granted: false, status: 'error' };
      }
    } else {
      // En navegador web
      console.log('🌐 Plataforma web - usando navegador');
      
      if (!navigator.geolocation) {
        console.log('❌ Geolocalización no soportada');
        return { granted: false, status: 'not_supported' };
      }
      
      try {
        // En web, verificamos si podemos obtener la ubicación
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            enableHighAccuracy: false
          });
        });
        
        console.log('✅ Permisos de ubicación web concedidos');
        return { granted: true, status: 'granted' };
        
      } catch (error) {
        console.log('❌ Permisos de ubicación web denegados:', error);
        return { granted: false, status: 'denied' };
      }
    }
  }
  
  static async solicitarPermisosNotificaciones(): Promise<{granted: boolean, status: string}> {
    console.log('🔔 Solicitando permisos de notificaciones...');
    
    if (Capacitor.isNativePlatform()) {
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        
        // Verificar permisos actuales
        const currentPermission = await LocalNotifications.checkPermissions();
        console.log('🔔 Estado actual de permisos de notificaciones:', currentPermission);
        
        if (currentPermission.display === 'granted') {
          console.log('✅ Permisos de notificaciones ya concedidos');
          return { granted: true, status: 'granted' };
        }
        
        if (currentPermission.display === 'denied') {
          console.log('❌ Permisos de notificaciones denegados permanentemente');
          return { 
            granted: false, 
            status: 'denied_permanently'
          };
        }
        
        // Solicitar permisos
        console.log('❓ Solicitando permisos de notificaciones...');
        const requestResult = await LocalNotifications.requestPermissions();
        console.log('📝 Resultado de solicitud:', requestResult);
        
        return {
          granted: requestResult.display === 'granted',
          status: requestResult.display
        };
        
      } catch (error) {
        console.error('❌ Error al solicitar permisos de notificaciones:', error);
        return { granted: false, status: 'error' };
      }
    } else {
      // En navegador web
      console.log('🌐 Plataforma web - usando navegador');
      
      if (!('Notification' in window)) {
        console.log('❌ Notificaciones no soportadas');
        return { granted: false, status: 'not_supported' };
      }
      
      if (Notification.permission === 'granted') {
        console.log('✅ Permisos de notificaciones web ya concedidos');
        return { granted: true, status: 'granted' };
      }
      
      if (Notification.permission === 'denied') {
        console.log('❌ Permisos de notificaciones web denegados');
        return { granted: false, status: 'denied' };
      }
      
      // Solicitar permisos
      console.log('❓ Solicitando permisos de notificaciones web...');
      const permission = await Notification.requestPermission();
      console.log('📝 Resultado de solicitud:', permission);
      
      return {
        granted: permission === 'granted',
        status: permission
      };
    }
  }

  // NUEVO MÉTODO: Solicitar permisos automáticamente sin diálogos
  static async solicitarPermisosAutomaticamente(): Promise<{
    ubicacion: boolean;
    notificaciones: boolean;
    mensajes: string[];
  }> {
    console.log('🚀 Solicitando TODOS los permisos automáticamente al instalar...');
    
    const resultados = {
      ubicacion: false,
      notificaciones: false,
      mensajes: [] as string[]
    };
    
    try {
      // Solicitar ambos permisos en paralelo para Android
      const [ubicacionResult, notificacionesResult] = await Promise.all([
        this.solicitarPermisosUbicacion(),
        this.solicitarPermisosNotificaciones()
      ]);
      
      resultados.ubicacion = ubicacionResult.granted;
      resultados.notificaciones = notificacionesResult.granted;
      
      // Log de resultados sin mostrar diálogos al usuario
      if (ubicacionResult.granted) {
        console.log('✅ Ubicación: CONCEDIDA');
        resultados.mensajes.push('Ubicación activada');
      } else {
        console.log('❌ Ubicación: DENEGADA');
      }
      
      if (notificacionesResult.granted) {
        console.log('✅ Notificaciones: CONCEDIDAS');
        resultados.mensajes.push('Notificaciones activadas');
      } else {
        console.log('❌ Notificaciones: DENEGADAS');
      }
      
    } catch (error) {
      console.error('❌ Error en solicitud automática de permisos:', error);
      resultados.mensajes.push('Error al solicitar permisos');
    }
    
    console.log('📊 Permisos finales:', {
      ubicacion: resultados.ubicacion,
      notificaciones: resultados.notificaciones
    });
    
    return resultados;
  }
  
  static async verificarYSolicitarTodosLosPermisos(): Promise<{
    ubicacion: boolean;
    notificaciones: boolean;
    mensajes: string[];
  }> {
    console.log('🔐 Verificando y solicitando todos los permisos necesarios...');
    
    const resultados = {
      ubicacion: false,
      notificaciones: false,
      mensajes: [] as string[]
    };
    
    // Solicitar permisos de ubicación
    const ubicacionResult = await this.solicitarPermisosUbicacion();
    resultados.ubicacion = ubicacionResult.granted;
    
    if (ubicacionResult.granted) {
      resultados.mensajes.push('✅ Permisos de ubicación concedidos');
    } else {
      switch (ubicacionResult.status) {
        case 'denied_permanently':
          resultados.mensajes.push('❌ Permisos de ubicación denegados. Ve a Configuración > Aplicaciones > BIOX > Permisos');
          break;
        case 'denied':
          resultados.mensajes.push('❌ Permisos de ubicación denegados');
          break;
        case 'not_supported':
          resultados.mensajes.push('⚠️ Ubicación no soportada en este dispositivo');
          break;
        default:
          resultados.mensajes.push('❌ Error al obtener permisos de ubicación');
      }
    }
    
    // Solicitar permisos de notificaciones
    const notificacionesResult = await this.solicitarPermisosNotificaciones();
    resultados.notificaciones = notificacionesResult.granted;
    
    if (notificacionesResult.granted) {
      resultados.mensajes.push('✅ Permisos de notificaciones concedidos');
    } else {
      switch (notificacionesResult.status) {
        case 'denied_permanently':
          resultados.mensajes.push('❌ Permisos de notificaciones denegados. Ve a Configuración > Aplicaciones > BIOX > Notificaciones');
          break;
        case 'denied':
          resultados.mensajes.push('❌ Permisos de notificaciones denegados');
          break;
        case 'not_supported':
          resultados.mensajes.push('⚠️ Notificaciones no soportadas en este dispositivo');
          break;
        default:
          resultados.mensajes.push('❌ Error al obtener permisos de notificaciones');
      }
    }
    
    console.log('📊 Resumen de permisos:', resultados);
    return resultados;
  }
  
  static mostrarInstruccionesConfiguracion(plataforma: 'android' | 'ios' | 'web') {
    const instrucciones = {
      android: {
        ubicacion: 'Configuración > Aplicaciones > BIOX > Permisos > Ubicación > Permitir',
        notificaciones: 'Configuración > Aplicaciones > BIOX > Notificaciones > Activar'
      },
      ios: {
        ubicacion: 'Configuración > Privacidad y seguridad > Servicios de ubicación > BIOX > Permitir',
        notificaciones: 'Configuración > Notificaciones > BIOX > Permitir notificaciones'
      },
      web: {
        ubicacion: 'Configuración del navegador > Privacidad > Ubicación > Permitir para este sitio',
        notificaciones: 'Configuración del navegador > Notificaciones > Permitir para este sitio'
      }
    };
    
    return instrucciones[plataforma];
  }
}
