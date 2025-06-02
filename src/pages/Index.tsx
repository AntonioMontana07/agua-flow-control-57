
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Droplets, Truck, Users, BarChart3 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Droplets,
      title: 'Gestión de Inventario',
      description: 'Control completo de tu stock de agua'
    },
    {
      icon: Truck,
      title: 'Rutas de Reparto',
      description: 'Optimiza tus entregas diarias'
    },
    {
      icon: Users,
      title: 'Base de Clientes',
      description: 'Gestiona tu cartera de clientes'
    },
    {
      icon: BarChart3,
      title: 'Reportes Detallados',
      description: 'Analiza tu rendimiento'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex justify-center mb-8">
            <img 
              src="/lovable-uploads/82ad7edd-037f-444b-b6ea-1c8b060bc0d5.png" 
              alt="BIOX Logo" 
              className="h-24 w-auto"
            />
          </div>
          <h1 className="text-5xl font-bold text-primary mb-4">
            Sistema de Reparto BIOX
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            La solución completa para repartidores de agua. Gestiona tu inventario, 
            clientes y entregas de manera eficiente.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <h2 className="text-2xl font-bold text-primary">¡Comienza Ahora!</h2>
              <p className="text-muted-foreground">
                Accede a tu panel de control y optimiza tu negocio
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full text-lg py-6"
                onClick={() => navigate('/auth')}
              >
                Iniciar Sesión
              </Button>
              <p className="text-sm text-muted-foreground">
                ¿Nuevo usuario? Puedes registrarte desde la página de inicio de sesión
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
