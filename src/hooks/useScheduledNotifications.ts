
import { useEffect, useState } from 'react';
import { ScheduledNotificationService, NotificacionProgramada } from '@/services/ScheduledNotificationService';
import { useToast } from '@/hooks/use-toast';
import { ProductoService } from '@/services/ProductoService';

export const useScheduledNotifications = () => {
  const [isStockReminderActive, setIsStockReminderActive] = useState(false);
  const [stockReminderInterval, setStockReminderInterval] = useState(60); // 60 minutos = 1 hora
  const [notificacionesProgramadas, setNotificacionesProgramadas] = useState<NotificacionProgramada[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Inicializar el servicio
    ScheduledNotificationService.inicializar();
    
    // Cargar notificaciones existentes
    cargarNotificacionesProgramadas();
    
    // Activar automáticamente el recordatorio de stock cada hora
    const inicializarRecordatorioStock = async () => {
      console.log('🔔 Inicializando recordatorio automático de stock cada hora...');
      await activarRecordatorioStock(60); // 60 minutos = 1 hora
    };
    
    // Esperar un poco para que los servicios se inicialicen
    setTimeout(inicializarRecordatorioStock, 2000);
  }, []);

  const cargarNotificacionesProgramadas = () => {
    const notificaciones = ScheduledNotificationService.obtenerNotificacionesProgramadas();
    setNotificacionesProgramadas(notificaciones);
    
    // Verificar si hay recordatorio de stock activo
    const stockReminder = notificaciones.find(n => n.id === 'stock-reminder');
    setIsStockReminderActive(!!stockReminder);
    
    if (stockReminder) {
      console.log('✅ Recordatorio de stock ya está activo');
    }
  };

  const activarRecordatorioStock = async (intervaloMinutos: number = 60) => {
    try {
      console.log(`🔔 Activando recordatorio de stock cada ${intervaloMinutos} minutos...`);
      await ScheduledNotificationService.programarNotificacionStock(intervaloMinutos);
      setIsStockReminderActive(true);
      setStockReminderInterval(intervaloMinutos);
      
      toast({
        title: "✅ Recordatorio de Stock Cada Hora",
        description: `Recibirás notificaciones automáticas cada ${intervaloMinutos} minutos para revisar el stock`,
      });
      
      cargarNotificacionesProgramadas();
      return true;
    } catch (error) {
      console.error('❌ Error al activar recordatorio de stock:', error);
      toast({
        title: "Error",
        description: "No se pudo activar el recordatorio de stock automático",
        variant: "destructive"
      });
      return false;
    }
  };

  const desactivarRecordatorioStock = () => {
    console.log('🔕 Desactivando recordatorio de stock...');
    ScheduledNotificationService.cancelarNotificacion('stock-reminder');
    setIsStockReminderActive(false);
    
    toast({
      title: "Recordatorio de Stock Desactivado",
      description: "Ya no recibirás notificaciones automáticas de stock",
    });
    
    cargarNotificacionesProgramadas();
  };

  const programarNotificacionPedido = async (
    pedidoId: number,
    cliente: string,
    fechaEntrega: string,
    horaEntrega: string,
    minutosAntes: number = 30
  ) => {
    try {
      const success = await ScheduledNotificationService.programarNotificacionPedido(
        pedidoId,
        cliente,
        fechaEntrega,
        horaEntrega,
        minutosAntes
      );
      
      if (success) {
        toast({
          title: "Notificación de Pedido Programada",
          description: `Te avisaremos ${minutosAntes} minutos antes de la entrega`,
        });
        
        cargarNotificacionesProgramadas();
      }
      
      return success;
    } catch (error) {
      console.error('Error al programar notificación de pedido:', error);
      toast({
        title: "Error",
        description: "No se pudo programar la notificación del pedido",
        variant: "destructive"
      });
      return false;
    }
  };

  const cancelarNotificacionPedido = (pedidoId: number) => {
    ScheduledNotificationService.cancelarNotificacion(`pedido-${pedidoId}`);
    
    toast({
      title: "Notificación Cancelada",
      description: "La notificación del pedido ha sido cancelada",
    });
    
    cargarNotificacionesProgramadas();
  };

  const verificarStockBajo = async () => {
    try {
      console.log('🔍 Verificando stock bajo automáticamente...');
      const productos = await ProductoService.obtenerTodos();
      const productosBajos = productos.filter(p => p.cantidad <= p.minimo);
      
      console.log(`📊 Productos encontrados: ${productos.length}, Productos con stock bajo: ${productosBajos.length}`);
      
      if (productosBajos.length > 0) {
        console.log('⚠️ Stock bajo detectado:', productosBajos.map(p => `${p.nombre}: ${p.cantidad}/${p.minimo}`));
        
        toast({
          title: "⚠️ Stock Bajo Detectado",
          description: `${productosBajos.length} productos necesitan reabastecimiento`,
          variant: "destructive"
        });
        
        // Enviar notificación nativa también
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('🔔 Stock Bajo - BIOX', {
            body: `${productosBajos.length} productos necesitan reabastecimiento urgente`,
            icon: '/favicon.ico',
            tag: 'stock-reminder'
          });
        }
      } else {
        console.log('✅ Todos los productos tienen stock suficiente');
      }
      
      return productosBajos;
    } catch (error) {
      console.error('❌ Error al verificar stock:', error);
      return [];
    }
  };

  return {
    isStockReminderActive,
    stockReminderInterval,
    notificacionesProgramadas,
    activarRecordatorioStock,
    desactivarRecordatorioStock,
    programarNotificacionPedido,
    cancelarNotificacionPedido,
    verificarStockBajo,
    cargarNotificacionesProgramadas
  };
};
