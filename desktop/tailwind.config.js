/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        panel: "#f3efe7",
        ink: "#182126",
        accent: "#0f766e",
        sand: "#d9cfbe"
      },
      fontFamily: {
        display: ["'Sora'", "sans-serif"],
        body: ["'IBM Plex Sans'", "sans-serif"]
      },
      boxShadow: {
        card: "0 18px 50px rgba(24, 33, 38, 0.08)"
      }
    }
  },
  plugins: []
};
