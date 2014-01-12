var util = require('util');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var sutils = require('./story_utils');
var File_Model = require('./File_Model');
var Gate = require('gate');

/**
 *
 * This record represents the bridge between one chapter and the next.
 * This can be (as indicated by the value of link_type)
 * 1) a straight 'continue' -- the end of one chapter leads to the next, like a book --
 * 2) a 'choice' -- click one of many choices to go to a chapter.
 *
 * @param story {Story}
 * @param from_chapter {string} the name of the sorce virus
 * @param to_chapter {string}
 * @param name {string}
 * @param link_type {string}
 * @param data {object} Optional
 *
 * @constructor
 */

function Link(story, from_chapter, to_chapter, name, link_type, data) {
    if ((!_.isObject(story)) || (!story.root)) {
        throw new Error('bad story parameter to link: %s', util.inspect(story));
    }

    this.library = story.library;

    if (_.isObject(from_chapter)) {
        from_chapter = from_chapter.name;
    }
    if (_.isObject(to_chapter)) {
        to_chapter = to_chapter.name;
    }

    this.story = story;
    this.from_chapter = from_chapter;
    this.to_chapter = to_chapter;
    this.name = name || this.library.models.links.new_name(story);
    this.link_type = link_type || 'continue';

    this.prompt = '';

    this.from_response = '';
    this.to_response = '';

    if (data && _.isObject(data)) {
        _.extend(this, data);
    }
}

_.extend(Link.prototype, {

    toJSON: function () {
        return _.pick(this, 'from_chapter', 'to_chapter', 'from_response', 'to_response', 'prompt', 'link_type');
    },

    full_path: function () {
        return path.resolve(this.story.root(), 'links', sutils.json.ensure_suffix(this.name));
    },

    destroy: function(){

        try {
            fs.unlinkSync(this.full_path());
        } catch (err) {} // don't care if file doesn't exist.

    },

    save: function (callback) {
        var self = this;
        try {
            var full_path = this.full_path();
        } catch (err) {
            return callback(err);
        }

        this.library.models.chapters.put(full_path, this.toJSON(), function (err) {
            callback(err, self);
        });
    }
});

var links = 0; // a tally for debugging activity;

Link.file_model = function (library) {
    return new File_Model(library, '', { // the subdirectory is different for each chapter.

        new_name: function(story){
            var root_dir = this.link_dir(story);
            var index = 1;
            while(fs.existsSync(root_dir + '/' + index + '.json')){
                ++index;
            }
            return index + '';
        },

        links: function (story, callback) {
            var story_name = story.name;
            var subdir = this.link_dir(story_name);

            var self = this;

            this.files(subdir, function (err, chapters) {
                var link_json_files = sutils.json.filter_file_list(chapters);
                console.log('chapter files: %s', link_json_files.join('; '));
                var out = {};

                var gate = Gate.create();

                link_json_files.forEach(function (file) {
                    var latch = gate.latch();

                    self.get_chapter(story, file, function (err, chapter) {
                        out[file] = chapter;
                        latch();
                    });
                });

                gate.await(function () {
                    console.log('done loading links');
                    callback(null, out);
                });
            });

        },

        get_link: function (story, file, callback) {
            var self = this;
            var lc = ++links;
            console.log('# %s: getting chapter %s', lc, file);
            var got = false;
            self.get(this.chapter_dir(story) + '/' + file, function (err, data) {
                if (got) throw new Error('return twice for #' + lc);
                console.log('# %s: got data %s for file', lc, util.inspect(data), file);
                got = true;
                callback(null, new Chapter(file, story, data));
                console.log('# %s: end new chapter %s', lc, file);
            })
        },

        link_dir: function (story) {
            var story_name = (_.isString(story)) ? story : story.name;
            story_name = sutils.json.remove_suffix(story_name);
            return 'stories/' + story_name + '/links'
        }
    });
}

module.exports = Link;