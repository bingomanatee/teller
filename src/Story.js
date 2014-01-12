var util = require('util');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var Chapter = require('./Chapter');
var sutils = require('./story_utils.js');
var Gate = require('gate');
var File_Model = require('./File_Model');

function Story(name, library, data) {
    this.name = sutils.json.remove_suffix(name);
    this.library = library;
    this.chapters = {};

    if (data || _.isObject(data)) {
        _.extend(this, data);
    }
}

_.extend(Story.prototype, {

    thread: function (start_chapter, callback) {
        if (_.isFunction(start_chapter)) {
            callback = start_chapter;
            start_chapter = this.start_chapter
        }

        if (!start_chapter) {
            return callback(null, []);
        } else {
            this.library.models.links.thread(this, start_chapter, callback);
        }
    },

    get_chapter: function (name, callback) {
        return this.library.models.chapters.get_chapter(this, name, callback);
    },

    full_path: function () {
        return path.resolve(this.library.file_path, 'stories', sutils.json.ensure_suffix(this.name));
    },

    root: function () {
        return sutils.json.remove_suffix(this.full_path());
    },

    get_chapters: function (callback) {
        this.library.models.chapters.chapters(this, callback);
    },

    update: function (data, callback) {
        if (data.hasOwnProperty('title') && data.title) {
            this.title = data.title;
        }
        if (data.hasOwnProperty('summary') && data.summary) {
            this.summary = data.summary;
        }
        if (data.hasOwnProperty('start_chapter') && data.start_chapter) {
            this.start_chapter = data.start_chapter;
        }
        //@TODO: validate existence of chapter

        this.library.models.stories.update(this, callback);
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

Story.file_model = function (library) {
    return new File_Model(library, 'stories', {

        update: function (story, callback) {
            var data = _.pick(story, 'name', 'summary', 'start_chapter', 'title');

            this.put(story.name, data, function (err, saved) {
                if (err) {
                    return callback(err);
                } else {
                    return callback(null, story);
                }
            })
        },

        get_story: function (name, callback) {

            if (library.stories[name]) {
                return callback(null, library.stories[name]);
            }

            if (!(name && (_.isString(name)))) {
                throw new Error('bad story name');
            }

            this.get(name, function (err, data) {

                if (err) {
                    callback(err);
                } else {
                    var story = new Story(name, library, data);
                    callback(null, story);
                }

            });

        },

        stories: function (callback) {
            var self = this;
            this.files(function (err, files) {
                if (err) {
                    callback(err);
                } else {
                    var gate = Gate.create();

                    var out = {};

                    /**
                     *   this folder includes both the root json file
                     *   for a given story; the code below selects only the root JSON files.
                     */

                    files = sutils.json.filter_file_list(files);

                    files.forEach(function (file) {

                        var latch = gate.latch();

                        self.get_story(file, function (err, story) {
                            out[file] = story;
                            latch();
                        })
                    });

                    gate.await(function () {
                        console.log('stories: %s', util.inspect(out));
                        callback(null, out);
                    })
                }
            }.bind(this));
        }

    });
};

module.exports = Story;