/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Manrope', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        'soft-xs': '0 1px 2px rgba(15, 23, 42, 0.04)',
        'soft-sm': '0 2px 4px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)',
        'soft-md': '0 4px 12px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -1px rgba(15, 23, 42, 0.04)',
        'soft-lg': '0 12px 28px -4px rgba(15, 23, 42, 0.09), 0 4px 10px -2px rgba(15, 23, 42, 0.04)',
        'soft-xl': '0 20px 40px -8px rgba(15, 23, 42, 0.14), 0 8px 16px -4px rgba(15, 23, 42, 0.06)',
        'glow-indigo': '0 0 20px rgba(99, 102, 241, 0.25)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.3)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.25)',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.75, transform: 'scale(1.05)' },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(16px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: 0, transform: 'translateY(-10px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: 0, transform: 'translateX(24px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        scaleUp: {
          from: { opacity: 0, transform: 'scale(0.96) translateY(6px)' },
          to: { opacity: 1, transform: 'scale(1) translateY(0)' },
        },
        checkPop: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.35)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        achievementGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)' },
          '50%': { boxShadow: '0 0 32px rgba(245, 158, 11, 0.55)' },
        },
        progressFill: {
          from: { width: '0%' },
          to: { width: 'var(--progress-width, 0%)' },
        },
        listItemIn: {
          from: { opacity: 0, transform: 'translateX(-8px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        fabPulse: {
          '0%, 100%': { boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)' },
          '50%': { boxShadow: '0 4px 22px rgba(99, 102, 241, 0.6)' },
        },
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 2.5s infinite ease-in-out',
        'slide-up': 'slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.2s ease forwards',
        'scale-up': 'scaleUp 0.24s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'check-pop': 'checkPop 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shimmer': 'shimmer 1.6s infinite linear',
        'achievement-glow': 'achievementGlow 2s infinite ease-in-out',
        'list-item-in': 'listItemIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fab-pulse': 'fabPulse 2.5s infinite ease-in-out',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
