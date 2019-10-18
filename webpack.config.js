// https://www.google.com/search?q=webpack+getting+started&oq=webpack+getting+started&aqs=chrome..69i57j69i60.2813j0j7&sourceid=chrome&ie=UTF-8
module.exports = {
  module: {
    rules: [
      {
        test: /\.proto$/,
        use: "proto-loader"
      }
    ]
  }
};
