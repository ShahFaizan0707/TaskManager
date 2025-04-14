import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/Theme/theme-provider";
import MainLayout from "@/layout/MainLayout";
import { Toaster } from "@/components/ui/sonner";
import Auth from "./pages/Auth";
import ProjectDetailPage from '@/pages/ProjectDetails';
import TaskDetail from "./pages/TaskDetails";
import Dashboard from "./pages/Dashboard";

// Protected route component to restrict access to authenticated users
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen w-full">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
        </div>
      </MainLayout>

    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <BrowserRouter>
          <Toaster />
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/project/:projectId"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ProjectDetailPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/project/:projectId/tasks/:taskId"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <TaskDetail />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={
                <MainLayout>
                  <Auth />
                </MainLayout>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;