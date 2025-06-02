
import { dbManager, Compra } from '@/lib/database';
import { ProductoService } from './ProductoService';

export class CompraService {
  static async crear(compra: Omit<Compra, 'id' | 'total'>): Promise<number> {
    const nuevaCompra: Compra = {
      ...compra,
      total: compra.cantidad * compra.precio,
      fechaCreacion: new Date().toISOString()
    };
    
    const compraId = await dbManager.add('compras', nuevaCompra);
    
    // Actualizar inventario del producto
    await this.actualizarInventario(compra.productoId, compra.cantidad, 'agregar');
    
    return compraId;
  }

  static async obtenerTodas(): Promise<Compra[]> {
    return await dbManager.getAll<Compra>('compras');
  }

  static async obtenerPorId(id: number): Promise<Compra | undefined> {
    return await dbManager.getById<Compra>('compras', id);
  }

  static async actualizar(compra: Compra): Promise<void> {
    // Obtener la compra original para calcular la diferencia
    const compraOriginal = await this.obtenerPorId(compra.id!);
    
    compra.total = compra.cantidad * compra.precio;
    await dbManager.update('compras', compra);
    
    if (compraOriginal) {
      // Revertir la cantidad original
      await this.actualizarInventario(compraOriginal.productoId, compraOriginal.cantidad, 'quitar');
      // Aplicar la nueva cantidad
      await this.actualizarInventario(compra.productoId, compra.cantidad, 'agregar');
    }
  }

  static async eliminar(id: number): Promise<void> {
    const compra = await this.obtenerPorId(id);
    if (compra) {
      // Revertir la cantidad del inventario
      await this.actualizarInventario(compra.productoId, compra.cantidad, 'quitar');
      await dbManager.delete('compras', id);
    }
  }

  private static async actualizarInventario(productoId: number, cantidad: number, operacion: 'agregar' | 'quitar'): Promise<void> {
    try {
      const producto = await ProductoService.obtenerPorId(productoId);
      if (producto) {
        const nuevaCantidad = operacion === 'agregar' 
          ? producto.cantidad + cantidad 
          : producto.cantidad - cantidad;
        
        // Asegurar que la cantidad no sea negativa
        if (nuevaCantidad >= 0) {
          await ProductoService.actualizar({
            ...producto,
            cantidad: nuevaCantidad
          });
        }
      }
    } catch (error) {
      console.error('Error al actualizar inventario:', error);
    }
  }

  static async inicializarDatosPrueba(): Promise<void> {
    const compras = await this.obtenerTodas();
    if (compras.length === 0) {
      // No inicializar datos de prueba para evitar conflictos con el inventario
      console.log('No se inicializan datos de prueba para compras');
    }
  }
}
