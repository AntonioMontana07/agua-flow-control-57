
import { useEffect, useState } from 'react';
import { NotificationService } from '@/services/NotificationService';

export const useNotifications = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Inicialización simple sin solicitar permisos
    NotificationService.initialize();
    setIsInitialized(true);
    console.log('Hook de notificaciones inicializado');
  }, []);

  const notificarStockBajo = async (producto: string, cantidad: number, minimo: number) => {
    try {
      await NotificationService.enviarNotificacionStock(producto, cantidad, minimo);
    } catch (error) {
      console.log('Error al enviar notificación de stock:', error);
    }
  };

  const notificarNuevoPedido = async (cliente: string, producto: string, total: number) => {
    try {
      await NotificationService.enviarNotificacionPedido(cliente, producto, total);
    } catch (error) {
      console.log('Error al enviar notificación de pedido:', error);
    }
  };

  const notificarStockCritico = async (productos: Array<{nombre: string, cantidad: number, minimo: number}>) => {
    try {
      await NotificationService.enviarNotificacionStockCritico(productos);
    } catch (error) {
      console.log('Error al enviar notificación de stock crítico:', error);
    }
  };

  return {
    notificarStockBajo,
    notificarNuevoPedido,
    notificarStockCritico,
    isInitialized
  };
};
