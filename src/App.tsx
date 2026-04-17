import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import Index from "./pages/Index";
import ComponentShowcase from "./pages/ComponentShowcase";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-raw-black px-6 text-center">
    <div>
      <h1 className="font-display text-2xl text-raw-gold tracking-wide">raW</h1>
      <p className="mt-3 text-sm text-raw-silver/60">
        Something glitched while loading. Please refresh.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-5 rounded-full bg-raw-gold px-6 py-2.5 text-xs font-bold text-raw-black"
      >
        Reload
      </button>
    </div>
  </div>
);

const App = () => (
  <ErrorBoundary fallback={<AppFallback />}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/components" element={<ComponentShowcase />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
