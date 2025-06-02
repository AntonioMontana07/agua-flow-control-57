
// Configuración de IndexedDB para la aplicación
export interface Producto {
  id?: number;
  nombre: string;
  cantidad: number;
  precio: number;
  minimo: number;
  descripcion?: string;
  fechaCreacion: string;
  estado?: string; // Campo calculado dinámicamente
}

export interface Cliente {
  id?: number;
  nombre: string;
  direccion: string;
  telefono: string;
  descripcion?: string;
  fechaRegistro: string;
}

export interface Compra {
  id?: number;
  cantidad: number;
  fecha: string;
  descripcion: string;
  precio: number;
  total: number;
  fechaCreacion: string;
}

export interface Venta {
  id?: number;
  clienteId: number;
  clienteNombre: string;
  hora: string;
  fecha: string;
  precio: number;
  descripcion?: string;
  fechaCreacion: string;
}

class DatabaseManager {
  private dbName = 'AguaPuraDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Crear tabla de productos
        if (!db.objectStoreNames.contains('productos')) {
          const productStore = db.createObjectStore('productos', { keyPath: 'id', autoIncrement: true });
          productStore.createIndex('nombre', 'nombre', { unique: false });
        }

        // Crear tabla de clientes
        if (!db.objectStoreNames.contains('clientes')) {
          const clientStore = db.createObjectStore('clientes', { keyPath: 'id', autoIncrement: true });
          clientStore.createIndex('nombre', 'nombre', { unique: false });
        }

        // Crear tabla de compras
        if (!db.objectStoreNames.contains('compras')) {
          const compraStore = db.createObjectStore('compras', { keyPath: 'id', autoIncrement: true });
          compraStore.createIndex('fecha', 'fecha', { unique: false });
        }

        // Crear tabla de ventas
        if (!db.objectStoreNames.contains('ventas')) {
          const ventaStore = db.createObjectStore('ventas', { keyPath: 'id', autoIncrement: true });
          ventaStore.createIndex('fecha', 'fecha', { unique: false });
          ventaStore.createIndex('clienteId', 'clienteId', { unique: false });
        }
      };
    });
  }

  async add<T>(storeName: string, data: T): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getById<T>(storeName: string, id: number): Promise<T | undefined> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async update<T>(storeName: string, data: T): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const dbManager = new DatabaseManager();
