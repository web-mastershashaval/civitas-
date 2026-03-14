/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0b0e14",
                surface: "#151921",
                "surface-bright": "#1c222d",
                primary: {
                    DEFAULT: "#f0f2f5",
                    muted: "#94a3b8",
                },
                border: "#262c36",
                accent: {
                    DEFAULT: "#3b82f6",
                    gold: "#eab308",
                    crimson: "#ef4444",
                    success: "#22c55e",
                },
            },
            fontFamily: {
                sans: [
                    "system-ui",
                    "-apple-system",
                    "BlinkMacSystemFont",
                    "Segoe UI",
                    "Roboto",
                    "Helvetica Neue",
                    "Arial",
                    "sans-serif",
                ],
            },
        },
    },
    plugins: [],
}
