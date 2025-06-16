import adapter from '@sveltejs/adapter-vercel';

const config = {
  kit: {
    adapter: adapter({
      runtime: 'nodejs18.x', // or 'nodejs22.x' depending on your environment
    }),
  },
};

export default config;

// import adapter from '@sveltejs/adapter-static';

// /** @type {import('@sveltejs/kit').Config} */
// const config = {
// 	kit: {
// 		adapter: adapter({
// 			pages: 'build',
// 			assets: 'build',
// 			fallback: 'index.html',
// 			precompress: false,
// 			strict: false
// 		})
// 	}
// };

// export default config;
