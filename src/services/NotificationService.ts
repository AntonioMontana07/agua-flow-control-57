
import { Capacitor } from '@capacitor/core';

interface PermissionStatus {
  receive: 'prompt' | 'prompt-with-rationale' | 'granted' | 'denied';
}

export class NotificationService {
  static async initialize() {
    if (!Capacitor.isNativePlatform()) {
      console.log('Notificaciones no disponibles en web');
      return true; // En web siempre devolvemos true
    }

    try {
      // Importación dinámica para evitar errores en web
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const { PushNotifications } = await import('@capacitor/push-notifications');
      
      console.log('Iniciando configuración de notificaciones...');
      
      // Manejo de notificaciones locales con timeout
      try {
        const localPermissionPromise = LocalNotifications.requestPermissions();
        const localPermissions = await Promise.race([
          localPermissionPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
        console.log('Permisos de notificaciones locales:', localPermissions);
      } catch (localError) {
        console.log('Error al solicitar permisos locales (continuando sin notificaciones locales):', localError);
      }
      
      // Manejo de push notifications con timeout y sin bloquear la app
      try {
        let permStatus = await Promise.race([
          PushNotifications.checkPermissions(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout check')), 3000))
        ]) as PermissionStatus;
        console.log('Estado actual de permisos push:', permStatus);
        
        if (permStatus.receive === 'prompt') {
          console.log('Solicitando permisos push...');
          // Usar timeout más corto y no esperar indefinidamente
          try {
            permStatus = await Promise.race([
              PushNotifications.requestPermissions(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout request')), 8000))
            ]) as PermissionStatus;
            console.log('Resultado de solicitud de permisos:', permStatus);
          } catch (requestError) {
            console.log('Timeout o error en solicitud de permisos (continuando):', requestError);
            // Continuamos sin push notifications
            return true;
          }
        }
        
        // Solo intentar registrar si tenemos permisos explícitos
        if (permStatus.receive === 'granted') {
          try {
            await Promise.race([
              PushNotifications.register(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout register')), 3000))
            ]);
            console.log('Registro para push notifications exitoso');
          } catch (registerError) {
            console.log('Error al registrar push notifications (no crítico):', registerError);
          }
        } else {
          console.log('Permisos push no otorgados o denegados, continuando sin push notifications');
        }
      } catch (pushError) {
        console.log('Error general con push notifications (continuando):', pushError);
      }

      console.log('Configuración de notificaciones completada exitosamente');
      return true;
      
    } catch (error) {
      console.error('Error general al inicializar notificaciones (continuando sin notificaciones):', error);
      // Siempre devolvemos true para no bloquear la app
      return true;
    }
  }

  static async enviarNotificacionStock(producto: string, cantidad: number, minimo: number) {
    if (!Capacitor.isNativePlatform()) return false;

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      
      await LocalNotifications.schedule({
        notifications: [
          {
            title: '⚠️ Stock Bajo - BIOX',
            body: `${producto}: ${cantidad} unidades (mín: ${minimo})`,
            id: Date.now(),
            schedule: { at: new Date(Date.now() + 1000) },
            sound: 'default',
            attachments: undefined,
            actionTypeId: 'stock_alert',
            extra: {
              tipo: 'stock',
              producto: producto,
              cantidad: cantidad
            }
          }
        ]
      });
      console.log(`Notificación de stock enviada para: ${producto}`);
      return true;
    } catch (error) {
      console.error('Error al enviar notificación de stock (no crítico):', error);
      return false;
    }
  }

  static async enviarNotificacionPedido(cliente: string, producto: string, total: number) {
    if (!Capacitor.isNativePlatform()) return false;

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      
      await LocalNotifications.schedule({
        notifications: [
          {
            title: '📦 Nuevo Pedido - BIOX',
            body: `${cliente} - ${producto} (S/${total.toFixed(2)})`,
            id: Date.now(),
            schedule: { at: new Date(Date.now() + 1000) },
            sound: 'default',
            attachments: undefined,
            actionTypeId: 'new_order',
            extra: {
              tipo: 'pedido',
              cliente: cliente,
              producto: producto,
              total: total
            }
          }
        ]
      });
      console.log(`Notificación de pedido enviada para: ${cliente}`);
      return true;
    } catch (error) {
      console.error('Error al enviar notificación de pedido (no crítico):', error);
      return false;
    }
  }

  static async enviarNotificacionStockCritico(productos: Array<{nombre: string, cantidad: number, minimo: number}>) {
    if (!Capacitor.isNativePlatform() || productos.length === 0) return false;
    
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      
      const productosTexto = productos.map(p => `${p.nombre}: ${p.cantidad}`).join(', ');
      
      await LocalNotifications.schedule({
        notifications: [
          {
            title: '🚨 Stock Crítico - BIOX',
            body: `${productos.length} productos necesitan reabastecimiento: ${productosTexto}`,
            id: Date.now(),
            schedule: { at: new Date(Date.now() + 1000) },
            sound: 'default',
            attachments: undefined,
            actionTypeId: 'critical_stock',
            extra: {
              tipo: 'stock_critico',
              productos: productos
            }
          }
        ]
      });
      console.log('Notificación de stock crítico enviada');
      return true;
    } catch (error) {
      console.error('Error al enviar notificación de stock crítico (no crítico):', error);
      return false;
    }
  }
}
