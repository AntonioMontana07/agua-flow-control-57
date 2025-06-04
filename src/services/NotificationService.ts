
import { Capacitor } from '@capacitor/core';

export class NotificationService {
  static async initialize() {
    if (!Capacitor.isNativePlatform()) {
      console.log('Notificaciones no disponibles en web');
      return false;
    }

    try {
      // Importación dinámica para evitar errores en web
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const { PushNotifications } = await import('@capacitor/push-notifications');
      
      console.log('Iniciando configuración de notificaciones...');
      
      // Solicitar permisos para notificaciones locales con manejo de errores
      try {
        const localPermissions = await LocalNotifications.requestPermissions();
        console.log('Permisos de notificaciones locales:', localPermissions);
      } catch (localError) {
        console.log('Error al solicitar permisos locales (continuando):', localError);
      }
      
      // Solicitar permisos para notificaciones push con manejo de errores
      try {
        let permStatus = await PushNotifications.checkPermissions();
        console.log('Estado actual de permisos push:', permStatus);
        
        if (permStatus.receive === 'prompt') {
          console.log('Solicitando permisos push...');
          permStatus = await PushNotifications.requestPermissions();
          console.log('Resultado de solicitud de permisos:', permStatus);
        }
        
        if (permStatus.receive === 'granted') {
          // Solo registrar si los permisos están garantizados
          try {
            await PushNotifications.register();
            console.log('Registro para push notifications exitoso');
          } catch (registerError) {
            console.log('Error al registrar push notifications (no crítico):', registerError);
          }
        } else {
          console.log('Permisos push no otorgados, continuando sin push notifications');
        }
      } catch (pushError) {
        console.log('Error con push notifications (continuando):', pushError);
      }

      console.log('Configuración de notificaciones completada');
      return true;
      
    } catch (error) {
      console.error('Error general al inicializar notificaciones:', error);
      return false;
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
