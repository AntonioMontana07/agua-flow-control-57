import { dbManager } from '@/lib/database';
import { NotificationService } from './NotificationService';
import { Capacitor } from '@capacitor/core';

export interface Pedido {
  id?: number;
  clienteId: number;
  clienteNombre: string;
  clienteDireccion: string;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precio: number;
  total: number;
  fecha: string;
  hora: string;
  fechaEntrega: string;
  horaEntrega: string;
  fechaCreacion: string;
  estado: 'Pendiente' | 'En Camino' | 'Entregado';
}

export class PedidoService {
  static async crear(pedido: Omit<Pedido, 'id' | 'total' | 'fechaCreacion' | 'estado'>): Promise<number> {
    const nuevoPedido: Pedido = {
      ...pedido,
      total: pedido.cantidad * pedido.precio,
      fechaCreacion: new Date().toISOString(),
      estado: 'Pendiente'
    };
    
    console.log('Creando pedido con estado Pendiente:', nuevoPedido);
    const id = await dbManager.add('pedidos', nuevoPedido);
    
    // Enviar notificación de nuevo pedido
    if (Capacitor.isNativePlatform()) {
      await NotificationService.enviarNotificacionPedido(
        nuevoPedido.clienteNombre,
        nuevoPedido.productoNombre,
        nuevoPedido.total
      );
    }
    
    return id;
  }

  static async obtenerTodos(): Promise<Pedido[]> {
    const pedidos = await dbManager.getAll<Pedido>('pedidos');
    return pedidos.map(pedido => ({
      ...pedido,
      estado: pedido.estado || 'Pendiente'
    }));
  }

  static async obtenerPorId(id: number): Promise<Pedido | undefined> {
    const pedido = await dbManager.getById<Pedido>('pedidos', id);
    if (pedido) {
      return {
        ...pedido,
        estado: pedido.estado || 'Pendiente'
      };
    }
    return pedido;
  }

  static async actualizar(pedido: Pedido): Promise<void> {
    pedido.total = pedido.cantidad * pedido.precio;
    console.log('Actualizando pedido:', pedido);
    await dbManager.update('pedidos', pedido);
  }

  static async actualizarEstado(id: number, nuevoEstado: 'Pendiente' | 'En Camino' | 'Entregado'): Promise<void> {
    const pedido = await this.obtenerPorId(id);
    if (pedido) {
      pedido.estado = nuevoEstado;
      await this.actualizar(pedido);
      console.log(`Estado del pedido ${id} actualizado a: ${nuevoEstado}`);
    }
  }

  static async eliminar(id: number): Promise<void> {
    console.log('Eliminando pedido:', id);
    await dbManager.delete('pedidos', id);
  }

  static async inicializarDatosPrueba(): Promise<void> {
    const pedidos = await this.obtenerTodos();
    if (pedidos.length === 0) {
      console.log('Módulo de pedidos funciona independientemente - no se inicializan datos de prueba');
    }
  }

  static async consultarClientesDisponibles() {
    try {
      const clientes = await dbManager.getAll('clientes');
      console.log('Consultando clientes disponibles para pedidos:', clientes.length);
      return clientes;
    } catch (error) {
      console.log('No se pudieron consultar clientes:', error);
      return [];
    }
  }

  static async consultarProductosDisponibles() {
    try {
      const productos = await dbManager.getAll('productos');
      console.log('Consultando productos disponibles para pedidos:', productos.length);
      return productos;
    } catch (error) {
      console.log('No se pudieron consultar productos:', error);
      return [];
    }
  }
}
