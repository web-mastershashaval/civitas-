/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0e1117",
                surface: "#161b22",
                primary: {
                    DEFAULT: "#e6edf3",
                    muted: "#9ba3b4",
                },
                border: "#222222",
                accent: {
                    DEFAULT: "#4f8cff",
                    teal: "#77cccc",
                    warning: "#f0b429",
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
