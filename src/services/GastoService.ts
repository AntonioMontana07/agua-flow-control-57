
import { dbManager, Gasto } from '@/lib/database';

export class GastoService {
  static async crear(gasto: Omit<Gasto, 'id' | 'fechaCreacion'>): Promise<number> {
    const nuevoGasto: Gasto = {
      ...gasto,
      fechaCreacion: new Date().toISOString()
    };
    return await dbManager.add('gastos', nuevoGasto);
  }

  static async obtenerTodos(): Promise<Gasto[]> {
    return await dbManager.getAll<Gasto>('gastos');
  }

  static async obtenerPorId(id: number): Promise<Gasto | undefined> {
    return await dbManager.getById<Gasto>('gastos', id);
  }

  static async actualizar(gasto: Gasto): Promise<void> {
    await dbManager.update('gastos', gasto);
  }

  static async eliminar(id: number): Promise<void> {
    await dbManager.delete('gastos', id);
  }

  static async inicializarDatosPrueba(): Promise<void> {
    const gastos = await this.obtenerTodos();
    if (gastos.length === 0) {
      const gastosIniciales = [
        {
          titulo: 'Gasolina',
          cantidad: 50.00,
          descripcion: 'Combustible para vehículo de reparto',
          fecha: '2024-01-15',
          fechaCreacion: new Date().toISOString()
        },
        {
          titulo: 'Mantenimiento',
          cantidad: 80.00,
          descripcion: 'Reparación menor del vehículo',
          fecha: '2024-01-12',
          fechaCreacion: new Date().toISOString()
        }
      ];

      for (const gasto of gastosIniciales) {
        await this.crear(gasto);
      }
    }
  }
}
