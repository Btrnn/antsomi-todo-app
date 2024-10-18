/** @type {import('tailwindcss').Config} */
// export const content = ['./src/**/*.{js,jsx,ts,tsx}'];
// export const theme = {
//   extend: {},
// };
// export const plugins = [import('@tailwindcss/line-clamp')];

import lineClamp from '@tailwindcss/line-clamp';

export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [lineClamp],
};
