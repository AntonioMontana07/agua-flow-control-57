
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

  // Función para obtener usuarios registrados
  const getRegisteredUsers = (): RegisteredUser[] => {
    const users = localStorage.getItem('registeredUsers');
    if (users) {
      return JSON.parse(users);
    }
    // Si no hay usuarios, inicializar con el usuario de prueba
    const initialUsers = [testUser];
    localStorage.setItem('registeredUsers', JSON.stringify(initialUsers));
    return initialUsers;
  };

  // Función para guardar usuarios registrados
  const saveRegisteredUsers = (users: RegisteredUser[]) => {
    localStorage.setItem('registeredUsers', JSON.stringify(users));
  };

  useEffect(() => {
    // Verificar si hay una sesión guardada
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        console.log('Sesión restaurada para usuario:', userData.id);
      } catch (error) {
        console.error('Error al restaurar sesión:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
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
        localStorage.setItem('currentUser', JSON.stringify(userData));
        console.log('Login exitoso para usuario:', userData.id);
        setIsLoading(false);
        return true;
      }
      
      console.log('Credenciales incorrectas para email:', email);
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Error en login:', error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const registeredUsers = getRegisteredUsers();
      
      // Verificar si el email ya existe
      const existingUser = registeredUsers.find(user => user.email === email);
      if (existingUser) {
        console.log('Email ya registrado:', email);
        setIsLoading(false);
        return false;
      }

      // Crear nuevo usuario con ID único basado en timestamp y hash
      const newUser: RegisteredUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        password,
        name,
        role: 'repartidor'
      };

      // Agregar a la lista y guardar inmediatamente
      const updatedUsers = [...registeredUsers, newUser];
      saveRegisteredUsers(updatedUsers);

      // Iniciar sesión automáticamente
      const userData = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      };
      
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      console.log('Registro exitoso y login automático para usuario:', userData.id);
      console.log('Credenciales guardadas correctamente en localStorage');
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error en registro:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    console.log('Cerrando sesión para usuario:', user?.id);
    setUser(null);
    localStorage.removeItem('currentUser');
    console.log('Sesión cerrada. Las credenciales permanecen guardadas para futuros logins.');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
