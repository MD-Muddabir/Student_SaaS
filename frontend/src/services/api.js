import axios from "axios";

/** Use VITE_API_BASE_URL for Capacitor/device builds (e.g. https://api.yourschool.com/api). */
function resolveBaseURL() {
    const fromEnv = import.meta.env.VITE_API_BASE_URL;
    if (fromEnv && String(fromEnv).trim()) {
        return String(fromEnv).replace(/\/$/, "");
    }
    return `${window.location.protocol}//${window.location.hostname}:5000/api`;
}

const api = axios.create({
    baseURL: resolveBaseURL(),
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle Payment Required (Pending Subscription)
        if (error.response && error.response.status === 402) {
            // Check if not already on checkout page to avoid loops
            if (!window.location.pathname.includes('/checkout')) {
                window.location.href = "/checkout";
            }
        }

        // Handle Subscription Expired
        if (error.response && error.response.status === 403 && error.response.data.code === 'SUBSCRIPTION_EXPIRED') {
            if (!window.location.pathname.includes('/renew-plan')) {
                window.location.href = "/renew-plan";
            }
        }

        // Handle Suspended Account
        if (error.response && error.response.status === 403 && error.response.data.message?.includes("suspended")) {
            alert("⚠️ Your institute account has been suspended by the Super Admin. Please contact support.");
            // Optionally log out the user:
            // localStorage.clear();
            // window.location.href = "/login";
        }

        // Handle Manager Account Blocked (real-time enforcement)
        if (error.response && error.response.status === 403 && error.response.data.code === 'ACCOUNT_BLOCKED') {
            try {
                const stored = localStorage.getItem('user');
                if (stored) {
                    const u = JSON.parse(stored);
                    if (u.status !== 'blocked') {
                        u.status = 'blocked';
                        localStorage.setItem('user', JSON.stringify(u));
                        window.location.href = "/admin/dashboard";
                    } else if (!window.location.pathname.includes('/admin/dashboard')) {
                        window.location.href = "/admin/dashboard";
                    }
                }
            } catch { }
        }

        return Promise.reject(error);
    }
);

export default api;
