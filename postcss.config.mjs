export default {
  plugins: {
    "postcss-import": {},
    "postcss-preset-env": {
      stage: 2,
      features: {
        "custom-media-queries": true,
        "nesting-rules": true,
      },
    },
    "postcss-custom-media": {},
    cssnano: {
      preset: ["default", { discardComments: { removeAll: true } }],
    },
  },
};
