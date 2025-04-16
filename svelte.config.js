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
		
		prerender: {
			handleMissingId: 'warn'
		}
	}
};

export default config;
