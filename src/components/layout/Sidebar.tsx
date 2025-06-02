
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
    <div className="w-64 h-screen bg-card border-r border-border flex flex-col">
      {/* Logo y usuario */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3 mb-4">
          <img 
            src="/lovable-uploads/82ad7edd-037f-444b-b6ea-1c8b060bc0d5.png" 
            alt="BIOX Logo" 
            className="h-10 w-auto"
          />
          <div>
            <h1 className="font-bold text-lg text-primary">BIOX</h1>
            <p className="text-sm text-muted-foreground">Sistema de Reparto</p>
          </div>
        </div>
        
        <div className="bg-muted p-3 rounded-lg">
          <p className="font-medium text-sm">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          <p className="text-xs text-primary capitalize">{user?.role}</p>
        </div>
      </div>

      {/* Menú de navegación */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => onSectionChange(item.id)}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Controles inferiores */}
      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={toggleTheme}
        >
          {isDark ? (
            <>
              <Sun className="h-4 w-4 mr-3" />
              Modo Claro
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 mr-3" />
              Modo Oscuro
            </>
          )}
        </Button>
        
        <Button
          variant="destructive"
          className="w-full justify-start"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
