const hentPassportConfig = () => {
    return {
        clientID: process.env.CLIENT_ID ? process.env.CLIENT_ID : '',
        clientSecret: process.env.CLIENT_SECRET ? process.env.CLIENT_SECRET : '',
        cookieEncryptionKeys: [{ key: key1, iv: key3 }, { key: key2, iv: key4 }], 
        identityMetadata: `https://login.microsoftonline.com/${
            tenant
        }/.well-known/openid-configuration`,
        loggingLevel: 'info',
        passReqToCallback: true,
        responseMode: 'form_post',
        responseType: 'code',
        scope: 'profile offline_access',
        tokenURI: `https://login.microsoftonline.com/${tenant}/oauth2/token`,
        useCookieInsteadOfSession: false,
        validateIssuer: true,
    };
};

exports.passportConfig = hentPassportConfig();
