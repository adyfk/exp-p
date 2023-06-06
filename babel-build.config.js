/* eslint-disable import/newline-after-import */
const productionPlugins = [
  // const path = require('path');
  // ['babel-plugin-react-remove-properties'],
];

module.exports = function getBabelConfig(api) {
  const useESModules = false;
  // const useESModules = api.env(['stable']);
  // function resolveAliasPath(relativeToBabelConf) {
  //   const resolvedPath = path.relative(
  //     process.cwd(),
  //     path.resolve(__dirname, relativeToBabelConf),
  //   );
  //   return `./${resolvedPath.replace('\\', '/')}`;
  // }

  const defaultAlias = {
  };

  const presets = [
    [
      '@babel/preset-env',
      {
        bugfixes: true,
        browserslistEnv: process.env.BABEL_ENV || process.env.NODE_ENV,
        debug: false,
        modules: useESModules ? false : 'commonjs',
        shippedProposals: api.env('modern'),
      },
    ],
    // [
    //   '@babel/preset-react',
    //   {
    //     runtime: 'automatic',
    //   },
    // ],
    ['@babel/preset-typescript', { allowNamespaces: true }],
  ];

  const plugins = [
    // Need the following 3 proposals for all targets in .browserslistrc.
    // With our usage the transpiled loose mode is equivalent to spec mode.
    // ['@babel/plugin-proposal-class-properties', { loose: true }],
    // ['@babel/plugin-proposal-private-methods', { loose: true }],
    // ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
    // ['@babel/plugin-proposal-object-rest-spread', { loose: true }],
    // [
    //   '@babel/plugin-transform-runtime',
    //   {
    //     useESModules,
    //     // any package needs to declare 7.4.4 as a runtime dependency. default is ^7.0.0
    //     version: '^7.4.4',
    //   },
    // ],
    // [
    //   'babel-plugin-transform-react-remove-prop-types',
    //   {
    //     mode: 'unsafe-wrap',
    //   },
    // ],
    // ['babel-plugin-transform-import-aliases', { aliases: defaultAlias }],
    // [
    //   'module-resolver',
    //   {
    //     root: ['./'],
    //     alias: defaultAlias,
    //   },
    // ],
  ];

  if (process.env.NODE_ENV === 'production') {
    plugins.push(...productionPlugins);
  }

  return {
    assumptions: {
      noDocumentAll: true,
    },
    presets,
    plugins,
    ignore: [/@babel[\\|/]runtime/, /\.stories\.(ts|tsx)$/], // Fix a Windows issue.
    overrides: [
      // {
      //   exclude: /\.test\.(js|ts|tsx|jsx)$/,
      //   plugins: ['@babel/plugin-transform-react-constant-elements'],
      // },
    ],
    env: {
      coverage: {
        plugins: ['babel-plugin-istanbul'],
      },
      benchmark: {
        plugins: [...productionPlugins],
      },
    },
  };
};