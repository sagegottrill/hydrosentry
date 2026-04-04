import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SensorNetwork from "./pages/SensorNetwork";
import Analytics from "./pages/Analytics";
import AlertHistory from "./pages/AlertHistory";
import SensorWardens from "./pages/SensorWardens";
import Dispatcher from "./pages/Dispatcher";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { AlertHistoryProvider } from "./hooks/useAlertHistory";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AlertHistoryProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sensors" element={<SensorNetwork />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/alerts" element={<AlertHistory />} />
            <Route path="/wardens" element={<SensorWardens />} />
            <Route path="/dispatcher" element={<Dispatcher />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AlertHistoryProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
