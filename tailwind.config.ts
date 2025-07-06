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
        'scan-line': 'scan-line-anim 3s ease-in-out infinite alternate',
      },
      keyframes: {
        'scan-line-anim': {
          '0%': { transform: 'translateY(-10%)' },
          '100%': { transform: 'translateY(calc(280px - 10px))' }, // ปรับตามขนาด qrbox
        }
      }
    },
  },
  plugins: [],
};
export default config;