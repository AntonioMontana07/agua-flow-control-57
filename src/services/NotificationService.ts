
import { Capacitor } from '@capacitor/core';

export class NotificationService {
  static async initialize() {
    console.log('Sistema de notificaciones inicializado (modo básico)');
    return true;
  }

  static async enviarNotificacionStock(producto: string, cantidad: number, minimo: number) {
    if (!Capacitor.isNativePlatform()) {
      console.log(`Notificación de stock: ${producto} - ${cantidad} unidades`);
      return false;
    }

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Stock Bajo - BIOX',
            body: `${producto}: ${cantidad} unidades (mín: ${minimo})`,
            id: Date.now(),
            schedule: { at: new Date(Date.now() + 1000) }
          }
        ]
      });
      
      console.log(`Notificación de stock enviada para: ${producto}`);
      return true;
    } catch (error) {
      console.log('Notificación de stock no disponible:', error);
      return false;
    }
  }

  static async enviarNotificacionPedido(cliente: string, producto: string, total: number) {
    if (!Capacitor.isNativePlatform()) {
      console.log(`Notificación de pedido: ${cliente} - ${producto}`);
      return false;
    }

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Nuevo Pedido - BIOX',
            body: `${cliente} - ${producto} (S/${total.toFixed(2)})`,
            id: Date.now(),
            schedule: { at: new Date(Date.now() + 1000) }
          }
        ]
      });
      
      console.log(`Notificación de pedido enviada para: ${cliente}`);
      return true;
    } catch (error) {
      console.log('Notificación de pedido no disponible:', error);
      return false;
    }
  }

  static async enviarNotificacionStockCritico(productos: Array<{nombre: string, cantidad: number, minimo: number}>) {
    if (!Capacitor.isNativePlatform() || productos.length === 0) {
      console.log('Notificación de stock crítico:', productos.length, 'productos');
      return false;
    }
    
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Stock Crítico - BIOX',
            body: `${productos.length} productos necesitan reabastecimiento`,
            id: Date.now(),
            schedule: { at: new Date(Date.now() + 1000) }
          }
        ]
      });
      
      console.log('Notificación de stock crítico enviada');
      return true;
    } catch (error) {
      console.log('Notificación de stock crítico no disponible:', error);
      return false;
    }
  }
}
