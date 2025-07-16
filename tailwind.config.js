/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
      },
      typography: {
        'block': {
          css: {
            // Reset all margins to 0 - let the wrapper control spacing
            'h1, h2, h3, h4, h5, h6': {
              marginTop: '0',
              marginBottom: '0',
            },
            'p': {
              marginTop: '0',
              marginBottom: '0',
            },
            'ul, ol': {
              marginTop: '0',
              marginBottom: '0',
            },
            'li': {
              marginTop: '0',
              marginBottom: '0',
            },
            'blockquote': {
              marginTop: '0',
              marginBottom: '0',
            },
            'pre': {
              marginTop: '0',
              marginBottom: '0',
            },
            'hr': {
              marginTop: '0',
              marginBottom: '0',
            },
            // Keep internal spacing for lists
            'ul > li, ol > li': {
              marginBottom: '0.25rem',
            },
            'ul > li:last-child, ol > li:last-child': {
              marginBottom: '0',
            },
          },
        },
      },
    },
  },
  plugins: [],
};