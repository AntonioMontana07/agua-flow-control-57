
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Package, DollarSign, Users, TrendingUp } from 'lucide-react';

const ResumenSection: React.FC = () => {
  const stats = [
    {
      title: 'Pedidos Hoy',
      value: '0',
      change: '+0%',
      icon: Package,
      color: 'text-blue-600'
    },
    {
      title: 'Ventas del Día',
      value: 'S/0.00',
      change: '+0%',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Clientes Activos',
      value: '0',
      change: '+0%',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Entregas Completadas',
      value: '0',
      change: '+0%',
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
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tienes entregas programadas</p>
              <p className="text-sm text-muted-foreground mt-2">
                Las entregas aparecerán aquí cuando tengas pedidos activos
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventario Bajo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay productos con stock bajo</p>
              <p className="text-sm text-muted-foreground mt-2">
                Los productos con stock bajo aparecerán aquí
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResumenSection;
