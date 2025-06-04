
import { Capacitor } from '@capacitor/core';
import { ProductoService } from './ProductoService';

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
    
    console.log(`🔔 Programando notificación de stock cada ${intervaloMinutos} minutos...`);
    
    // Cancelar notificación anterior si existe
    this.cancelarNotificacion(id);
    
    const notificacion: NotificacionProgramada = {
      id,
      tipo: 'stock',
      titulo: '🔔 Recordatorio de Stock - BIOX',
      mensaje: 'Es hora de revisar el inventario y productos con stock bajo',
      fechaHora: new Date(Date.now() + intervaloMinutos * 60 * 1000),
      repetir: true,
      intervalo: intervaloMinutos
    };

    this.notificacionesProgramadas.set(id, notificacion);
    
    if (Capacitor.isNativePlatform()) {
      console.log('📱 Programando notificaciones nativas para Android...');
      await this.programarNotificacionNativa(notificacion);
    } else {
      console.log('🌐 Programando notificaciones web...');
      await this.programarNotificacionWeb(notificacion);
    }
    
    // Iniciar verificación inmediata y luego programar las siguientes
    this.iniciarVerificacionPeriodica(intervaloMinutos);
    
    console.log(`✅ Notificación de stock programada exitosamente cada ${intervaloMinutos} minutos`);
    return true;
  }

  private static iniciarVerificacionPeriodica(intervaloMinutos: number) {
    const id = 'stock-reminder';
    
    // Cancelar intervalo anterior si existe
    const intervaloPrevio = this.intervalos.get(id);
    if (intervaloPrevio) {
      clearInterval(intervaloPrevio);
    }
    
    console.log(`⏰ Iniciando verificación periódica cada ${intervaloMinutos} minutos`);
    
    // Función para verificar stock y enviar notificación
    const verificarYNotificar = async () => {
      try {
        console.log('🔍 Ejecutando verificación automática de stock...');
        
        const productos = await ProductoService.obtenerTodos();
        const productosBajos = productos.filter(p => p.cantidad <= p.minimo);
        
        console.log(`📊 Productos total: ${productos.length}, Stock bajo: ${productosBajos.length}`);
        
        if (productosBajos.length > 0) {
          const mensaje = `${productosBajos.length} productos necesitan reabastecimiento`;
          
          // Enviar notificación nativa
          if (Capacitor.isNativePlatform()) {
            await this.enviarNotificacionNativaInmediata(
              '⚠️ Stock Bajo - BIOX',
              mensaje
            );
          }
          
          // Enviar notificación web como respaldo
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('⚠️ Stock Bajo - BIOX', {
              body: mensaje,
              icon: '/favicon.ico',
              tag: 'stock-check',
              requireInteraction: true
            });
          }
          
          console.log(`🔔 Notificación enviada: ${mensaje}`);
        } else {
          console.log('✅ Stock suficiente en todos los productos');
        }
      } catch (error) {
        console.error('❌ Error en verificación periódica:', error);
      }
    };
    
    // Ejecutar inmediatamente
    verificarYNotificar();
    
    // Programar ejecuciones futuras
    const intervalo = setInterval(verificarYNotificar, intervaloMinutos * 60 * 1000);
    this.intervalos.set(id, intervalo);
    
    console.log(`✅ Verificación periódica configurada exitosamente`);
  }

  private static async enviarNotificacionNativaInmediata(titulo: string, mensaje: string) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      
      await LocalNotifications.schedule({
        notifications: [{
          title: titulo,
          body: mensaje,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 1000) }, // 1 segundo después
          sound: 'default',
          actionTypeId: '',
          extra: {
            tipo: 'stock_reminder',
            timestamp: Date.now()
          }
        }]
      });
      
      console.log('✅ Notificación nativa inmediata enviada');
    } catch (error) {
      console.error('❌ Error al enviar notificación nativa inmediata:', error);
    }
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
      console.log('⏰ La fecha de notificación ya pasó, no se programa');
      return false;
    }

    const notificacion: NotificacionProgramada = {
      id,
      tipo: 'pedido',
      titulo: '📋 Recordatorio de Entrega - BIOX',
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
        // Para notificaciones repetitivas de stock, programar varias para las próximas 24 horas
        const notificaciones = [];
        const maxNotificaciones = Math.min(24, Math.floor(1440 / notificacion.intervalo)); // Máximo 24 horas
        
        for (let i = 0; i < maxNotificaciones; i++) {
          const fechaNotificacion = new Date(Date.now() + (notificacion.intervalo * 60 * 1000 * (i + 1)));
          notificaciones.push({
            title: notificacion.titulo,
            body: notificacion.mensaje,
            id: parseInt(notificacion.id.replace(/\D/g, '')) + i + 1000, // ID único
            schedule: { at: fechaNotificacion },
            sound: 'default',
            actionTypeId: '',
            extra: {
              tipo: notificacion.tipo,
              repetir: true,
              indice: i
            }
          });
        }
        
        await LocalNotifications.schedule({ notifications: notificaciones });
        console.log(`✅ ${notificaciones.length} notificaciones nativas programadas para Android`);
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
      console.error('❌ Error al programar notificación nativa:', error);
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
          badge: '/favicon.ico',
          tag: notificacion.id,
          requireInteraction: true
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
    console.log(`🔕 Cancelando notificación: ${id}`);
    
    // Cancelar timeout si existe
    const timeout = this.intervalos.get(id);
    if (timeout) {
      clearTimeout(timeout);
      clearInterval(timeout);
      this.intervalos.delete(id);
    }
    
    // Remover de notificaciones programadas
    this.notificacionesProgramadas.delete(id);
    
    // Cancelar notificación nativa si es necesario
    if (Capacitor.isNativePlatform()) {
      this.cancelarNotificacionNativa(id);
    }
    
    console.log(`✅ Notificación ${id} cancelada completamente`);
  }

  private static async cancelarNotificacionNativa(id: string) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const numericId = parseInt(id.replace(/\D/g, '')) || 0;
      
      // Cancelar múltiples IDs para notificaciones repetitivas
      const ids = [];
      for (let i = 0; i < 50; i++) { // Cancelar hasta 50 notificaciones
        ids.push(numericId + i + 1000);
      }
      
      await LocalNotifications.cancel({ notifications: ids.map(id => ({ id })) });
      console.log(`✅ Notificaciones nativas canceladas para ${id}`);
    } catch (error) {
      console.error('❌ Error al cancelar notificación nativa:', error);
    }
  }

  static obtenerNotificacionesProgramadas(): NotificacionProgramada[] {
    return Array.from(this.notificacionesProgramadas.values());
  }

  static async inicializar() {
    console.log('🚀 Inicializando servicio de notificaciones programadas...');
    
    // Configurar listener para notificaciones nativas
    if (Capacitor.isNativePlatform()) {
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        
        await LocalNotifications.addListener('localNotificationReceived', (notification) => {
          console.log('🔔 Notificación recibida:', notification);
        });
        
        await LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
          console.log('👆 Acción de notificación:', action);
        });
        
        console.log('✅ Listeners de notificaciones nativas configurados');
      } catch (error) {
        console.error('❌ Error al configurar listeners de notificaciones:', error);
      }
    }
    
    console.log('✅ Servicio de notificaciones programadas inicializado');
  }
}
