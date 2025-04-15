import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';

const dev = process.env.NODE_ENV === 'development';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: null,
			strict: true
		}),
		paths: {
			base: dev ? '' : '/Gimmie_fries_web'
		},
		prerender: {
			default: true
		}
	}
};

export default config;
