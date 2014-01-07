/**
 * Module dependencies.
 */

var express = require('express')
    , http = require('http')
    , path = require('path')
    , util = require('util')
    , ejs = require('ejs')
    , mvc = require('hive-mvc');

var app = express();
var PORT = process.env.PORT || 5080;

app.configure(function () {
    app.set('port', PORT);
    app.set('view engine', 'ejs');
    app.engine('html', ejs.renderFile);
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('sit right down and you\'ll hear a tale'));
    app.use(express.session());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
    //app.use(express.errorHandler());
});

server = http.createServer(app);
server.on('close', function () {
    console.log('======== closing server');
});

var log_file = path.resolve(__dirname, 'actions.log');

server.listen(app.get('port'), function () {
    var apiary = mvc.Apiary({log_file: log_file, action_handler_failsafe_time: 3000}, __dirname + '/frames');
    apiary._config.setAll(require('./site_identity.json'));
    apiary.set_config('god_mode', true);
    console.log('initializing apiary for port %s', PORT);
    apiary.init(function () {
        var view_helpers = apiary.Resource.list.find({TYPE: 'view_helper', post: false}).records();
        view_helpers.forEach(function (h) {
            console.log("found helper %s", h.name);
        });
        console.log('serving');
        apiary.serve(app, server);
    });
});