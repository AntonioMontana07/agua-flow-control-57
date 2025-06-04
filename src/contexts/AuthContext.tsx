
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface RegisteredUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Usuario de prueba inicial
  const testUser: RegisteredUser = {
    id: '1',
    email: 'repartidor@biox.com',
    password: 'password123',
    name: 'Juan Carlos Pérez',
    role: 'repartidor'
  };

  // Función para obtener usuarios registrados con manejo de errores
  const getRegisteredUsers = (): RegisteredUser[] => {
    try {
      const users = localStorage.getItem('registeredUsers');
      if (users) {
        const parsedUsers = JSON.parse(users);
        // Validar que sea un array
        if (Array.isArray(parsedUsers)) {
          return parsedUsers;
        }
      }
    } catch (error) {
      console.error('Error al leer usuarios del localStorage:', error);
    }
    
    // Si hay error o no hay usuarios, inicializar con el usuario de prueba
    const initialUsers = [testUser];
    try {
      localStorage.setItem('registeredUsers', JSON.stringify(initialUsers));
    } catch (error) {
      console.error('Error al guardar usuarios iniciales:', error);
    }
    return initialUsers;
  };

  // Función para guardar usuarios registrados con manejo de errores
  const saveRegisteredUsers = (users: RegisteredUser[]): boolean => {
    try {
      localStorage.setItem('registeredUsers', JSON.stringify(users));
      return true;
    } catch (error) {
      console.error('Error al guardar usuarios en localStorage:', error);
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Verificar si hay una sesión guardada
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            // Validar que los datos del usuario sean válidos
            if (userData && userData.id && userData.email && userData.name) {
              setUser(userData);
              console.log('Sesión restaurada para usuario:', userData.id);
            } else {
              console.log('Datos de usuario inválidos, eliminando sesión');
              localStorage.removeItem('currentUser');
            }
          } catch (parseError) {
            console.error('Error al parsear datos de usuario:', parseError);
            localStorage.removeItem('currentUser');
          }
        }
      } catch (error) {
        console.error('Error al inicializar autenticación:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('Intentando login para:', email);
      const registeredUsers = getRegisteredUsers();
      const foundUser = registeredUsers.find(
        user => user.email === email && user.password === password
      );

      if (foundUser) {
        const userData = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          role: foundUser.role
        };
        
        setUser(userData);
        
        try {
          localStorage.setItem('currentUser', JSON.stringify(userData));
        } catch (storageError) {
          console.error('Error al guardar sesión:', storageError);
          // Continúar sin guardar la sesión
        }
        
        console.log('Login exitoso para usuario:', userData.id);
        return true;
      }
      
      console.log('Credenciales incorrectas para email:', email);
      return false;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('Iniciando registro para:', email);
      
      // Validaciones básicas
      if (!email || !password || !name) {
        console.error('Datos incompletos para registro');
        return false;
      }

      if (password.length < 6) {
        console.error('Contraseña muy corta');
        return false;
      }

      const registeredUsers = getRegisteredUsers();
      
      // Verificar si el email ya existe
      const existingUser = registeredUsers.find(user => user.email === email);
      if (existingUser) {
        console.log('Email ya registrado:', email);
        return false;
      }

      // Crear nuevo usuario con ID único
      const newUser: RegisteredUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: email.trim(),
        password,
        name: name.trim(),
        role: 'repartidor'
      };

      console.log('Creando nuevo usuario:', newUser.id);

      // Agregar a la lista y guardar
      const updatedUsers = [...registeredUsers, newUser];
      const saveSuccess = saveRegisteredUsers(updatedUsers);
      
      if (!saveSuccess) {
        console.error('Error al guardar usuario registrado');
        return false;
      }

      // Iniciar sesión automáticamente
      const userData = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      };
      
      setUser(userData);
      
      try {
        localStorage.setItem('currentUser', JSON.stringify(userData));
      } catch (storageError) {
        console.error('Error al guardar sesión después del registro:', storageError);
        // Continúar, el usuario ya está registrado
      }
      
      console.log('Registro exitoso y login automático para usuario:', userData.id);
      return true;
    } catch (error) {
      console.error('Error crítico en registro:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      console.log('Cerrando sesión para usuario:', user?.id);
      setUser(null);
      localStorage.removeItem('currentUser');
      console.log('Sesión cerrada correctamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
