import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { dark } from "@clerk/themes";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Savings from "./pages/Savings";
import LandingPage from "./pages/LandingPage";
import { ThemeProvider, useTheme } from "./components/ThemeProvider";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing Publishable Key");
}

function ClerkProviderWithRoutes() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <ClerkProvider
      appearance={{
        baseTheme: theme === 'dark' ? dark : undefined,
      }}
      publishableKey={clerkPubKey}
      navigate={(to) => navigate(to)}
    >
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Protected Main App Routes */}
        <Route
          path="/dashboard"
          element={
            <>
              <SignedIn>
                <Layout />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        >
          <Route index element={<Dashboard />} />
        </Route>

        <Route
          path="/transactions"
          element={
            <>
              <SignedIn><Layout /></SignedIn>
              <SignedOut><RedirectToSignIn /></SignedOut>
            </>
          }
        >
          <Route index element={<Transactions />} />
        </Route>
        <Route
          path="/budgets"
          element={
            <>
              <SignedIn><Layout /></SignedIn>
              <SignedOut><RedirectToSignIn /></SignedOut>
            </>
          }
        >
          <Route index element={<Budgets />} />
        </Route>

        <Route
          path="/savings"
          element={
            <>
              <SignedIn><Layout /></SignedIn>
              <SignedOut><RedirectToSignIn /></SignedOut>
            </>
          }
        >
          <Route index element={<Savings />} />
        </Route>

      </Routes>
    </ClerkProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
              fontSize: '14px',
              fontWeight: '500',
              borderRadius: '12px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: 'white',
              },
            },
          }}
        />
        <ClerkProviderWithRoutes />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
