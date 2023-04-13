const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/getSlot',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      onProxyRes: function (proxyRes, req, res) {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      }
    })
  );

  app.use(
    '/releaseSlot',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      onProxyRes: function (proxyRes, req, res) {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      }
    })
  );
};
