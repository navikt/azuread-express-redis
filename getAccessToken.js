const request = require('request-promise');
const { passportConfig } = require('./passportConfig');

// Hent accessToken for bruker
exports.getAccessTokenUser = async (tokenURI, refreshToken, resource) => {
    try {
        const parameters = {
            client_id: passportConfig.clientID,
            resource: resource,
            redirect_uri: passportConfig.redirectUrl,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_secret: passportConfig.clientSecret,
        };
        const body = await request.post(
            { url: tokenURI, formData: parameters },
            (err, httpResponse, body) => {
                return body;
            }
        );

        return JSON.parse(body).access_token;
    } catch (e) {
        return e;
    }
};
