import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				support: {
					DEFAULT: 'hsl(var(--support))',
					foreground: 'hsl(var(--support-foreground))'
				},
				oppose: {
					DEFAULT: 'hsl(var(--oppose))',
					foreground: 'hsl(var(--oppose-foreground))'
				},
				neutral: 'hsl(var(--neutral))',
				'battle-token': {
					DEFAULT: 'hsl(var(--battle-token))',
					foreground: 'hsl(var(--battle-token-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-support': 'var(--gradient-support)',
				'gradient-oppose': 'var(--gradient-oppose)',
				'gradient-card': 'var(--gradient-card)',
				'gradient-gold': 'var(--gradient-gold)',
				'gradient-battle': 'var(--gradient-battle)',
			},
			boxShadow: {
				'glow': 'var(--shadow-glow)',
				'gold': 'var(--shadow-gold)',
				'card': 'var(--shadow-card)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'pulse-glow': {
					'0%, 100%': {
						opacity: '1',
						transform: 'scale(1)'
					},
					'50%': {
						opacity: '0.8',
						transform: 'scale(1.05)'
					}
				},
				'loading-dots': {
					'0%, 80%, 100%': {
						transform: 'scale(0)'
					},
					'40%': {
						transform: 'scale(1)'
					}
				},
				'glow-wave': {
					'0%': {
						filter: 'drop-shadow(0 0 5px hsl(var(--primary) / 0.3))',
						transform: 'scale(1)'
					},
					'25%': {
						filter: 'drop-shadow(0 0 20px hsl(var(--primary) / 0.8)) drop-shadow(0 0 40px hsl(var(--primary) / 0.5))',
						transform: 'scale(1.02)'
					},
					'50%': {
						filter: 'drop-shadow(0 0 30px hsl(var(--accent) / 0.9)) drop-shadow(0 0 60px hsl(var(--accent) / 0.6))',
						transform: 'scale(1.05)'
					},
					'75%': {
						filter: 'drop-shadow(0 0 20px hsl(var(--primary) / 0.8)) drop-shadow(0 0 40px hsl(var(--primary) / 0.5))',
						transform: 'scale(1.02)'
					},
					'100%': {
						filter: 'drop-shadow(0 0 5px hsl(var(--primary) / 0.3))',
						transform: 'scale(1)'
					}
				},
				'sweep-light': {
					'0%': {
						transform: 'translateX(-100%)',
						opacity: '0'
					},
					'10%': {
						opacity: '1'
					},
					'90%': {
						opacity: '1'
					},
					'100%': {
						transform: 'translateX(100%)',
						opacity: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'loading-dots': 'loading-dots 1.4s ease-in-out infinite both',
				'glow-wave': 'glow-wave 3s ease-in-out infinite',
				'sweep-light': 'sweep-light 3s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
