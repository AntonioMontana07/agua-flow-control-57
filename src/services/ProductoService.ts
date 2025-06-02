
import { dbManager, Producto } from '@/lib/database';

export class ProductoService {
  static async crear(producto: Omit<Producto, 'id'>): Promise<number> {
    const nuevoProducto: Producto = {
      ...producto,
      fechaCreacion: new Date().toISOString()
    };
    return await dbManager.add('productos', nuevoProducto);
  }

  static async obtenerTodos(): Promise<Producto[]> {
    return await dbManager.getAll<Producto>('productos');
  }

  static async obtenerPorId(id: number): Promise<Producto | undefined> {
    return await dbManager.getById<Producto>('productos', id);
  }

  static async actualizar(producto: Producto): Promise<void> {
    await dbManager.update('productos', producto);
  }

  static async eliminar(id: number): Promise<void> {
    await dbManager.delete('productos', id);
  }

  static async inicializarDatosPrueba(): Promise<void> {
    const productos = await this.obtenerTodos();
    if (productos.length === 0) {
      const productosIniciales = [
        { 
          nombre: 'Bidón 20L', 
          cantidad: 45, 
          precio: 25.00, 
          minimo: 10,
          fechaCreacion: new Date().toISOString()
        },
        { 
          nombre: 'Bidón 10L', 
          cantidad: 8, 
          precio: 15.00, 
          minimo: 10,
          fechaCreacion: new Date().toISOString()
        },
        { 
          nombre: 'Botella 1L', 
          cantidad: 120, 
          precio: 3.50, 
          minimo: 50,
          fechaCreacion: new Date().toISOString()
        },
        { 
          nombre: 'Botella 500ml', 
          cantidad: 5, 
          precio: 2.00, 
          minimo: 20,
          fechaCreacion: new Date().toISOString()
        },
        { 
          nombre: 'Bidón 5L', 
          cantidad: 25, 
          precio: 8.00, 
          minimo: 15,
          fechaCreacion: new Date().toISOString()
        }
      ];

      for (const producto of productosIniciales) {
        await this.crear(producto);
      }
    }
  }
}
