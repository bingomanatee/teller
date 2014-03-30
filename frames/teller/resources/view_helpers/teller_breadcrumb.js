var _ = require('underscore');
var util = require('util');
var path = require('path');
var _DEBUG = false;
var fs = require('fs');

var MAX_TITLE_LENGTH = 20;
var hm = require('hive-menu');

function _title(t) {
    if (!t) return '(untitled)';
    if (t.length <= MAX_TITLE_LENGTH) return t;
    return t.substr(0, MAX_TITLE_LENGTH) + '...';
}

module.exports = function (apiary, callback) {
    fs.readFile(path.resolve(__dirname, 'templates/menu.ejs'), 'utf8', function (err, template) {
        _breadcrumb = _.template(template);

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

                    var breadcrumb = new hm.Menu();

                    breadcrumb.add({title: 'Stories', link: '/stories'});
                    breadcrumb.add({title: output.story.title, link: '/stories/' + output.story.id});

                    breadcrumb.toString = function(){
                        return _breadcrumb({menu: this.toJSON(), story: output.story, short_title: _title});
                    };

                    return breadcrumb;
                };

                done();
            }
        };

        callback(null, _helper);
    })
};
