
import { Capacitor } from '@capacitor/core';

export interface NotificacionProgramada {
  id: string;
  tipo: 'stock' | 'pedido';
  titulo: string;
  mensaje: string;
  fechaHora: Date;
  repetir?: boolean;
  intervalo?: number; // en minutos
}

export class ScheduledNotificationService {
  private static notificacionesProgramadas: Map<string, NotificacionProgramada> = new Map();
  private static intervalos: Map<string, NodeJS.Timeout> = new Map();

  static async programarNotificacionStock(intervaloMinutos: number = 60) {
    const id = 'stock-reminder';
    
    // Cancelar notificación anterior si existe
    this.cancelarNotificacion(id);
    
    const notificacion: NotificacionProgramada = {
      id,
      tipo: 'stock',
      titulo: 'Recordatorio de Stock - BIOX',
      mensaje: 'Revisa el inventario y productos con stock bajo',
      fechaHora: new Date(Date.now() + intervaloMinutos * 60 * 1000),
      repetir: true,
      intervalo: intervaloMinutos
    };

    this.notificacionesProgramadas.set(id, notificacion);
    
    if (Capacitor.isNativePlatform()) {
      await this.programarNotificacionNativa(notificacion);
    } else {
      await this.programarNotificacionWeb(notificacion);
    }
    
    console.log(`✅ Notificación de stock programada cada ${intervaloMinutos} minutos`);
    return true;
  }

  static async programarNotificacionPedido(
    pedidoId: number,
    cliente: string,
    fechaEntrega: string,
    horaEntrega: string,
    minutosAntes: number = 30
  ) {
    const id = `pedido-${pedidoId}`;
    
    // Calcular fecha y hora de la notificación
    const fechaHoraEntrega = new Date(`${fechaEntrega}T${horaEntrega}`);
    const fechaNotificacion = new Date(fechaHoraEntrega.getTime() - minutosAntes * 60 * 1000);
    
    // Solo programar si la fecha es futura
    if (fechaNotificacion <= new Date()) {
      console.log('La fecha de notificación ya pasó, no se programa');
      return false;
    }

    const notificacion: NotificacionProgramada = {
      id,
      tipo: 'pedido',
      titulo: 'Recordatorio de Entrega - BIOX',
      mensaje: `Entrega para ${cliente} en ${minutosAntes} minutos`,
      fechaHora: fechaNotificacion,
      repetir: false
    };

    this.notificacionesProgramadas.set(id, notificacion);
    
    if (Capacitor.isNativePlatform()) {
      await this.programarNotificacionNativa(notificacion);
    } else {
      await this.programarNotificacionWeb(notificacion);
    }
    
    console.log(`✅ Notificación de pedido programada para ${fechaNotificacion.toLocaleString()}`);
    return true;
  }

  private static async programarNotificacionNativa(notificacion: NotificacionProgramada) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      
      if (notificacion.repetir && notificacion.intervalo) {
        // Para notificaciones repetitivas, programar múltiples notificaciones
        const notificaciones = [];
        for (let i = 0; i < 24; i++) { // Programar para las próximas 24 horas
          const fechaNotificacion = new Date(Date.now() + (notificacion.intervalo * 60 * 1000 * (i + 1)));
          notificaciones.push({
            title: notificacion.titulo,
            body: notificacion.mensaje,
            id: parseInt(notificacion.id.replace(/\D/g, '')) + i,
            schedule: { at: fechaNotificacion },
            sound: 'default',
            actionTypeId: '',
            extra: {
              tipo: notificacion.tipo,
              repetir: true
            }
          });
        }
        
        await LocalNotifications.schedule({ notifications: notificaciones });
      } else {
        // Notificación única
        await LocalNotifications.schedule({
          notifications: [{
            title: notificacion.titulo,
            body: notificacion.mensaje,
            id: parseInt(notificacion.id.replace(/\D/g, '')) || Date.now(),
            schedule: { at: notificacion.fechaHora },
            sound: 'default',
            actionTypeId: '',
            extra: {
              tipo: notificacion.tipo
            }
          }]
        });
      }
    } catch (error) {
      console.error('Error al programar notificación nativa:', error);
    }
  }

  private static async programarNotificacionWeb(notificacion: NotificacionProgramada) {
    const tiempoEspera = notificacion.fechaHora.getTime() - Date.now();
    
    if (tiempoEspera <= 0) return;
    
    const timeout = setTimeout(async () => {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notificacion.titulo, {
          body: notificacion.mensaje,
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
      }
      
      // Si es repetitiva, programar la siguiente
      if (notificacion.repetir && notificacion.intervalo) {
        const siguienteNotificacion = {
          ...notificacion,
          fechaHora: new Date(Date.now() + notificacion.intervalo * 60 * 1000)
        };
        this.programarNotificacionWeb(siguienteNotificacion);
      }
    }, tiempoEspera);
    
    this.intervalos.set(notificacion.id, timeout);
  }

  static cancelarNotificacion(id: string) {
    // Cancelar timeout si existe
    const timeout = this.intervalos.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.intervalos.delete(id);
    }
    
    // Remover de notificaciones programadas
    this.notificacionesProgramadas.delete(id);
    
    // Cancelar notificación nativa si es necesario
    if (Capacitor.isNativePlatform()) {
      this.cancelarNotificacionNativa(id);
    }
    
    console.log(`✅ Notificación ${id} cancelada`);
  }

  private static async cancelarNotificacionNativa(id: string) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const numericId = parseInt(id.replace(/\D/g, '')) || 0;
      
      // Cancelar múltiples IDs para notificaciones repetitivas
      const ids = [];
      for (let i = 0; i < 24; i++) {
        ids.push(numericId + i);
      }
      
      await LocalNotifications.cancel({ notifications: ids.map(id => ({ id })) });
    } catch (error) {
      console.error('Error al cancelar notificación nativa:', error);
    }
  }

  static obtenerNotificacionesProgramadas(): NotificacionProgramada[] {
    return Array.from(this.notificacionesProgramadas.values());
  }

  static async inicializar() {
    console.log('Inicializando servicio de notificaciones programadas...');
    
    // Configurar listener para notificaciones nativas
    if (Capacitor.isNativePlatform()) {
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        
        await LocalNotifications.addListener('localNotificationReceived', (notification) => {
          console.log('Notificación recibida:', notification);
        });
        
        await LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
          console.log('Acción de notificación:', action);
        });
      } catch (error) {
        console.error('Error al configurar listeners de notificaciones:', error);
      }
    }
  }
}
