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
 * @param params {Object} an optional parameter that extneds the base class.
 *
 * @constructor
 */
function File_Model(library, subdir, params) {
    console.log('making file model with library %s, subdir %s', util.inspect(library), subdir);
    this.library = library;
    this.subdir = subdir;
    if (params) {
        _.extend(this, params);
    }
}

_.extend(File_Model.prototype, {

    full_path: function (name, ensure) {
        if (DEBUG)  console.log('making path %s : %s : %s', this.library.file_path, this.subdir, name);
        var full_path = path.resolve(this.library.file_path, this.subdir, name);
        if (ensure) {
            full_path = sutils.json.ensure_suffix(full_path);
        }
        return full_path;
    },

    files: function (file_path, callback) {
        if (_.isFunction(file_path)) {
            callback = file_path;
            file_path = '';
        }

        if (DEBUG) console.log('getting files %s : %s: %s', this.library.file_path, this.subdir, file_path);
        var dir = path.resolve.apply(path, _.compact([this.library.file_path, this.subdir, file_path]));

        if (DEBUG) console.log('... %s', dir);
        fs.readdir(dir, callback);
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
                var sent = false;
                fs.readFile(file_path, function (err, data) {
                    if (err) return callback(err);
                    data = data.toString();
                    var err2 = null;
                    var obj = null;
                    try {
                         obj = JSON.parse(data);
                    } catch (e) {
                        obj = null;
                        err2 = e;
                    }
                    callback(err2, obj);
                })
            }
        })
    },

    exists: function(full_path){
        return fs.existsSync(full_path);
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

