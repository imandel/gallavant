const path = require('path');
const version = require('./package.json').version;
const SveltePreprocess = require('svelte-preprocess');

// Custom webpack rules
const rules = [
  { test: /\.ts$/, loader: 'ts-loader' },
  { test: /\.js$/, loader: 'source-map-loader' },
  { test: /\.css$/, use: ['style-loader', 'css-loader']},
    {
    test: /\.svelte$/,
    loader: 'svelte-loader',
    options: {
      preprocess: SveltePreprocess(),
    }
  },
];

// Packages that shouldn't be bundled but loaded at runtime
const externals = ['@jupyter-widgets/base'];

const resolve = {
  // Add '.ts' and '.tsx' as resolvable extensions.
  extensions: [".webpack.js", ".web.js", ".ts", ".js", ".svelte"],
  mainFields: ['svelte', 'browser', 'module', 'main']
};

module.exports = [
  /**
   * Lab extension
   *
   * This builds the lib/ folder with the JupyterLab extension.
   */
  {
    entry: './src/plugin.ts',
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'lib'),
      libraryTarget: 'amd',
      publicPath: '',
    },
    module: {
      rules: rules
    },
    devtool: 'source-map',
    externals,
    resolve,
  },


  /**
   * Notebook extension
   *
   * This bundle only contains the part of the JavaScript that is run on load of
   * the notebook.
   */
  {
    entry: './src/extension.ts',
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'vanity_widget', 'nbextension'),
      libraryTarget: 'amd',
      publicPath: '',
    },
    module: {
      rules: rules
    },
    devtool: 'source-map',
    externals,
    resolve,
  },

  /**
   * Embeddable vanity_widget bundle
   *
   * This bundle is almost identical to the notebook extension bundle. The only
   * difference is in the configuration of the webpack public path for the
   * static assets.
   *
   * The target bundle is always `dist/index.js`, which is the path required by
   * the custom widget embedder.
   */
  {
    entry: './src/index.ts',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'amd',
        library: "vanity_widget",
        publicPath: 'https://unpkg.com/vanity_widget@' + version + '/dist/'
    },
    module: {
        rules: rules
    },
    externals,
    resolve,
  },


  /**
   * Documentation widget bundle
   *
   * This bundle is used to embed widgets in the package documentation.
   */
  {
    entry: './src/index.ts',
    output: {
      filename: 'embed-bundle.js',
      path: path.resolve(__dirname, 'docs', 'source', '_static'),
      library: "vanity_widget",
      libraryTarget: 'amd'
    },
    module: {
      rules: rules
    },
    externals,
    resolve,
  }

];
