
import { useEffect, useState } from 'react';
import { ScheduledNotificationService, NotificacionProgramada } from '@/services/ScheduledNotificationService';
import { useToast } from '@/hooks/use-toast';
import { ProductoService } from '@/services/ProductoService';

export const useScheduledNotifications = () => {
  const [isStockReminderActive, setIsStockReminderActive] = useState(false);
  const [stockReminderInterval, setStockReminderInterval] = useState(60); // minutos
  const [notificacionesProgramadas, setNotificacionesProgramadas] = useState<NotificacionProgramada[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Inicializar el servicio
    ScheduledNotificationService.inicializar();
    
    // Cargar notificaciones existentes
    cargarNotificacionesProgramadas();
  }, []);

  const cargarNotificacionesProgramadas = () => {
    const notificaciones = ScheduledNotificationService.obtenerNotificacionesProgramadas();
    setNotificacionesProgramadas(notificaciones);
    
    // Verificar si hay recordatorio de stock activo
    const stockReminder = notificaciones.find(n => n.id === 'stock-reminder');
    setIsStockReminderActive(!!stockReminder);
  };

  const activarRecordatorioStock = async (intervaloMinutos: number = 60) => {
    try {
      await ScheduledNotificationService.programarNotificacionStock(intervaloMinutos);
      setIsStockReminderActive(true);
      setStockReminderInterval(intervaloMinutos);
      
      toast({
        title: "Recordatorio de Stock Activado",
        description: `Recibirás notificaciones cada ${intervaloMinutos} minutos`,
      });
      
      cargarNotificacionesProgramadas();
    } catch (error) {
      console.error('Error al activar recordatorio de stock:', error);
      toast({
        title: "Error",
        description: "No se pudo activar el recordatorio de stock",
        variant: "destructive"
      });
    }
  };

  const desactivarRecordatorioStock = () => {
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
      const productos = await ProductoService.obtenerTodos();
      const productosBajos = productos.filter(p => p.cantidad < p.minimo);
      
      if (productosBajos.length > 0) {
        toast({
          title: "⚠️ Stock Bajo Detectado",
          description: `${productosBajos.length} productos necesitan reabastecimiento`,
          variant: "destructive"
        });
      }
      
      return productosBajos;
    } catch (error) {
      console.error('Error al verificar stock:', error);
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
