module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}", // Semua screen & layout di src/app/
    "./src/modules/**/*.{js,jsx,ts,tsx}", // Semua komponen, hooks, dsb di src/modules/
    "./src/components/**/*.{js,jsx,ts,tsx}", // Global reusable components di src/components/
    "./src/hooks/**/*.{js,jsx,ts,tsx}", // Global hooks di src/hooks/
    "./src/store/**/*.{js,jsx,ts,tsx}", // Zustand store di src/store/
    "./src/services/**/*.{js,jsx,ts,tsx}", // Service di src/services/
    "./src/utils/**/*.{js,jsx,ts,tsx}", // Helper functions di src/utils/
    "./src/localization/**/*.{js,jsx,ts,tsx}", // Komponen di src/localization/
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
