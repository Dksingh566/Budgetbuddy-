
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { ExpenseProvider } from "@/context/ExpenseContext";
import { AuthProvider } from "@/context/AuthContext";
import { GroupProvider } from "@/context/GroupContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import Expenses from "@/pages/Expenses";
import Income from "@/pages/Income";
import Budgets from "@/pages/Budgets";
import Reports from "@/pages/Reports";
import History from "@/pages/History";
import Settings from "@/pages/Settings";
import Account from "@/pages/Account";
import Login from "@/pages/Auth/Login";
import Signup from "@/pages/Auth/Signup";
import ResetPassword from "@/pages/Auth/ResetPassword";
import ResetPasswordConfirmation from "@/pages/Auth/ResetPasswordConfirmation";
import NotFound from "@/pages/NotFound";
import Groups from "@/pages/Groups";
import GroupDetail from "@/pages/GroupDetail";
import JoinGroup from "@/pages/JoinGroup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <CurrencyProvider>
          <ExpenseProvider>
            <GroupProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    {/* Auth Routes */}
                    <Route path="/auth/login" element={<Login />} />
                    <Route path="/auth/signup" element={<Signup />} />
                    <Route path="/auth/reset-password" element={<ResetPassword />} />
                    <Route path="/auth/reset-password-confirmation" element={<ResetPasswordConfirmation />} />
                    <Route path="/join/:inviteCode" element={<JoinGroup />} />
                    
                    {/* Protected Routes */}
                    <Route path="/" element={<Layout />}>
                      <Route index element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                      <Route path="expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
                      <Route path="income" element={<ProtectedRoute><Income /></ProtectedRoute>} />
                      <Route path="budgets" element={<ProtectedRoute><Budgets /></ProtectedRoute>} />
                      <Route path="reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                      <Route path="history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                      <Route path="account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                      <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                      <Route path="groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
                      <Route path="groups/:groupId" element={<ProtectedRoute><GroupDetail /></ProtectedRoute>} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </GroupProvider>
          </ExpenseProvider>
        </CurrencyProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
