const token = require('./token');
const proxy = require('http-proxy-middleware');

// 1. Fiks paths og gjør det man ønsker med requesten
const restream = (proxyReq, req, res, options) => {
    if (req.body) {
        let bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
    }
};

exports.doProxy = () => {
    return proxy('path', {
        pathRewrite: (path, req) => {
            // Skriv om pathen om nødvendig
            const newPath = path.replace('path', '');
            return `newPath`;
        },
        target: `proxyUrl`,
        secure: true,
        changeOrigin: true,
        logLevel: 'error',
        onProxyReq: restream,
    });
};

// 2. Hekt på accessToken
exports.attachToken = () => {
    return async (req, res, next) => {
        const accessToken = await token.validateRefreshAndGetToken(req);
        req.headers['Authorization'] = `Bearer ${accessToken}`;
        return next();
    };
};
