/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './dom-space-harvester.tsx'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Discord/Exodus-inspired dark theme
        background: {
          primary: '#0A0E27',
          secondary: '#151A31',
          tertiary: '#1E2438',
          elevated: '#252B45',
        },
        surface: {
          DEFAULT: '#151A31',
          hover: '#252B45',
        },
        accent: {
          blue: {
            light: '#6C7BFF',
            DEFAULT: '#5865F2',
            dark: '#4752C4',
          },
          purple: {
            light: '#9D7CFF',
            DEFAULT: '#7C5CFF',
            dark: '#6344D1',
          },
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B9BBBE',
          tertiary: '#72767D',
          disabled: '#4F545C',
        },
        border: {
          DEFAULT: '#2E3349',
          light: '#40444B',
          focus: '#5865F2',
        },
        semantic: {
          success: '#3BA55C',
          warning: '#FAA61A',
          error: '#ED4245',
          info: '#5865F2',
        },
        // Kaggle Material Design light theme tokens
        kaggle: {
          background: {
            white: '#ffffff',
            light: '#f8f9fa',
            medium: '#e8eaed',
            dark: '#47494d',
            darker: '#595b5e',
          },
          text: {
            primary: '#202124',
            secondary: '#5f6368',
            tertiary: '#3c4043',
            black: '#000000',
            muted: '#101010',
          },
          border: {
            light: '#dadce0',
            medium: '#bdc1c6',
            dark: '#9aa0a6',
            black: '#000000',
          },
          accent: {
            blue: '#20beff',
            green: '#1ccd76',
            yellow: '#e5cf4a',
          },
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        heading: [
          'Montserrat',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        // Kaggle fonts
        zeitung: ['Zeitung', 'sans-serif'],
        'kaggle-sans': ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #5865F2 0%, #7C5CFF 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #6C7BFF 0%, #9D7CFF 100%)',
        'gradient-hero': 'linear-gradient(135deg, #0A0E27 0%, #1E2438 50%, #252B45 100%)',
        'gradient-card': 'linear-gradient(135deg, #151A31 0%, #1E2438 100%)',
      },
      boxShadow: {
        glow: '0 0 20px rgba(88, 101, 242, 0.4)',
        'glow-purple': '0 0 20px rgba(124, 92, 255, 0.4)',
        // Kaggle Material Design elevation
        'kaggle-sm':
          'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px',
        'kaggle-md':
          'rgba(60, 64, 67, 0.3) 0px 2px 6px 2px, rgba(60, 64, 67, 0.15) 0px 1px 2px 0px',
        'kaggle-lg':
          'rgba(60, 64, 67, 0.3) 0px 4px 8px 3px, rgba(60, 64, 67, 0.15) 0px 1px 3px 0px',
      },
      spacing: {
        // Kaggle spacing scale
        4.5: '1.125rem', // 18px
        11: '2.75rem', // 44px
        13: '3.25rem', // 52px
        15: '3.75rem', // 60px
        18: '4.5rem', // 72px
        22: '5.5rem', // 88px
        26: '6.5rem', // 104px
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        glow: 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(88, 101, 242, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(88, 101, 242, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};
