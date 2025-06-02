import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Share, Trash2, Package, Calendar, Clock, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PedidoService, Pedido } from '@/services/PedidoService';
import PedidoForm from './PedidoForm';

const PedidosSection: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      const data = await PedidoService.obtenerTodos();
      setPedidos(data.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()));
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los pedidos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generarImagenPedido = async (pedido: Pedido, paraCompartir = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Configurar canvas con colores BIOX
    canvas.width = 600;
    canvas.height = 800;

    // Fondo con gradiente BIOX
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#f3f1ff'); // biox-50
    gradient.addColorStop(1, '#ebe5ff'); // biox-100
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Marco decorativo con colores BIOX
    ctx.strokeStyle = '#843dff'; // biox-500
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Configurar texto centrado
    ctx.textAlign = 'center';

    // Logo/Título BIOX con colores oficiales
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#843dff'; // biox-500
    ctx.fillText('🌟 BIOX 🌟', 300, 70);

    // Subtítulo
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#6b21a8'; // biox-700
    ctx.fillText('SISTEMA DE REPARTO', 300, 110);

    // Línea separadora con color BIOX
    ctx.strokeStyle = '#9f75ff'; // biox-400
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(80, 140);
    ctx.lineTo(520, 140);
    ctx.stroke();

    // Información del cliente centrada
    ctx.font = 'bold 22px Arial';
    ctx.fillStyle = '#581c87'; // biox-800
    ctx.fillText('👤 CLIENTE', 300, 180);
    
    ctx.font = '20px Arial';
    ctx.fillStyle = '#4c1d95'; // biox-900
    ctx.fillText(pedido.clienteNombre, 300, 210);
    ctx.fillText(`📍 ${pedido.clienteDireccion}`, 300, 240);

    // Línea separadora
    ctx.strokeStyle = '#9f75ff';
    ctx.beginPath();
    ctx.moveTo(80, 270);
    ctx.lineTo(520, 270);
    ctx.stroke();

    // Detalles del pedido centrados
    ctx.font = 'bold 22px Arial';
    ctx.fillStyle = '#581c87';
    ctx.fillText('📦 DETALLES DEL PEDIDO', 300, 310);

    ctx.font = '18px Arial';
    ctx.fillStyle = '#4c1d95';
    ctx.fillText(`🏷️ Producto: ${pedido.productoNombre}`, 300, 340);
    ctx.fillText(`📊 Cantidad: ${pedido.cantidad} unidades`, 300, 370);
    ctx.fillText(`💰 Precio unitario: S/${pedido.precio.toFixed(2)}`, 300, 400);
    
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#843dff'; // biox-500
    ctx.fillText(`💵 TOTAL: S/${pedido.total.toFixed(2)}`, 300, 440);

    // Línea separadora
    ctx.strokeStyle = '#9f75ff';
    ctx.beginPath();
    ctx.moveTo(80, 470);
    ctx.lineTo(520, 470);
    ctx.stroke();

    // Programación de entrega centrada
    ctx.font = 'bold 22px Arial';
    ctx.fillStyle = '#581c87';
    ctx.fillText('📅 PROGRAMACIÓN DE ENTREGA', 300, 510);

    ctx.font = '18px Arial';
    ctx.fillStyle = '#4c1d95';
    const fechaEntrega = new Date(pedido.fechaEntrega).toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    ctx.fillText(`🗓️ Fecha: ${fechaEntrega}`, 300, 540);
    ctx.fillText(`🕐 Hora: ${pedido.horaEntrega}`, 300, 570);

    // Línea separadora
    ctx.strokeStyle = '#9f75ff';
    ctx.beginPath();
    ctx.moveTo(80, 600);
    ctx.lineTo(520, 600);
    ctx.stroke();

    // Información de registro centrada
    ctx.font = '16px Arial';
    ctx.fillStyle = '#6b21a8'; // biox-700
    const fechaRegistro = new Date(pedido.fecha).toLocaleDateString('es-ES');
    ctx.fillText(`📋 Pedido registrado el ${fechaRegistro} a las ${pedido.hora}`, 300, 640);

    // Footer con branding BIOX centrado
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#843dff'; // biox-500
    ctx.fillText('✨ BIOX - Gestión eficiente de pedidos ✨', 300, 700);

    // Marco interno decorativo
    ctx.strokeStyle = '#bea6ff'; // biox-300
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    if (paraCompartir) {
      // Retornar el blob para compartir
      return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('No se pudo generar la imagen'));
          }
        }, 'image/png', 1.0);
      });
    } else {
      // Descargar imagen
      const link = document.createElement('a');
      link.download = `pedido-${pedido.id}-${pedido.clienteNombre.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL();
      link.click();

      toast({
        title: "Imagen generada",
        description: "La imagen del pedido se ha descargado correctamente"
      });
    }
  };

  const compartirPorWhatsApp = async (pedido: Pedido) => {
    try {
      console.log('Iniciando proceso de compartir pedido:', pedido.id);
      
      // Generar imagen del pedido
      const imageBlob = await generarImagenPedido(pedido, true);
      
      if (!imageBlob) {
        throw new Error('No se pudo generar la imagen del pedido');
      }

      console.log('Imagen generada correctamente, intentando compartir...');

      // Crear mensaje de WhatsApp
      const mensaje = `🌟 *NUEVO PEDIDO BIOX* 🌟

👤 Cliente: ${pedido.clienteNombre}
📍 Dirección: ${pedido.clienteDireccion}
📦 Producto: ${pedido.productoNombre}
📊 Cantidad: ${pedido.cantidad} unidades
💵 Total: S/${pedido.total.toFixed(2)}
📅 Entrega: ${new Date(pedido.fechaEntrega).toLocaleDateString('es-ES')} a las ${pedido.horaEntrega}

✨ BIOX - Gestión eficiente de pedidos ✨`;

      // Intentar usar Web Share API solo si está disponible y el contexto es seguro
      if (navigator.share && navigator.canShare) {
        try {
          const file = new File([imageBlob], `pedido-biox-${pedido.id}.png`, { type: 'image/png' });
          
          // Verificar si se pueden compartir archivos
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'Pedido BIOX',
              text: mensaje,
              files: [file]
            });
            
            toast({
              title: "Pedido compartido",
              description: "Se ha compartido el pedido correctamente"
            });
            return;
          }
        } catch (shareError) {
          console.log('Web Share API falló, usando método alternativo:', shareError);
        }
      }

      // Método alternativo: abrir WhatsApp con mensaje
      const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
      window.open(url, '_blank');
      
      // También descargar la imagen automáticamente
      const link = document.createElement('a');
      link.download = `pedido-biox-${pedido.id}-${pedido.clienteNombre.replace(/\s+/g, '-')}.png`;
      link.href = URL.createObjectURL(imageBlob);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar URL temporal
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);

      toast({
        title: "Pedido preparado para compartir",
        description: "Se ha abierto WhatsApp y descargado la imagen del pedido"
      });

    } catch (error) {
      console.error('Error al compartir:', error);
      toast({
        title: "Error al compartir",
        description: "No se pudo preparar el pedido para compartir. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  const eliminarPedido = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
      try {
        await PedidoService.eliminar(id);
        toast({
          title: "Pedido eliminado",
          description: "El pedido se ha eliminado correctamente"
        });
        cargarPedidos();
      } catch (error) {
        console.error('Error al eliminar pedido:', error);
        toast({
          title: "Error",
          description: "No se pudo eliminar el pedido",
          variant: "destructive"
        });
      }
    }
  };

  const totalPedidos = pedidos.reduce((sum, pedido) => sum + pedido.total, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-primary">Pedidos BIOX</h2>
            <p className="text-muted-foreground">Gestión de pedidos de entrega</p>
          </div>
        </div>
        <div className="text-center">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-primary">Pedidos BIOX</h2>
          <p className="text-muted-foreground">Gestión de pedidos de entrega</p>
        </div>
        <PedidoForm onPedidoCreated={cargarPedidos} />
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{pedidos.length}</div>
            <p className="text-xs text-muted-foreground">Pedidos registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">S/{totalPedidos.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Valor de todos los pedidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Hoy</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {pedidos.filter(p => p.fecha === new Date().toISOString().split('T')[0]).length}
            </div>
            <p className="text-xs text-muted-foreground">Pedidos de hoy</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de pedidos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos de Entrega</CardTitle>
        </CardHeader>
        <CardContent>
          {pedidos.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay pedidos registrados</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Entrega</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{pedido.clienteNombre}</div>
                        <div className="text-sm text-muted-foreground">{pedido.clienteDireccion}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{pedido.productoNombre}</div>
                        <div className="text-sm text-muted-foreground">S/{pedido.precio.toFixed(2)} c/u</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{pedido.cantidad}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-green-600">S/{pedido.total.toFixed(2)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(pedido.fechaEntrega).toLocaleDateString('es-ES')}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{pedido.horaEntrega}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => compartirPorWhatsApp(pedido)}
                          title="Compartir imagen por WhatsApp"
                        >
                          <Share className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generarImagenPedido(pedido)}
                          title="Descargar como imagen"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => eliminarPedido(pedido.id!)}
                          title="Eliminar pedido"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PedidosSection;
