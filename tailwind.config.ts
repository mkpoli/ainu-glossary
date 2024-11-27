import containerQueries from '@tailwindcss/container-queries';
import forms from '@tailwindcss/forms';
import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			boxShadow: {
				hard: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
				harder: '0 1px 3px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1)'
			},
			colors: {
				theme: {
					50: '#e9f6ff',
					100: '#d5e9ff',
					200: '#99c2ff',
					300: '#bcd8ff',
					400: '#76a0f1',
					500: '#5c84d3',
					600: '#567ecc',
					700: '#355aa5',
					800: '#254992',
					900: '#1a3d85',
					950: '#06266c'
				}
			}
		},
		fontFamily: {
			sans: [
				'system-ui',
				'-apple-system',
				'BlinkMacSystemFont',
				'Segoe UI',
				'Roboto',
				'Oxygen',
				'Ubuntu',
				'Cantarell',
				'Open Sans',
				'Helvetica Neue',
				'sans-serif'
			]
		}
	},

	plugins: [forms, containerQueries]
} satisfies Config;
