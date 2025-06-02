
import { dbManager, Cliente } from '@/lib/database';

export class ClienteService {
  static async crear(cliente: Omit<Cliente, 'id' | 'fechaRegistro'>): Promise<number> {
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

  // Método eliminado - ya no inicializa datos de prueba
  static async inicializarDatosPrueba(): Promise<void> {
    console.log('ClienteService funciona sin datos de prueba - aplicación completamente limpia');
  }
}
