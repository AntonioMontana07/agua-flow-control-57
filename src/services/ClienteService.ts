
import { dbManager, Cliente } from '@/lib/database';

export class ClienteService {
  static async crear(cliente: Omit<Cliente, 'id'>): Promise<number> {
    const nuevoCliente: Cliente = {
      ...cliente,
      fechaRegistro: new Date().toISOString().split('T')[0]
    };
    return await dbManager.add('clientes', nuevoCliente);
  }

  static async obtenerTodos(): Promise<Cliente[]> {
    return await dbManager.getAll<Cliente>('clientes');
  }

  static async obtenerPorId(id: number): Promise<Cliente | undefined> {
    return await dbManager.getById<Cliente>('clientes', id);
  }

  static async actualizar(cliente: Cliente): Promise<void> {
    await dbManager.update('clientes', cliente);
  }

  static async eliminar(id: number): Promise<void> {
    await dbManager.delete('clientes', id);
  }

  static async inicializarDatosPrueba(): Promise<void> {
    const clientes = await this.obtenerTodos();
    if (clientes.length === 0) {
      const clientesIniciales = [
        {
          nombre: 'Juan Pérez',
          direccion: 'Calle Principal #123, Colonia Centro',
          telefono: '555-0123',
          descripcion: 'Cliente frecuente'
        },
        {
          nombre: 'María González',
          direccion: 'Av. Reforma #456, Colonia Norte',
          telefono: '555-0456',
          descripcion: ''
        },
        {
          nombre: 'Carlos López',
          direccion: 'Calle Secundaria #789',
          telefono: '555-0789',
          descripcion: ''
        }
      ];

      for (const cliente of clientesIniciales) {
        await this.crear(cliente);
      }
    }
  }
}
