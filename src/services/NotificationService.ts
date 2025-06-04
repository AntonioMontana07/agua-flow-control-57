
import { Capacitor } from '@capacitor/core';

interface PermissionStatus {
  receive: 'prompt' | 'prompt-with-rationale' | 'granted' | 'denied';
}

export class NotificationService {
  static async initialize() {
    if (!Capacitor.isNativePlatform()) {
      console.log('Notificaciones no disponibles en web');
      return true;
    }

    try {
      console.log('Iniciando configuración de notificaciones...');
      
      // Solo importar y usar notificaciones locales, evitar push notifications que pueden causar crashes
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      
      // Verificar si las notificaciones locales están disponibles
      try {
        const localPermissions = await LocalNotifications.checkPermissions();
        console.log('Estado de permisos locales:', localPermissions);
        
        // Solo solicitar permisos si es necesario y de forma no bloqueante
        if (localPermissions.display === 'prompt') {
          console.log('Solicitando permisos de notificaciones locales...');
          // Usar setTimeout para hacer la solicitud asíncrona y no bloqueante
          setTimeout(async () => {
            try {
              await LocalNotifications.requestPermissions();
              console.log('Permisos de notificaciones locales solicitados');
            } catch (error) {
              console.log('Error al solicitar permisos (no crítico):', error);
            }
          }, 1000);
        }
      } catch (localError) {
        console.log('Error con notificaciones locales (continuando):', localError);
      }

      console.log('Configuración de notificaciones completada');
      return true;
      
    } catch (error) {
      console.error('Error al inicializar notificaciones (continuando):', error);
      return true;
    }
  }

  static async enviarNotificacionStock(producto: string, cantidad: number, minimo: number) {
    if (!Capacitor.isNativePlatform()) return false;

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      
      // Verificar permisos antes de enviar
      const permissions = await LocalNotifications.checkPermissions();
      if (permissions.display !== 'granted') {
        console.log('Sin permisos para notificaciones');
        return false;
      }
      
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
      console.error('Error al enviar notificación de stock:', error);
      return false;
    }
  }

  static async enviarNotificacionPedido(cliente: string, producto: string, total: number) {
    if (!Capacitor.isNativePlatform()) return false;

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      
      // Verificar permisos antes de enviar
      const permissions = await LocalNotifications.checkPermissions();
      if (permissions.display !== 'granted') {
        console.log('Sin permisos para notificaciones');
        return false;
      }
      
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
      console.error('Error al enviar notificación de pedido:', error);
      return false;
    }
  }

  static async enviarNotificacionStockCritico(productos: Array<{nombre: string, cantidad: number, minimo: number}>) {
    if (!Capacitor.isNativePlatform() || productos.length === 0) return false;
    
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      
      // Verificar permisos antes de enviar
      const permissions = await LocalNotifications.checkPermissions();
      if (permissions.display !== 'granted') {
        console.log('Sin permisos para notificaciones');
        return false;
      }
      
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
      console.error('Error al enviar notificación de stock crítico:', error);
      return false;
    }
  }
}
