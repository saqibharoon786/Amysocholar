// App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PublicRoutes from "./routes/PublicRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import SuperAdminRoutes from "./routes/SuperAdminRoutes";
import Auth from "@/pages/Auth";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* ✅ Centralized routing directly here */}
          <Routes>
            {/* Public */}
            <Route path="/*" element={<PublicRoutes />} />
<Route path="/auth" element={<Auth />} />
            {/* Admin */}
            <Route path="/admin/*" element={<AdminRoutes />} />

            {/* Super Admin */}
            <Route path="/superadmin/*" element={<SuperAdminRoutes />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
