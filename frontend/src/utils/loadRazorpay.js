export const loadRazorpay = () => {
    return new Promise((resolve, reject) => {
        if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            reject(new Error("Razorpay SDK failed to load. Are you online?"));
        };
        document.body.appendChild(script);
    });
};
