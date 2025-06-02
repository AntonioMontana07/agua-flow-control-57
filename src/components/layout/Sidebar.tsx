
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  BarChart3, 
  LogOut, 
  Sun, 
  Moon,
  Receipt,
  ClipboardList
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const AppSidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const menuItems = [
    { id: 'resumen', label: 'Resumen', icon: Home },
    { id: 'inventario', label: 'Inventario', icon: Package },
    { id: 'pedidos', label: 'Pedidos', icon: ClipboardList },
    { id: 'compras', label: 'Compras', icon: ShoppingCart },
    { id: 'gastos', label: 'Gastos', icon: Receipt },
    { id: 'ventas', label: 'Ventas', icon: TrendingUp },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'reportes', label: 'Reportes', icon: BarChart3 },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        {/* Solo título, sin logo */}
        <div className="mb-4">
          <h1 className="font-bold text-lg text-primary">BIOX</h1>
          <p className="text-sm text-muted-foreground">Sistema de Reparto</p>
        </div>
        
        <div className="bg-muted p-3 rounded-lg">
          <p className="font-medium text-sm truncate">{user?.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          <p className="text-xs text-primary capitalize">{user?.role}</p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeSection === item.id}
                    onClick={() => onSectionChange(item.id)}
                    className="w-full justify-start"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={toggleTheme} className="w-full justify-start">
              {isDark ? (
                <>
                  <Sun className="h-4 w-4" />
                  <span>Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  <span>Modo Oscuro</span>
                </>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} className="w-full justify-start text-destructive hover:text-destructive">
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
