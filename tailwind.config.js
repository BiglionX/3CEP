/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
    './src/contexts/**/*.{ts,tsx}',
    './src/hooks/**/*.{ts,tsx}',
    './src/services/**/*.{ts,tsx}',
    './src/types/**/*.{ts,tsx}',
    './src/stores/**/*.{ts,tsx}',
    './src/tech/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      screens: {
        // 精细化移动端断点
        xs: '375px', // 小型手机
        sm: '640px', // 大型手机
        md: '768px', // 平板竖屏
        lg: '1024px', // 平板横屏/小型桌面
        xl: '1280px', // 桌面
        '2xl': '1536px', // 大型桌面
        // 特殊设备断点
        'mobile-s': '320px', // 最小手机屏幕
        'mobile-m': '375px', // iPhone SE/标准手机
        'mobile-l': '425px', // 大屏手机
        tablet: '768px', // iPad竖屏
        laptop: '1024px', // 笔记本电脑
        desktop: '1200px', // 桌面显示器
        wide: '1440px', // 宽屏显示器
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      // 移动端专用间距和尺寸
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
        'touch-target': '44px',
        'mobile-header': '56px',
        'mobile-nav': '60px',
      },
      // 移动端字体大小
      fontSize: {
        'mobile-xs': ['0.75rem', { lineHeight: '1rem' }],
        'mobile-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'mobile-base': ['1rem', { lineHeight: '1.5rem' }],
        'mobile-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'mobile-xl': ['1.25rem', { lineHeight: '1.75rem' }],
      },
      // 移动端圆角
      borderRadius: {
        mobile: '0.75rem',
        'mobile-lg': '1rem',
        'mobile-full': '9999px',
      },
      // 移动端阴影
      boxShadow: {
        mobile: '0 2px 8px rgba(0, 0, 0, 0.1)',
        'mobile-lg': '0 4px 16px rgba(0, 0, 0, 0.15)',
        'mobile-xl': '0 8px 32px rgba(0, 0, 0, 0.2)',
      },
      // 移动端网格列数
      gridTemplateColumns: {
        'mobile-1': 'repeat(1, minmax(0, 1fr))',
        'mobile-2': 'repeat(2, minmax(0, 1fr))',
        'mobile-3': 'repeat(3, minmax(0, 1fr))',
        'mobile-4': 'repeat(4, minmax(0, 1fr))',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
