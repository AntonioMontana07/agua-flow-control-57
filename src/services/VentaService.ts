
import { dbManager, Venta } from '@/lib/database';
import { ProductoService } from './ProductoService';

export class VentaService {
  static async crear(venta: Omit<Venta, 'id'>): Promise<number> {
    const nuevaVenta: Venta = {
      ...venta,
      fechaCreacion: new Date().toISOString()
    };

    // Verificar que hay suficiente stock
    const producto = await ProductoService.obtenerPorId(venta.productoId);
    if (!producto) {
      throw new Error('Producto no encontrado');
    }

    if (producto.cantidad < venta.cantidad) {
      throw new Error(`Stock insuficiente. Solo hay ${producto.cantidad} unidades disponibles`);
    }

    // Registrar la venta
    const ventaId = await dbManager.add('ventas', nuevaVenta);

    // Descontar del inventario
    const nuevoStock = producto.cantidad - venta.cantidad;
    await ProductoService.actualizar({
      ...producto,
      cantidad: nuevoStock
    });

    console.log(`Venta registrada. Producto ${producto.nombre}: ${producto.cantidad} -> ${nuevoStock}`);

    return ventaId;
  }

  static async obtenerTodas(): Promise<Venta[]> {
    return await dbManager.getAll<Venta>('ventas');
  }

  static async obtenerPorId(id: number): Promise<Venta | undefined> {
    return await dbManager.getById<Venta>('ventas', id);
  }

  static async actualizar(venta: Venta): Promise<void> {
    await dbManager.update('ventas', venta);
  }

  static async eliminar(id: number): Promise<void> {
    await dbManager.delete('ventas', id);
  }

  static async obtenerPorCliente(clienteId: number): Promise<Venta[]> {
    const todasLasVentas = await this.obtenerTodas();
    return todasLasVentas.filter(venta => venta.clienteId === clienteId);
  }

  static async inicializarDatosPrueba(): Promise<void> {
    const ventas = await this.obtenerTodas();
    if (ventas.length === 0) {
      const ventasIniciales = [
        {
          clienteId: 1,
          clienteNombre: 'Juan Pérez',
          productoId: 1,
          productoNombre: 'Bidón 20L',
          cantidad: 2,
          precioUnitario: 25.00,
          hora: '09:30',
          fecha: '2024-06-02',
          precio: 50.00,
          descripcion: 'Entrega de 2 garrafones',
          fechaCreacion: new Date().toISOString()
        },
        {
          clienteId: 2,
          clienteNombre: 'María González',
          productoId: 1,
          productoNombre: 'Bidón 20L',
          cantidad: 1,
          precioUnitario: 25.00,
          hora: '14:15',
          fecha: '2024-06-02',
          precio: 25.00,
          descripcion: 'Entrega de 1 garrafón',
          fechaCreacion: new Date().toISOString()
        }
      ];

      for (const venta of ventasIniciales) {
        await this.crear(venta);
      }
    }
  }
}
