module.exports = {
  productionSourceMap: false,
  publicPath: process.env.NODE_ENV === 'production'
    ? '/' + process.env.npm_package_name + '/'
    : '/',
}