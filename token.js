const loglevel = require('loglevel');
const moment = require('moment');

const token = require('./getAccesstoken');
const { passportConfig } = require('./passportConfig');

// Valider accessToken og hent nytt om det gamle er utgått
exports.validateRefreshAndGetToken = async req => {
    if (!req.session) {
        loglevel.error(
            'No session found in validateRefreshAndGetToken. Returning invalid accessToken.'
        );
        return '';
    }

    // 1. Brukeren mangler access token
    if (!req.session.accessToken) {
        loglevel.info(
            `${req.session.displayName} - ${
                req.originalUrl
            }: not authenticated - no accessToken. Fetching new accessToken.`
        );

        const newAccessToken = await token.getAccessTokenUser(
            passportConfig.tokenURI,
            req.session.refreshToken,
            passportConfig.clientID
        );

        req.session.accessToken = newAccessToken;
    // 2. Brukeren sitt accessToken har utgått
    } else if (moment().isAfter(moment(req.session.expiryDate))) {
        loglevel.info(
            `${req.session.displayName} - ${
                req.originalUrl
            }: not authenticated - expired token. Fetching new accessToken.`
        );

        const newAccessToken = await token.getAccessTokenUser(
            passportConfig.tokenURI,
            req.session.refreshToken,
            passportConfig.clientID
        );

        req.session.accessToken = newAccessToken;
    } else {
        loglevel.info(`${req.session.displayName} - ${req.originalUrl}: authenticated.`);
    }
    req.session.expiryDate = JSON.parse(exports.decodeToken(req.session.accessToken)).exp * 1000;

    return req.session.accessToken;
};

// Decode token
exports.decodeToken = encodedToken => {
    if (encodedToken) {
        if (encodedToken.startsWith('eyJ0')) {
            const tokenSplit = encodedToken.split('.');
            const tokenDecoded = Buffer.from(tokenSplit[1], 'base64').toString();
            return tokenDecoded;
        } else {
            return new Error('not a valid accessToken or id_token');
        }
    } else {
        return new Error('no token in input');
    }
};
