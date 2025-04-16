import adapter from '@sveltejs/adapter-static';
import { sveltePreprocess } from 'svelte-preprocess';

const dev = process.env.NODE_ENV === 'development';

const config = {
	preprocess: sveltePreprocess(),
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: null,
			strict: false
		}),
		paths: {
			base: dev ? '' : '/Gimmie_fries_web'
		},
		prerender: {
			handleMissingId: 'warn'
		}
	}
};

export default config;