
module.exports = {
  presets: [
    ["@babel/preset-env",{
      modules: false,
      loose: true,
      targets: {
        browsers: "defaults",
      },
    },],
    "@babel/preset-typescript",
    "@babel/preset-react",
  ],
  plugins: ["@babel/plugin-proposal-object-rest-spread"],
};