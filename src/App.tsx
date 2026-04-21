import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StytchProvider } from "@/providers/StytchProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Authenticate from "./pages/Authenticate";
import Admin from "./pages/Admin";
import FAQ from "./pages/FAQ";
import AskAI from "./pages/AskAI";
import Security from "./pages/Security";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DiagnosticsProbe } from "@/components/diagnostics/DiagnosticsProbe";

const App = () => (
  <ErrorBoundary>
    <ThemeProvider>
      <StytchProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AnalyticsProvider>
              <DiagnosticsProbe />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/authenticate" element={<Authenticate />} />
                <Route path="/dashboard" element={<Index />} />
                <Route path="/dashboard/communities/:communityId" element={<Index />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/ask" element={<AskAI />} />
                <Route path="/security" element={<Security />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnalyticsProvider>
          </BrowserRouter>
        </TooltipProvider>
      </StytchProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
