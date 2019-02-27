const loglevel = require('loglevel');
const passport = require('passport');
const { passportConfig } = require('./passportConfig');

exports.authenticateAzure = (req, res, next) => {
    const regex = /redirectUrl=(.*)/.exec(req.url);
    const successRedirect = regex && allowedRedirectRoutes[regex[1]] ? regex[1] : '/';
    if (!allowedRedirectRoutes[regex[1]]) {
        loglevel.error(`Ugyldig redirect path [${regex[1]}], fallback '/'`);
    }

    if (!req.session) {
        req.session = {};
    }

    req.session.redirectUrl = successRedirect;
    try {
        passport.authenticate('azuread-openidconnect', {
            response: res,
            successRedirect: successRedirect,
            failureRedirect: '/error',
        })(req, res, next);
    } catch (err) {
        throw `ERROR during authentication: ${err}`;
    }
};

exports.authenticateAzureCallback = () => {
    return (req, res, next) => {
        try {
            passport.authenticate('azuread-openidconnect', {
                response: res,
                successRedirect: req.session.redirectUrl || '/',
                failureRedirect: '/error',
            })(req, res, next);
        } catch (err) {
            throw `ERROR during authentication: ${err}`;
        }
    };
};

exports.ensureAuthenticated = proxy => {
    return async (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }

        const pathname = req.originalUrl;
        if (proxy) {
            res.status(401).send('Unauthorized');
        } else {
            res.redirect(`/login?redirectUrl=${pathname}`);
        }
    };
};

exports.logout = (req, res) => {
    return (req, res) => {
        try {
            req.logout();
            res.redirect(passportConfig.logoutUri);
            req.session = null;
        } catch (err) {
            res.status(500).send(err);
            return `ERROR during logout: ${err}`;
        }
    };
};
