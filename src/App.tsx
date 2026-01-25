import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BottomNav } from "./components/BottomNav";
import Home from "./pages/Home";
import Search from "./pages/Search";
import CreateRanking from "./pages/CreateRanking";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import RankingDetail from "./pages/RankingDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
// Admin pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminRankings from "./pages/admin/Rankings";
import AdminReports from "./pages/admin/Reports";
import AdminCategories from "./pages/admin/Categories";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Admin route wrapper
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Guest route wrapper (redirect to home if logged in)
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Layout with bottom nav
function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <Routes>
            {/* Auth routes (guest only) */}
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />
            <Route
              path="/register"
              element={
                <GuestRoute>
                  <Register />
                </GuestRoute>
              }
            />

            {/* Public routes with bottom nav */}
            <Route
              path="/"
              element={
                <MainLayout>
                  <Home />
                </MainLayout>
              }
            />
            <Route
              path="/search"
              element={
                <MainLayout>
                  <Search />
                </MainLayout>
              }
            />
            <Route
              path="/ranking/:id"
              element={
                <MainLayout>
                  <RankingDetail />
                </MainLayout>
              }
            />
            <Route
              path="/user/:username"
              element={
                <MainLayout>
                  <UserProfile />
                </MainLayout>
              }
            />

            {/* Protected routes with bottom nav */}
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CreateRanking />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Notifications />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Profile />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin routes (no bottom nav) */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="rankings" element={<AdminRankings />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="categories" element={<AdminCategories />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
