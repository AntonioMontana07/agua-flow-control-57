
import { useEffect, useState } from 'react';
import { NotificationService } from '@/services/NotificationService';
import { Capacitor } from '@capacitor/core';

export const useNotifications = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeNotifications = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          console.log('Inicializando sistema de notificaciones...');
          const success = await NotificationService.initialize();
          setIsInitialized(success);
          if (!success) {
            setError('No se pudieron configurar las notificaciones completamente');
          }
        } catch (error) {
          console.error('Error crítico al inicializar notificaciones:', error);
          setError('Error al configurar notificaciones');
          setIsInitialized(false);
        }
      } else {
        console.log('Plataforma web - notificaciones no disponibles');
        setIsInitialized(true); // En web consideramos que está "inicializado"
      }
    };

    initializeNotifications();
  }, []);

  const notificarStockBajo = async (producto: string, cantidad: number, minimo: number) => {
    if (Capacitor.isNativePlatform() && isInitialized) {
      try {
        await NotificationService.enviarNotificacionStock(producto, cantidad, minimo);
      } catch (error) {
        console.error('Error al enviar notificación de stock:', error);
      }
    }
  };

  const notificarNuevoPedido = async (cliente: string, producto: string, total: number) => {
    if (Capacitor.isNativePlatform() && isInitialized) {
      try {
        await NotificationService.enviarNotificacionPedido(cliente, producto, total);
      } catch (error) {
        console.error('Error al enviar notificación de pedido:', error);
      }
    }
  };

  const notificarStockCritico = async (productos: Array<{nombre: string, cantidad: number, minimo: number}>) => {
    if (Capacitor.isNativePlatform() && isInitialized) {
      try {
        await NotificationService.enviarNotificacionStockCritico(productos);
      } catch (error) {
        console.error('Error al enviar notificación de stock crítico:', error);
      }
    }
  };

  return {
    notificarStockBajo,
    notificarNuevoPedido,
    notificarStockCritico,
    isInitialized,
    error
  };
};
