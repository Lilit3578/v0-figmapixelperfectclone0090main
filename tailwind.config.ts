/** @type {import('tailwindcss').Config} */

const designSystemConfig = require('nullab-design-system/tailwind');

module.exports = {
  // Spread design system's Tailwind config properties (theme, plugins, etc.)
  ...designSystemConfig,

  // Merge the content arrays (avoid duplicates if needed)
  content: [
    "./pages/*/.{ts,tsx}",
    "./components/*/.{ts,tsx}",
    "./app/*/.{ts,tsx}",
    "./src/*/.{ts,tsx,js,jsx}",

    // Include your design system compiled JS files and design system config's content
    "./node_modules/nullab-design-system/dist/*/.{js,ts,jsx,tsx}",
    "./node_modules/nullab-design-system/dist/*/.{js,mjs}",
    ...designSystemConfig.content,
  ],

  // If you want to override or extend the theme/plugins from design system config, do it here
  theme: {
    ...designSystemConfig.theme,
    extend: {
      ...designSystemConfig.theme?.extend,
      // your custom extensions here (if any)
    },
  },

  plugins: [
    ...(designSystemConfig.plugins || []),
    // your custom plugins here (if any)
  ],
};
