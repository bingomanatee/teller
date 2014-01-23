var _ = require('underscore');
var util = require('util');
var path = require('path');
var _DEBUG = false;
var fs = require('fs');

var alert_template;

var MAX_TITLE_LENGTH = 20;
var Menu = require('hive-menu');

function _title(t) {
    if (t.length <= MAX_TITLE_LENGTH) return t;
    return t.substr(0, MAX_TITLE_LENGTH) + '...';
}

var _breadcrumb = _.template('<ol class="breadcrumb">' +
    '<% menu.items.forEach(function(item){ %>' +
    '<li class="<%= item.active ? "active" : "" %>">' +
    '<% if (item.link) {%>' +
    '<a href="<%= item.link %>">' +
    '<%= short_title(item.text) %></a>' +
    '<% } else { %>' +
    '<%= short_title(item.text) %><% } %>' +
    '</li>' +
    '<% } %>' +
    '</ol>');

module.exports = function (apiary, callback) {
    fs.readFile(path.resolve(__dirname, 'templates/message_alert.html'), 'utf8', function (err, template) {
        alert_template = _.template(template);

        var _helper = {
            weight: -100,
            name: 'teller_breadcrumb_view_helper',
            test: function (ctx, output) {
                return (output.story && _.isObject(output.story) && output.story.title && output.story._id);
            },
            respond: function (ctx, output, done) {
                if (!output.helpers) {
                    output.helpers = {};
                }

                output.helpers.teller_breadcrumb = function () {
                    var breadcrumb = new Menu();

                    menu.toString = function(){
                        return _breadcrumb({menu: this, short_title: _title});
                    }
                };

                done();
            }
        };

        callback(null, _helper);
    })
};
