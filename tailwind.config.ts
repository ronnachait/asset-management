// In tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // ... paths to your files
  ],
  theme: {
    extend: {
      // เพิ่ม animation และ keyframes
      animation: {
        "scan-line": "scanLine 2s linear infinite",
      },
      keyframes: {
        scanLine: {
          "0%": { top: "0%" },
          "100%": { top: "100%" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
