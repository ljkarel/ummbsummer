/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:           '#F1EADB',
        panel:        '#FBF7EC',
        'panel-alt':  '#EDE2C9',
        ink: {
          DEFAULT:    '#1B1410',
          soft:       '#5A4A3B',
        },
        rule: {
          DEFAULT:    '#1B1410',
          soft:       'rgba(27,20,16,.18)',
        },
        brand:        '#7A1F2B',
        accent: {
          DEFAULT:    '#E5A823',
          2:          '#C9522A',
        },
        good:         '#3E6A41',
        chip: {
          DEFAULT:    '#1B1410',
          ink:        '#FBF7EC',
        },
      },
      fontFamily: {
        sans:  ['"Inter"',       'system-ui',  'sans-serif'],
        tight: ['"Inter Tight"', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
