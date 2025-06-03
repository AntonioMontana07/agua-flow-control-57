
import { useEffect } from 'react';
import { NotificationService } from '@/services/NotificationService';
import { Capacitor } from '@capacitor/core';

export const useNotifications = () => {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      NotificationService.initialize();
    }
  }, []);

  const notificarStockBajo = (producto: string, cantidad: number, minimo: number) => {
    if (Capacitor.isNativePlatform()) {
      NotificationService.enviarNotificacionStock(producto, cantidad, minimo);
    }
  };

  const notificarNuevoPedido = (cliente: string, producto: string, total: number) => {
    if (Capacitor.isNativePlatform()) {
      NotificationService.enviarNotificacionPedido(cliente, producto, total);
    }
  };

  const notificarStockCritico = (productos: Array<{nombre: string, cantidad: number, minimo: number}>) => {
    if (Capacitor.isNativePlatform()) {
      NotificationService.enviarNotificacionStockCritico(productos);
    }
  };

  return {
    notificarStockBajo,
    notificarNuevoPedido,
    notificarStockCritico
  };
};
