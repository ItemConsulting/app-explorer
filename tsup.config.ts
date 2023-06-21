import { polyfillNode } from "esbuild-plugin-polyfill-node";
import { globSync } from 'glob';
 import { print } from 'q-i';
import { defineConfig, type Options } from 'tsup';


interface MyOptions extends Options {
	d?: string
}


const RESOURCES_PATH = 'src/main/resources';
const ASSETS_PATH = `${RESOURCES_PATH}/assets`;
// const CLIENT_GLOB_EXTENSIONS = '{tsx,ts,jsx,js}';


const SERVER_FILES = globSync(
	`${RESOURCES_PATH}/**/*.ts`,
	{
		absolute: false,
		ignore: [].concat(
			globSync(`${RESOURCES_PATH}/**/*.d.ts`),
			globSync(`${ASSETS_PATH}/**/*.*`),
		),
	}
);
print(SERVER_FILES, { maxItems: Infinity });

export default defineConfig({
	entry: SERVER_FILES,
	esbuildPlugins: [polyfillNode({
		globals: {
			buffer: false,
			process: false,
		},
		polyfills: {
			_stream_duplex: false,
			_stream_passthrough: false,
			_stream_readable: false,
			_stream_transform: false,
			_stream_writable: false,
			assert: false,
			'assert/strict': false,
			async_hooks: false,
			buffer: false,
			child_process: false,
			cluster: false,
			console: false,
			constants: false,
			crypto: false,
			dgram: false,
			diagnostics_channel: false,
			dns: false,
			domain: false,
			events: false,
			fs: false,
			'fs/promises': false,
			http: false,
			http2: false,
			https: false,
			module: false,
			net: false,
			os: false,
			path: false,
			perf_hooks: false,
			process: "empty",
			punycode: false,
			querystring: false,
			readline: false,
			repl: false,
			stream: false,
			string_decoder: false,
			sys: false,
			timers: false,
			'timers/promises': false,
			tls: false,
			tty: false,
			url: false,
			util: true,
			v8: false,
			vm: false,
			wasi: false,
			worker_threads: false,
			zlib: false,
		}
	})],
	esbuildOptions(options, context) {
		// options.alias = {
		// 	'util': './src/main/resources/my_node_modules/util/util.js'
		// };
		options.banner = {
			js: `const globalThis = (1, eval)('this');`
		};
		options.chunkNames = '_chunks/[name]-[hash]';
		// options.target = 'es2020'; // tsup does this for us :)
		// 	options.tsconfig = 'tsconfig.tsup.json'
	},
	external: [ // All these are available runtime in the jar file:
		'/lib/cache',
		/^\/lib\/explorer/,
		'/lib/galimatias',
		'/lib/graphql',
		'/lib/graphql-connection',
		/^\/lib\/guillotine/,
		'/lib/http-client',
		'/lib/license',
		'/lib/router',
		'/lib/util',
		'/lib/vanilla',
		'/lib/thymeleaf',
		'/lib/xp/admin',
		'/lib/xp/app',
		'/lib/xp/auditlog',
		'/lib/xp/auth',
		'/lib/xp/cluster',
		'/lib/xp/common',
		'/lib/xp/content',
		'/lib/xp/context',
		'/lib/xp/event',
		'/lib/xp/export',
		'/lib/xp/grid',
		'/lib/xp/i18n',
		'/lib/xp/io',
		'/lib/xp/mail',
		'/lib/xp/node',
		'/lib/xp/portal',
		'/lib/xp/project',
		'/lib/xp/repo',
		'/lib/xp/scheduler',
		'/lib/xp/schema',
		'/lib/xp/task',
		'/lib/xp/value',
		'/lib/xp/vhost',
		'/lib/xp/websocket',
	],
	format: 'cjs',
	inject: [
		// 'node_modules/buffer/index.js',
		// 'node_modules/core-js/stable/global-this.js', // doesn't help for esbuild-plugin-polyfill-node
		// 'src/main/resources/lib/nashorn/global.ts', // does help for esbuild-plugin-polyfill-node :)

		'node_modules/core-js/stable/object/assign.js',
		// This works, but might not be needed, because I'm using arrayIncludes from @enonic/js-utils
		'node_modules/core-js/stable/array/includes.js',
		'node_modules/core-js/stable/array/from.js',
		'node_modules/core-js/stable/array/find.js',
		'node_modules/core-js/stable/string/replace-all.js',
		// 'node_modules/core-js/stable/math/trunc.js', // Needed by pretty-ms
		// 'node_modules/core-js/stable/number/is-finite.js', // Needed by pretty-ms
		// 'node_modules/core-js/stable/number/is-integer.js',
		// 'node_modules/core-js/stable/parse-float.js',
		// This is needed when treeshake: true
		// So I'm assuming that the injects are not treeshaken
		// 'node_modules/core-js/stable/reflect/index.js'
	],
	minify: false, // Minifying server files makes debugging harder
	noExternal: [
		// To check if you have forgotten any try this command
		// clear && yarn clean && yarn build:tsup && grep -r 'require(' build/resources/main|grep -v '("\.'|grep -v '("\/'

		// TODO: These might need Polyfills for global to run in Nashorn:
		// '@enonic/explorer-utils', //
		// '@enonic/fnv-plus', //
		/^@enonic\/js-utils/, // many places
		// 'array.prototype.find', // tasks/webcrawl/webcrawl
		'cheerio', //
		'gql-query-builder', //
		'core-js', //
		// 'd3-dsv', //
		'deep-object-diff', //
		// 'diff', //
		'fast-deep-equal', //
		'human-object-diff', //
		// 'is-generator-function', // my_node_modules/util
		'object.getownpropertydescriptors', // tasks/webcrawl/webcrawl
		'polyfill-crypto.getrandomvalues', //
		// 'reflect-metadata', //
		'robots-txt-guard', //
		'serialize-javascript', //
		// 'traverse', //
		'uri-js', //

		// Without it TypeError: null is not a function
		// 'util', // node_modules/object-inspect/util.inspect.js
	],
	platform: 'neutral',

	// https://tsup.egoist.dev/#code-splitting
	// Code splitting currently only works with the esm output format,
	// and it's enabled by default.
	// If you want code splitting for cjs output format as well, try
	// using --splitting flag which is an experimental feature to get
	// rid of the limitation in esbuild.
	splitting: true, // Might cause weird error messages at runtime

	shims: false, // https://tsup.egoist.dev/#inject-cjs-and-esm-shims
	sourcemap: false,
	// target: 'es5', // Set in tsconfig.tsup.json

	// https://tsup.egoist.dev/#tree-shaking
	// Tree shaking
	// esbuild has tree shaking enabled by default, but sometimes it's
	// not working very well, see #1794 #1435, so tsup offers an
	// additional option to let you use Rollup for tree shaking instead
	// This option has the same type as the treeshake option in Rollup:
	// https://rollupjs.org/configuration-options/#treeshake
	//
	// Fails after 1m 10s when splitting: false
	// treeshake: true // causes ReferenceError: "Reflect" is not defined
	//
	// In conclusion: The default tree-shaking that esbuild provides is
	// enough, we don't need extra tree-shaking rollup.
	tsconfig: 'tsconfig.tsup.json'
});
