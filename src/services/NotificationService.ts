
import { Capacitor } from '@capacitor/core';

export class NotificationService {
  private static hasPermission = false;

  static async initialize() {
    console.log('Inicializando sistema de notificaciones...');
    
    if (Capacitor.isNativePlatform()) {
      // En plataforma nativa, solicitar permisos para notificaciones locales
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        
        const permission = await LocalNotifications.requestPermissions();
        this.hasPermission = permission.display === 'granted';
        
        if (this.hasPermission) {
          console.log('Permisos de notificaciones locales concedidos');
        } else {
          console.log('Permisos de notificaciones locales denegados');
        }
      } catch (error) {
        console.log('Error al solicitar permisos de notificaciones:', error);
      }
    } else {
      // En web, solicitar permisos de notificaciones del navegador
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          this.hasPermission = true;
          console.log('Permisos de notificaciones web ya concedidos');
        } else if (Notification.permission !== 'denied') {
          const permission = await Notification.requestPermission();
          this.hasPermission = permission === 'granted';
          if (this.hasPermission) {
            console.log('Permisos de notificaciones web concedidos');
          } else {
            console.log('Permisos de notificaciones web denegados');
          }
        } else {
          console.log('Notificaciones web bloqueadas por el usuario');
        }
      } else {
        console.log('Notificaciones web no soportadas en este navegador');
      }
    }
    
    return this.hasPermission;
  }

  static async enviarNotificacionStock(producto: string, cantidad: number, minimo: number) {
    const titulo = 'Stock Bajo - BIOX';
    const mensaje = `${producto}: ${cantidad} unidades (mín: ${minimo})`;
    
    if (Capacitor.isNativePlatform() && this.hasPermission) {
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        
        await LocalNotifications.schedule({
          notifications: [
            {
              title: titulo,
              body: mensaje,
              id: Date.now(),
              schedule: { at: new Date(Date.now() + 1000) },
              sound: 'default',
              actionTypeId: '',
              extra: {
                type: 'stock',
                producto: producto
              }
            }
          ]
        });
        
        console.log(`✅ Notificación de stock enviada: ${producto}`);
        return true;
      } catch (error) {
        console.log('Error al enviar notificación de stock nativa:', error);
      }
    }
    
    // Fallback a notificación web
    if (this.hasPermission && 'Notification' in window) {
      try {
        new Notification(titulo, {
          body: mensaje,
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
        console.log(`✅ Notificación web de stock enviada: ${producto}`);
        return true;
      } catch (error) {
        console.log('Error al enviar notificación web de stock:', error);
      }
    }
    
    // Fallback a console
    console.log(`📢 STOCK BAJO: ${mensaje}`);
    return false;
  }

  static async enviarNotificacionPedido(cliente: string, producto: string, total: number) {
    const titulo = 'Nuevo Pedido - BIOX';
    const mensaje = `${cliente} - ${producto} (S/${total.toFixed(2)})`;
    
    if (Capacitor.isNativePlatform() && this.hasPermission) {
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        
        await LocalNotifications.schedule({
          notifications: [
            {
              title: titulo,
              body: mensaje,
              id: Date.now(),
              schedule: { at: new Date(Date.now() + 1000) },
              sound: 'default',
              actionTypeId: '',
              extra: {
                type: 'pedido',
                cliente: cliente
              }
            }
          ]
        });
        
        console.log(`✅ Notificación de pedido enviada: ${cliente}`);
        return true;
      } catch (error) {
        console.log('Error al enviar notificación de pedido nativa:', error);
      }
    }
    
    // Fallback a notificación web
    if (this.hasPermission && 'Notification' in window) {
      try {
        new Notification(titulo, {
          body: mensaje,
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
        console.log(`✅ Notificación web de pedido enviada: ${cliente}`);
        return true;
      } catch (error) {
        console.log('Error al enviar notificación web de pedido:', error);
      }
    }
    
    // Fallback a console
    console.log(`📢 NUEVO PEDIDO: ${mensaje}`);
    return false;
  }

  static async enviarNotificacionStockCritico(productos: Array<{nombre: string, cantidad: number, minimo: number}>) {
    if (productos.length === 0) return false;
    
    const titulo = 'Stock Crítico - BIOX';
    const mensaje = `${productos.length} productos necesitan reabastecimiento urgente`;
    
    if (Capacitor.isNativePlatform() && this.hasPermission) {
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        
        await LocalNotifications.schedule({
          notifications: [
            {
              title: titulo,
              body: mensaje,
              id: Date.now(),
              schedule: { at: new Date(Date.now() + 1000) },
              sound: 'default',
              actionTypeId: '',
              extra: {
                type: 'stock_critico',
                count: productos.length
              }
            }
          ]
        });
        
        console.log(`✅ Notificación de stock crítico enviada: ${productos.length} productos`);
        return true;
      } catch (error) {
        console.log('Error al enviar notificación de stock crítico nativa:', error);
      }
    }
    
    // Fallback a notificación web
    if (this.hasPermission && 'Notification' in window) {
      try {
        new Notification(titulo, {
          body: mensaje,
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
        console.log(`✅ Notificación web de stock crítico enviada: ${productos.length} productos`);
        return true;
      } catch (error) {
        console.log('Error al enviar notificación web de stock crítico:', error);
      }
    }
    
    // Fallback a console
    console.log(`📢 STOCK CRÍTICO: ${mensaje}`);
    return false;
  }

  static getPermissionStatus(): boolean {
    return this.hasPermission;
  }
}
