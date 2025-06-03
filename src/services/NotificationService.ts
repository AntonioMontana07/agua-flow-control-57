
import { Capacitor } from '@capacitor/core';

export class NotificationService {
  static async initialize() {
    if (!Capacitor.isNativePlatform()) {
      console.log('Notificaciones no disponibles en web');
      return;
    }

    try {
      // Importación dinámica para evitar errores en web
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const { PushNotifications } = await import('@capacitor/push-notifications');
      
      // Solicitar permisos para notificaciones locales
      await LocalNotifications.requestPermissions();
      
      // Solicitar permisos para notificaciones push
      let permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }
      
      if (permStatus.receive !== 'granted') {
        throw new Error('Permisos de notificación no otorgados');
      }

      // Registrar para notificaciones push
      await PushNotifications.register();
      console.log('Notificaciones inicializadas correctamente');
      
    } catch (error) {
      console.error('Error al inicializar notificaciones:', error);
    }
  }

  static async enviarNotificacionStock(producto: string, cantidad: number, minimo: number) {
    if (!Capacitor.isNativePlatform()) return;

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
    } catch (error) {
      console.error('Error al enviar notificación de stock:', error);
    }
  }

  static async enviarNotificacionPedido(cliente: string, producto: string, total: number) {
    if (!Capacitor.isNativePlatform()) return;

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
    } catch (error) {
      console.error('Error al enviar notificación de pedido:', error);
    }
  }

  static async enviarNotificacionStockCritico(productos: Array<{nombre: string, cantidad: number, minimo: number}>) {
    if (!Capacitor.isNativePlatform() || productos.length === 0) return;
    
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
    } catch (error) {
      console.error('Error al enviar notificación de stock crítico:', error);
    }
  }
}
