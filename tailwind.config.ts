/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // Scan all files in app directory
    "./components/**/*.{js,ts,jsx,tsx}", // Scan components (e.g., shadcn/ui)
  ],
  theme: {
    extend: {}, // Add customizations if needed
  },
  plugins: [],
};
