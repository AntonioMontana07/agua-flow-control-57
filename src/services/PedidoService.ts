
import { dbManager } from '@/lib/database';

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
}

export class PedidoService {
  static async crear(pedido: Omit<Pedido, 'id' | 'total' | 'fechaCreacion'>): Promise<number> {
    const nuevoPedido: Pedido = {
      ...pedido,
      total: pedido.cantidad * pedido.precio,
      fechaCreacion: new Date().toISOString()
    };
    
    // Solo guardar el pedido, sin afectar inventario ni otros módulos
    console.log('Creando pedido independiente:', nuevoPedido);
    return await dbManager.add('pedidos', nuevoPedido);
  }

  static async obtenerTodos(): Promise<Pedido[]> {
    return await dbManager.getAll<Pedido>('pedidos');
  }

  static async obtenerPorId(id: number): Promise<Pedido | undefined> {
    return await dbManager.getById<Pedido>('pedidos', id);
  }

  static async actualizar(pedido: Pedido): Promise<void> {
    // Solo actualizar el pedido, recalcular total
    pedido.total = pedido.cantidad * pedido.precio;
    console.log('Actualizando pedido independiente:', pedido);
    await dbManager.update('pedidos', pedido);
  }

  static async eliminar(id: number): Promise<void> {
    console.log('Eliminando pedido independiente:', id);
    await dbManager.delete('pedidos', id);
  }

  static async inicializarDatosPrueba(): Promise<void> {
    const pedidos = await this.obtenerTodos();
    if (pedidos.length === 0) {
      console.log('Módulo de pedidos funciona independientemente - no se inicializan datos de prueba');
    }
  }

  // Métodos auxiliares para consulta de datos (solo lectura)
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
