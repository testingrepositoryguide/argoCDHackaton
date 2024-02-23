var express = require('express');
var exphbs  = require('express-handlebars');
var app = express();
var os = require("os");
var morgan  = require('morgan');
var packageJson = require('./package.json');

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.static('static'));
app.use(morgan('combined'));

// Configuration
var port = process.env.PORT || 8080;
var message = process.env.MESSAGE || "Hello world!";

app.get('/', function (req, res) {
    res.render('home', createResponseObject());
});

app.get('/api', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(createResponseObject()));
});

app.get('/api/:param', function (req, res) {
    const potentialParam = createResponseObject()[req.params.param];
    if (potentialParam) {
        res.end(potentialParam)
    } else {
        res.sendStatus('404')
    }
});

app.get('/kill', function (req, res) {
    // This is useful for showcasing self-healing of the cluster
    process.exit(42);
});

// Set up listener
app.listen(port, function () {
    console.log("hello-kubernetes version %s", packageJson.version);
    console.log("Running on %s (%s)", os.type(), os.release());
    console.log("Listening on: http://%s:%s", os.hostname(), port);
});

function createResponseObject() {
    return {
        message: message,
        appVersion: packageJson.version,
        platform: os.type(),
        release: os.release(),
        hostName: os.hostname()
    };
}
