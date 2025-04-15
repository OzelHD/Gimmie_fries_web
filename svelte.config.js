import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

const dev = process.env.NODE_ENV === 'development';

const config = {
  preprocess: preprocess(),
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
      entries: ['*'] // make everything static
    }
  }
};

export default config;
