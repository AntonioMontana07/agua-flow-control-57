
import { dbManager, Venta } from '@/lib/database';

export class VentaService {
  static async crear(venta: Omit<Venta, 'id'>): Promise<number> {
    const nuevaVenta: Venta = {
      ...venta,
      fechaCreacion: new Date().toISOString()
    };
    return await dbManager.add('ventas', nuevaVenta);
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
          hora: '09:30',
          fecha: '2024-06-02',
          precio: 30.00,
          descripcion: 'Entrega de 2 garrafones'
        },
        {
          clienteId: 2,
          clienteNombre: 'María González',
          hora: '14:15',
          fecha: '2024-06-02',
          precio: 15.00,
          descripcion: 'Entrega de 1 garrafón'
        }
      ];

      for (const venta of ventasIniciales) {
        await this.crear(venta);
      }
    }
  }
}
