/**
 * Main Application Component
 * Handles routing, authentication, and global state management
 */

import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import MobileShell from "mobile-shell";
import WebAppRoutes from "./routes/WebAppRoutes";
import NetworkStatus from "./components/NetworkStatus";
import "./styles/global.css";
import "./themes/pro/pro-theme.css";   // Pro theme — activated by html.theme-pro
import "./styles/public-theme-overrides.css"; // Public theme fixes
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { initCapacitor } from "./utils/capacitorInit";

/** Build-time constant so Vite drops WebAppRoutes for native shells (student/parent/faculty). */
const isMobileShell = Boolean(
  import.meta.env.VITE_APP_VARIANT &&
    String(import.meta.env.VITE_APP_VARIANT).toLowerCase() !== "web"
);

function App() {
    useEffect(() => {
        initCapacitor();
    }, []);

    return (
        <BrowserRouter>
            <AuthProvider>
                {/* ThemeProvider must be INSIDE AuthProvider so it can read user */}
                <ThemeProvider>
                    <NetworkStatus />
                    <Toaster position="top-right" />
                    {isMobileShell ? <MobileShell /> : <WebAppRoutes />}
                </ThemeProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
