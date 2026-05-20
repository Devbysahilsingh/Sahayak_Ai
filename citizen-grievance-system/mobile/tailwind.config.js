/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: "#08111f",
        panel: "rgba(15, 23, 42, 0.78)",
        stroke: "rgba(148, 163, 184, 0.22)",
        text: "#e5eefb",
        muted: "#93a4b8",
        teal: "#14b8a6",
        amber: "#f59e0b",
        danger: "#ef4444"
      }
    }
  },
  plugins: []
};
