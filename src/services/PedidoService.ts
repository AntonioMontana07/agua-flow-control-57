
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
  fechaCreacion: string;
}

export class PedidoService {
  static async crear(pedido: Omit<Pedido, 'id' | 'total' | 'fechaCreacion'>): Promise<number> {
    const nuevoPedido: Pedido = {
      ...pedido,
      total: pedido.cantidad * pedido.precio,
      fechaCreacion: new Date().toISOString()
    };
    
    return await dbManager.add('pedidos', nuevoPedido);
  }

  static async obtenerTodos(): Promise<Pedido[]> {
    return await dbManager.getAll<Pedido>('pedidos');
  }

  static async obtenerPorId(id: number): Promise<Pedido | undefined> {
    return await dbManager.getById<Pedido>('pedidos', id);
  }

  static async actualizar(pedido: Pedido): Promise<void> {
    pedido.total = pedido.cantidad * pedido.precio;
    await dbManager.update('pedidos', pedido);
  }

  static async eliminar(id: number): Promise<void> {
    await dbManager.delete('pedidos', id);
  }

  static async inicializarDatosPrueba(): Promise<void> {
    const pedidos = await this.obtenerTodos();
    if (pedidos.length === 0) {
      console.log('No se inicializan datos de prueba para pedidos');
    }
  }
}
