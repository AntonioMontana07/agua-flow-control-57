
import { useEffect, useState } from 'react';
import { NotificationService } from '@/services/NotificationService';
import { ScheduledNotificationService } from '@/services/ScheduledNotificationService';
import { MobilePermissionsService } from '@/services/MobilePermissionsService';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';

export const useNotifications = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const [isAutoRequesting, setIsAutoRequesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initializeNotifications = async () => {
      if (isAutoRequesting) return; // Evitar múltiples solicitudes
      
      setIsAutoRequesting(true);
      
      try {
        console.log('🔔 Inicializando sistema completo con permisos automáticos...');
        
        // Solicitar TODOS los permisos automáticamente al abrir la app
        const permisos = await MobilePermissionsService.verificarYSolicitarTodosLosPermisos();
        
        setHasPermission(permisos.notificaciones);
        setPermissionStatus(permisos.notificaciones ? 'granted' : 'denied');
        
        // Inicializar servicios de notificaciones
        const permissionGranted = await NotificationService.initialize();
        await ScheduledNotificationService.inicializar();
        
        setIsInitialized(true);
        
        // Mostrar estado final de permisos
        if (permisos.notificaciones && permisos.ubicacion) {
          console.log('✅ Todos los permisos concedidos - Sistema completamente activo');
          toast({
            title: "✅ Sistema Totalmente Activo",
            description: "GPS y notificaciones funcionando correctamente",
            duration: 4000
          });
        } else if (permisos.notificaciones) {
          console.log('🔔 Solo notificaciones activas');
          toast({
            title: "🔔 Notificaciones Activas",
            description: "Sistema de alertas configurado",
            duration: 3000
          });
        } else {
          console.log('⚠️ Algunos permisos no concedidos');
          toast({
            title: "⚠️ Permisos Limitados",
            description: "Activa permisos en Configuración para mejor funcionamiento",
            variant: "destructive",
            duration: 5000
          });
        }
        
      } catch (error) {
        console.error('❌ Error al inicializar sistema completo:', error);
        setIsInitialized(true);
        
        toast({
          title: "⚠️ Error de Configuración",
          description: "No se pudieron solicitar todos los permisos",
          variant: "destructive",
          duration: 4000
        });
      } finally {
        setIsAutoRequesting(false);
      }
    };

    // Solicitar permisos inmediatamente al cargar la app
    initializeNotifications();
    
    // Verificar permisos cada 30 segundos para mantenerlos activos
    const intervalId = setInterval(async () => {
      if (!isAutoRequesting) {
        console.log('🔄 Verificación periódica de permisos...');
        try {
          const permisos = await MobilePermissionsService.solicitarPermisosAutomaticamente();
          setHasPermission(permisos.notificaciones);
          setPermissionStatus(permisos.notificaciones ? 'granted' : 'denied');
        } catch (error) {
          console.log('⚠️ Error en verificación periódica:', error);
        }
      }
    }, 30000); // Cada 30 segundos

    return () => {
      clearInterval(intervalId);
    };
  }, [toast]);

  const solicitarPermisosNuevamente = async () => {
    try {
      console.log('🔄 Re-solicitando todos los permisos...');
      
      const permisos = await MobilePermissionsService.verificarYSolicitarTodosLosPermisos();
      
      setHasPermission(permisos.notificaciones);
      setPermissionStatus(permisos.notificaciones ? 'granted' : 'denied');
      
      if (permisos.notificaciones && permisos.ubicacion) {
        toast({
          title: "✅ Todos los Permisos Activos",
          description: "GPS y notificaciones funcionando perfectamente"
        });
      } else if (permisos.notificaciones) {
        toast({
          title: "✅ Notificaciones Activas",
          description: "Sistema de alertas configurado"
        });
      }
      
      return permisos;
    } catch (error) {
      console.error('❌ Error al solicitar permisos:', error);
      return { ubicacion: false, notificaciones: false, mensajes: ['Error al solicitar permisos'] };
    }
  };

  const notificarStockBajo = async (producto: string, cantidad: number, minimo: number) => {
    try {
      console.log(`📦 Enviando notificación de stock bajo: ${producto} (${cantidad}/${minimo})`);
      const success = await NotificationService.enviarNotificacionStock(producto, cantidad, minimo);
      if (success && hasPermission) {
        toast({
          title: "⚠️ Stock Bajo",
          description: `${producto}: ${cantidad} unidades disponibles (mín: ${minimo})`,
          variant: "destructive"
        });
      }
      return success;
    } catch (error) {
      console.log('❌ Error al enviar notificación de stock:', error);
      return false;
    }
  };

  const notificarNuevoPedido = async (cliente: string, producto: string, total: number) => {
    try {
      console.log(`📝 Enviando notificación de nuevo pedido: ${cliente} - ${producto}`);
      const success = await NotificationService.enviarNotificacionPedido(cliente, producto, total);
      if (success && hasPermission) {
        toast({
          title: "📝 Nuevo Pedido",
          description: `${cliente} - ${producto} (S/${total.toFixed(2)})`,
        });
      }
      return success;
    } catch (error) {
      console.log('❌ Error al enviar notificación de pedido:', error);
      return false;
    }
  };

  const notificarStockCritico = async (productos: Array<{nombre: string, cantidad: number, minimo: number}>) => {
    try {
      console.log(`🚨 Enviando notificación de stock crítico para ${productos.length} productos`);
      const success = await NotificationService.enviarNotificacionStockCritico(productos);
      if (success && hasPermission) {
        toast({
          title: "🚨 ¡Stock Crítico!",
          description: `${productos.length} productos necesitan reabastecimiento urgente`,
          variant: "destructive"
        });
      }
      return success;
    } catch (error) {
      console.log('❌ Error al enviar notificación de stock crítico:', error);
      return false;
    }
  };

  return {
    notificarStockBajo,
    notificarNuevoPedido,
    notificarStockCritico,
    solicitarPermisosNuevamente,
    isInitialized,
    hasPermission,
    permissionStatus,
    isAutoRequesting
  };
};
