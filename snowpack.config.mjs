/** @type {import("snowpack").SnowpackUserConfig } */
export default {
  mount: {
    public: {
      // url: '/', // FOR DEV
      url: '/rellik', // FOR BUILD
      static: true },
    src: {
      // url: '/dist', // FOR DEV
      url: '/rellik/dist', // FOR BUILD
    },
  },
  plugins: [
    [
      '@snowpack/plugin-typescript',
      {
        /* Yarn PnP workaround: see https://www.npmjs.com/package/@snowpack/plugin-typescript */
        ...(process.versions.pnp ? { tsc: 'yarn pnpify tsc' } : {}),
      },
    ],
    // [
    //   "snowpack-service-worker-assets",
    //   {
    //     patterns: ["**/*"],
    //     worker: "rellikOffline.js",
    //     replace: '"all-rellik-files"',
    //   }
    // ],
    // [
    //   "@internetarchive/snowpack-files-hash",
    //   {
    //     // baseUrl: "../../my website/website/public/rellik",
    //     baseUrl: "",
    //     hashFiles: ["html", "js"],
    //     searchImportsIn: ["html", "js"],
    //   }
    // ],
  ],
  routes: [
    /* Enable an SPA Fallback in development: */
    // {"match": "routes", "src": ".*", "dest": "/index.html"},
  ],
  optimize: {
    /* Example: Bundle your final build: */
    // "bundle": true, // TODO: Currently breaks stuff.
    "minify": true,
  },
  packageOptions: {
    /* ... */
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    out: "../../my website/website/public",
    clean: false, // This requires that just the /rellik folder is deleted before a build is ran, to ensure no straggler files exist.
  },
};
