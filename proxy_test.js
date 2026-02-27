const httpProxy = require('http-proxy-middleware');
const express = require('express');
const app = express();
app.use('/api', httpProxy.createProxyMiddleware({ target: 'http://127.0.0.1:8000', changeOrigin: true }));
app.listen(8081, () => console.log('Proxy test running on 8081'));
