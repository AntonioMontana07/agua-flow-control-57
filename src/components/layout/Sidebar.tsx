
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  BarChart3, 
  LogOut, 
  Sun, 
  Moon 
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const menuItems = [
    { id: 'resumen', label: 'Resumen', icon: Home },
    { id: 'inventario', label: 'Inventario', icon: Package },
    { id: 'compras', label: 'Compras', icon: ShoppingCart },
    { id: 'ventas', label: 'Ventas', icon: TrendingUp },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'reportes', label: 'Reportes', icon: BarChart3 },
  ];

  return (
    <div className="w-56 sm:w-64 h-screen bg-card border-r border-border flex flex-col">
      {/* Logo y usuario */}
      <div className="p-3 sm:p-6 border-b border-border">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
          <img 
            src="/lovable-uploads/82ad7edd-037f-444b-b6ea-1c8b060bc0d5.png" 
            alt="BIOX Logo" 
            className="h-8 sm:h-10 w-auto"
          />
          <div>
            <h1 className="font-bold text-base sm:text-lg text-primary">BIOX</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Sistema de Reparto</p>
          </div>
        </div>
        
        <div className="bg-muted p-2 sm:p-3 rounded-lg">
          <p className="font-medium text-xs sm:text-sm truncate">{user?.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          <p className="text-xs text-primary capitalize">{user?.role}</p>
        </div>
      </div>

      {/* Menú de navegación */}
      <nav className="flex-1 p-2 sm:p-4">
        <div className="space-y-1 sm:space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "ghost"}
                className="w-full justify-start text-xs sm:text-sm py-2 sm:py-2.5"
                onClick={() => onSectionChange(item.id)}
              >
                <Icon className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3" />
                <span className="truncate">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Controles inferiores */}
      <div className="p-2 sm:p-4 border-t border-border space-y-1 sm:space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start text-xs sm:text-sm py-2"
          onClick={toggleTheme}
        >
          {isDark ? (
            <>
              <Sun className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3" />
              <span className="truncate">Modo Claro</span>
            </>
          ) : (
            <>
              <Moon className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3" />
              <span className="truncate">Modo Oscuro</span>
            </>
          )}
        </Button>
        
        <Button
          variant="destructive"
          className="w-full justify-start text-xs sm:text-sm py-2"
          onClick={logout}
        >
          <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3" />
          <span className="truncate">Cerrar Sesión</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
