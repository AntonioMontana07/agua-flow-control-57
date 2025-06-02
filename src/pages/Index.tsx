
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8 sm:py-16">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-16 animate-fade-in">
          <div className="flex justify-center mb-6 sm:mb-8">
            <img 
              src="/lovable-uploads/82ad7edd-037f-444b-b6ea-1c8b060bc0d5.png" 
              alt="BIOX Logo" 
              className="h-16 sm:h-24 w-auto"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4">
            Sistema de Reparto BIOX
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            La solución completa para repartidores de agua
          </p>
        </div>

        {/* CTA Section */}
        <div className="text-center max-w-sm mx-auto">
          <Card>
            <CardHeader className="pb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-primary">¡Comienza Ahora!</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Accede a tu panel de control
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full text-base sm:text-lg py-4 sm:py-6"
                onClick={() => navigate('/auth')}
              >
                Iniciar Sesión
              </Button>
              <p className="text-xs sm:text-sm text-muted-foreground">
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
