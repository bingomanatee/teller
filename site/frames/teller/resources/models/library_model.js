var util = require('util');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var root_dir = path.resolve(__dirname, '../../../../../');
var Library = require(path.resolve(root_dir, 'src/Library'));

module.exports = function (apiary, callback) {
    var model = new Library({
        file_path: path.resolve(root_dir, 'library')
    });

    model.name = 'teller_library';

    callback(null, model);
};