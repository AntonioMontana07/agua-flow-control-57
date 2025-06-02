
import { dbManager, Compra } from '@/lib/database';

export class CompraService {
  static async crear(compra: Omit<Compra, 'id' | 'total'>): Promise<number> {
    const nuevaCompra: Compra = {
      ...compra,
      total: compra.cantidad * compra.precio,
      fechaCreacion: new Date().toISOString()
    };
    return await dbManager.add('compras', nuevaCompra);
  }

  static async obtenerTodas(): Promise<Compra[]> {
    return await dbManager.getAll<Compra>('compras');
  }

  static async obtenerPorId(id: number): Promise<Compra | undefined> {
    return await dbManager.getById<Compra>('compras', id);
  }

  static async actualizar(compra: Compra): Promise<void> {
    compra.total = compra.cantidad * compra.precio;
    await dbManager.update('compras', compra);
  }

  static async eliminar(id: number): Promise<void> {
    await dbManager.delete('compras', id);
  }

  static async inicializarDatosPrueba(): Promise<void> {
    const compras = await this.obtenerTodas();
    if (compras.length === 0) {
      const comprasIniciales = [
        {
          cantidad: 50,
          fecha: '2024-01-15',
          descripcion: 'Recarga semanal de garrafones',
          precio: 15.00
        },
        {
          cantidad: 30,
          fecha: '2024-01-10',
          descripcion: 'Recarga de emergencia',
          precio: 15.00
        }
      ];

      for (const compra of comprasIniciales) {
        await this.crear(compra);
      }
    }
  }
}
