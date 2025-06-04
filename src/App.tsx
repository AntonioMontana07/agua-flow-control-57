
import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useLazyImport } from "@/hooks/useLazyImport";
import LazyLoader from "@/components/common/LazyLoader";

const queryClient = new QueryClient();

const AppLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <img 
        src="/lovable-uploads/82ad7edd-037f-444b-b6ea-1c8b060bc0d5.png" 
        alt="BIOX Logo" 
        className="h-16 w-auto mx-auto mb-4 animate-pulse"
      />
      <p className="text-muted-foreground">Cargando...</p>
    </div>
  </div>
);

const AppContent = () => {
  const { user, isLoading } = useAuth();
  const { LazyIndex, LazyAuth, LazyNotFound, LazyDashboard } = useLazyImport();

  if (isLoading) {
    return <AppLoadingFallback />;
  }

  return (
    <Suspense fallback={<AppLoadingFallback />}>
      <Routes>
        {user ? (
          <Route path="*" element={<LazyLoader component={LazyDashboard} />} />
        ) : (
          <>
            <Route path="/" element={<LazyLoader component={LazyIndex} />} />
            <Route path="/auth" element={<LazyLoader component={LazyAuth} />} />
            <Route path="*" element={<LazyLoader component={LazyNotFound} />} />
          </>
        )}
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
