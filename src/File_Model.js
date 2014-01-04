var util = require('util');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var sutils = require('./story_utils');

var DEBUG = false;

/**
 * A generic file retrieval model.
 * @param library {Library}
 * @param subdir {String} a path, relative to the library.file_root, where resources are found.
 *
 * @constructor
 */
function File_Model(library, subdir) {
    this.library = library;
    this.subdir = subdir;
}

_.extend(File_Model.prototype, {

    full_path: function (name, ensure) {
        if (DEBUG)  console.log('making path %s : %s : %s', this.library.file_path, this.subdir, name);
        var full_path = path.resolve(this.library.file_path, this.subdir, name);
        if (ensure){
            full_path = sutils.json.ensure_suffix(full_path);
        }
        return full_path;
    },

    /**
     * ensures that the passed in path exists;
     * creates directories if they do not exist, recursively.
     * note -- doesn't care if the existing path
     * is to a file or a directory.
     *
     * @param full_path {String}
     */
    ensure: function (full_path) {
        if (!fs.existsSync(full_path)) {
            this.ensure(path.dirname(full_path));
            fs.mkdirSync(full_path);
        }
    },

    get: function (name, callback) {
        var file_path = this.full_path(name, true);
        fs.exists(file_path, function (e) {
            if (!e) {
                callback(new Error('cannot find ' + file_path));
            } else {
                fs.readFile(file_path, function (err, data) {
                    data = data.toString();
                    try {
                        var obj = JSON.parse(data);
                        callback(null, obj);
                    } catch (err) {
                        callback(err);
                    }
                })
            }
        })
    },

    put: function (name, data, callback) {
        var full_path = this.full_path(name, true);
        this.ensure(path.dirname(full_path));
        fs.writeFile(full_path, JSON.stringify(data), callback);
    },

    put_text: function (name, text, callback) {
        var full_path = this.full_path(name);
        this.ensure(path.dirname(full_path));
        fs.writeFile(full_path, text, callback);
    }

});

module.exports = File_Model;

