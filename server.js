const auth = require('./authenticate'),
    express = require('express'),
    loglevel = require('loglevel'),
    passport = require('passport'),
    path = require('path'),
    session = require('express-session');

// 1. Koble redis til express-session
const RedisStore = require('connect-redis')(session);
require('./auth/config/passport')(passport);

loglevel.setDefaultLevel(loglevel.levels.INFO);

const port = 8000;
const app = express();

const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;
app.use(bodyParser.json());
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('trust proxy', 1);

// 2. Sett appen til å bruke express-session med redis som store.
app.use(
    session({
        cookie: { secure: true },
        name: 'dsop-kontroll',
        saveUninitialized: true,
        secret: '', // Secrets som kan injectes fra vault
        store: new RedisStore({
            host: '', // host som kan injectes fra vault eller basert på annen config
            pass: '', // Passord som kan injectes fra vault
            port: 6379,
        }),
        resave: false,
        maxAge: SESSION_TIMEOUT,
    })
);
app.use(passport.initialize());
app.use(passport.session());

// 3. Proxy til backend hvor serveren hekter på accessToken
app.use(
    '', // Path
    auth.ensureAuthenticated(true),
    proxy.attachToken(),
    proxy.doProxy()
);

// 4. Autentiseringsendepunkter
app.get('/login', (req, res, next) => {
    auth.authenticateAzure(req, res, next);
});
app.post('/auth/openid/callback', auth.authenticateAzureCallback());
app.get('/auth/logout', auth.ensureAuthenticated(), auth.logout());

// 5. Tilgjengeliggjør en app/html side
app.get('*', auth.ensureAuthenticated(), (req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, buildPath) });
});

app.listen(port, '0.0.0.0', err => {
    if (err) {
        loglevel.error(err);
    }
    loglevel.info(`Server startet på port ${port}.`);
});
