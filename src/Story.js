var util = require('util');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var Chapter = require('./Chapter');
var sutils = require('./story_utils.js');

function Story(name, library, data) {
    this.name = sutils.json.remove_suffix(name);
    this.library = library;
    this.chapters = {};

    if (data || _.isObject(data)) {
        _.extend(this, data);
    }
}

_.extend(Story.prototype, {

    full_path: function () {
        return path.resolve(this.library.file_path, 'stories', sutils.json.ensure_suffix(this.name));
    },

    root: function(){
       return sutils.json.remove_suffix(this.full_path());
    },

    /**
     * this puts raw data into a file and returns a chapter object.
     * If you want to resave a chapter, call chapter.update();
     *
     * @param name {String} the name of the chapter
     * @param data {Object} configuration/data for the chapter
     * @param callback {function}
     */
    put_chapter: function (name, data, callback) {

        name = sutils.json.remove_suffix(name);
        if (this.chapters[name]) {
            this.chapters[name].update(data);
        } else {
            var chapter = new Chapter(name, this, data);
            this.chapters[chapter.name] = chapter;
        }
        chapter.save(callback);
    }

});

module.exports = Story;