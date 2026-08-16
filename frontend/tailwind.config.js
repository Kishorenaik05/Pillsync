/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                },
                dark: {
                    100: '#1e293b',
                    200: '#0f172a',
                    300: '#020617',
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            boxShadow: {
                card: '0 4px 24px 0 rgba(37, 99, 235, 0.08)',
                glow: '0 0 20px rgba(59, 130, 246, 0.3)',
            },
        },
    },
    plugins: [],
}
