/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "custom-gray": "#7e7a7a",
      },
      backgroundColor: {
        "custom-gray-60": "rgba(126, 122, 122, 0.6)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
