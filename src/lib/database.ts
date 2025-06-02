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
  productoId: number;
  productoNombre: string;
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
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  hora: string;
  fecha: string;
  precio: number;
  descripcion?: string;
  fechaCreacion: string;
}

export interface Gasto {
  id?: number;
  titulo: string;
  cantidad: number;
  descripcion: string;
  fecha: string;
  fechaCreacion: string;
}

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

class DatabaseManager {
  private dbName = 'AguaPuraDB';
  private version = 1;
  private db: IDBDatabase | null = null;
  private currentUserId: string | null = null;

  setCurrentUser(userId: string) {
    this.currentUserId = userId;
    console.log('Base de datos configurada para usuario:', userId);
  }

  private getStoreName(storeName: string): string {
    if (!this.currentUserId) {
      throw new Error('No user set for database operations');
    }
    return `${storeName}_${this.currentUserId}`;
  }

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
        
        // No crear stores automáticamente en upgrade
        // Los stores se crearán dinámicamente cuando sea necesario
      };
    });
  }

  private async createStoreIfNotExists(storeName: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const userStoreName = this.getStoreName(storeName);
    
    if (!this.db.objectStoreNames.contains(userStoreName)) {
      // Cerrar la conexión actual
      this.db.close();
      
      // Incrementar versión y recrear con el nuevo store
      this.version += 1;
      
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.version);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          this.db = request.result;
          resolve();
        };
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          // Crear el store específico del usuario
          if (!db.objectStoreNames.contains(userStoreName)) {
            const store = db.createObjectStore(userStoreName, { keyPath: 'id', autoIncrement: true });
            
            // Crear índices según el tipo de store
            if (storeName === 'productos') {
              store.createIndex('nombre', 'nombre', { unique: false });
            } else if (storeName === 'clientes') {
              store.createIndex('nombre', 'nombre', { unique: false });
            } else if (storeName === 'compras') {
              store.createIndex('fecha', 'fecha', { unique: false });
            } else if (storeName === 'ventas') {
              store.createIndex('fecha', 'fecha', { unique: false });
              store.createIndex('clienteId', 'clienteId', { unique: false });
            } else if (storeName === 'gastos') {
              store.createIndex('fecha', 'fecha', { unique: false });
            } else if (storeName === 'pedidos') {
              store.createIndex('fecha', 'fecha', { unique: false });
              store.createIndex('clienteId', 'clienteId', { unique: false });
            }
          }
        };
      });
    }
  }

  async add<T>(storeName: string, data: T): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.createStoreIfNotExists(storeName);
    const userStoreName = this.getStoreName(storeName);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([userStoreName], 'readwrite');
      const store = transaction.objectStore(userStoreName);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.createStoreIfNotExists(storeName);
    const userStoreName = this.getStoreName(storeName);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([userStoreName], 'readonly');
      const store = transaction.objectStore(userStoreName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getById<T>(storeName: string, id: number): Promise<T | undefined> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.createStoreIfNotExists(storeName);
    const userStoreName = this.getStoreName(storeName);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([userStoreName], 'readonly');
      const store = transaction.objectStore(userStoreName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async update<T>(storeName: string, data: T): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.createStoreIfNotExists(storeName);
    const userStoreName = this.getStoreName(storeName);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([userStoreName], 'readwrite');
      const store = transaction.objectStore(userStoreName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.createStoreIfNotExists(storeName);
    const userStoreName = this.getStoreName(storeName);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([userStoreName], 'readwrite');
      const store = transaction.objectStore(userStoreName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const dbManager = new DatabaseManager();
