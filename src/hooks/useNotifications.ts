
import { useEffect, useState } from 'react';
import { NotificationService } from '@/services/NotificationService';
import { ScheduledNotificationService } from '@/services/ScheduledNotificationService';
import { useToast } from '@/hooks/use-toast';

export const useNotifications = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        const permissionGranted = await NotificationService.initialize();
        setHasPermission(permissionGranted);
        setIsInitialized(true);
        
        // Inicializar también las notificaciones programadas
        await ScheduledNotificationService.inicializar();
        
        if (permissionGranted) {
          console.log('✅ Sistema de notificaciones inicializado correctamente');
          toast({
            title: "Notificaciones activadas",
            description: "Recibirás alertas de stock y pedidos programadas",
          });
        } else {
          console.log('⚠️ Notificaciones no disponibles - permisos denegados');
          toast({
            title: "Notificaciones deshabilitadas",
            description: "Para recibir alertas programadas, habilita las notificaciones en la configuración",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error al inicializar notificaciones:', error);
        setIsInitialized(true);
      }
    };

    initializeNotifications();
  }, [toast]);

  const notificarStockBajo = async (producto: string, cantidad: number, minimo: number) => {
    try {
      const success = await NotificationService.enviarNotificacionStock(producto, cantidad, minimo);
      if (success && hasPermission) {
        toast({
          title: "Stock Bajo",
          description: `${producto}: ${cantidad} unidades disponibles`,
          variant: "destructive"
        });
      }
      return success;
    } catch (error) {
      console.log('Error al enviar notificación de stock:', error);
      return false;
    }
  };

  const notificarNuevoPedido = async (cliente: string, producto: string, total: number) => {
    try {
      const success = await NotificationService.enviarNotificacionPedido(cliente, producto, total);
      if (success && hasPermission) {
        toast({
          title: "Nuevo Pedido",
          description: `${cliente} - ${producto} (S/${total.toFixed(2)})`,
        });
      }
      return success;
    } catch (error) {
      console.log('Error al enviar notificación de pedido:', error);
      return false;
    }
  };

  const notificarStockCritico = async (productos: Array<{nombre: string, cantidad: number, minimo: number}>) => {
    try {
      const success = await NotificationService.enviarNotificacionStockCritico(productos);
      if (success && hasPermission) {
        toast({
          title: "¡Stock Crítico!",
          description: `${productos.length} productos necesitan reabastecimiento`,
          variant: "destructive"
        });
      }
      return success;
    } catch (error) {
      console.log('Error al enviar notificación de stock crítico:', error);
      return false;
    }
  };

  return {
    notificarStockBajo,
    notificarNuevoPedido,
    notificarStockCritico,
    isInitialized,
    hasPermission
  };
};
