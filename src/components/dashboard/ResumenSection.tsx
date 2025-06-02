
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Package, DollarSign, Users, TrendingUp } from 'lucide-react';

const ResumenSection: React.FC = () => {
  const stats = [
    {
      title: 'Pedidos Hoy',
      value: '24',
      change: '+12%',
      icon: Package,
      color: 'text-blue-600'
    },
    {
      title: 'Ventas del Día',
      value: '$2,450',
      change: '+8%',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Clientes Activos',
      value: '156',
      change: '+5%',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Entregas Completadas',
      value: '18',
      change: '+15%',
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-primary">Resumen del Día</h2>
        <p className="text-muted-foreground">Vista general de tu actividad como repartidor</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className={`text-sm ${stat.color}`}>{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Próximas Entregas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { cliente: 'María González', direccion: 'Av. Principal 123', hora: '14:30', estado: 'Pendiente' },
                { cliente: 'Carlos Ruiz', direccion: 'Calle 45 #78', hora: '15:00', estado: 'En camino' },
                { cliente: 'Ana Martínez', direccion: 'Carrera 12 #34', hora: '15:30', estado: 'Pendiente' }
              ].map((entrega, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{entrega.cliente}</p>
                    <p className="text-sm text-muted-foreground">{entrega.direccion}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{entrega.hora}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      entrega.estado === 'En camino' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {entrega.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventario Bajo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { producto: 'Bidón 20L', cantidad: 5, minimo: 10 },
                { producto: 'Botella 1L', cantidad: 8, minimo: 15 },
                { producto: 'Botella 500ml', cantidad: 12, minimo: 20 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{item.producto}</p>
                    <p className="text-sm text-muted-foreground">Mínimo: {item.minimo}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${
                      item.cantidad < item.minimo ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {item.cantidad}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResumenSection;
