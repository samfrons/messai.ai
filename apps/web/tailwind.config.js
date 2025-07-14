/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // App content
    './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',

    // Shared UI library
    '../../libs/shared/ui/src/**/*.{ts,tsx,js,jsx,html}',
    '!../../libs/shared/ui/src/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',

    // Other shared libraries
    '../../libs/shared/*/src/**/*.{ts,tsx,js,jsx,html}',
    '!../../libs/shared/*/src/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
  ],
  theme: {
    extend: {
      // CETEP-inspired minimalist color palette
      colors: {
        cream: '#f9f4ea',
        black: '#000000',
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
      },

      // Typography - CETEP-inspired serif and monospace combination
      fontFamily: {
        sans: [
          'DM Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
        mono: [
          'DM Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
        serif: ['Crimson Text', 'Dino', 'Georgia', 'Times New Roman', 'serif'],
        display: ['Crimson Text', 'Dino', 'Georgia', 'serif'],
      },

      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },

      // Spacing adjustments for minimalist layout
      spacing: {
        18: '4.5rem',
        88: '22rem',
        128: '32rem',
      },

      // Animations - subtle and smooth
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-in': 'slideIn 0.5s ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },

      // Grid system similar to CETEP
      gridTemplateColumns: {
        12: 'repeat(12, minmax(0, 1fr))',
      },

      // Border radius for minimalist design
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
      },
    },
  },
  plugins: [],
};
