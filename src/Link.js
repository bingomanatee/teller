var util = require('util');
var _ = require('underscore');
var path = require('path');
var sutils = require('./story_utils');
var File_Model = require('./File_Model');
var Gate = require('gate');
var DEBUG = false;
var DEBUG_2 = false;

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

    destroy: function () {

        try {
            fs.unlinkSync(this.full_path());
        } catch (err) {
        } // don't care if file doesn't exist.

    },

    save: function (callback) {
        //@TODO: ensure singular continue
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
    return new File_Model(library, '', {

        /**
         * finds all chapters linked by "continue" links.
         *
         * Note - this presumes there is only one "continue" link per chapter
         * which is not yet enforced.
         *
         * @param story {Story}
         * @param start_chapter {Chapter|string}
         * @param callback {function}
         * @returns {*}
         */
        thread: function (story, start_chapter, callback) {

            if (!start_chapter) {
                start_chapter = story.start_chapter;
            }

            if (_.isString(start_chapter)) {
                return  story.get_chapter(start_chapter, function (err, chapter) {
                    if (chapter) {
                        story.thread(chapter, callback);
                    } else {
                        callback(null, []);
                    }
                }.bind(this));
            }

            console.log('getting thread from %s for story %s', start_chapter.name, story.name);

            var thread = [start_chapter];

            this.find_links(story, start_chapter.name, '', 'continue', function (err, links) {
                if (!links || !links.length) {
                    callback(null, thread);

                } else {
                    this.thread(story, links[0].to_chapter, function (err, tail) {
                        if (tail[0].name == _.last(thread).name) {
                            tail.shift();
                        }
                        if (tail.length > 0) {
                            thread = thread.concat(tail);
                        }
                        callback(null, thread);
                    });
                }
            }.bind(this));
        },

        // the subdirectory is different for each chapter.

        new_name: function (story) {
            var root_dir = this.link_dir(story);
            var index = 0;
            var full_path;
            do {
                ++index;
                full_path = this.full_path(root_dir + '/' + index + '.json');
                console.log('testing %s', full_path);
                console.log('testing %s', full_path);
            } while (this.exists(full_path));
            console.log('... cannot find %s', full_path);
            return index + '';
        },

        find_chapter_links: function (story, chapter, link_type, callback) {

            this.links(story, function (err, links) {
                if (DEBUG) console.log('links got: %s, %s', err, links);
                if (err) return callback(err);
                links = _.values(links);
                links = links.filter(function (link) {
                    if ((link.from_chapter == chapter) || (link.to_chapter == chapter)) {
                        if (link_type) {
                            return link.link_type == link_type;
                        } else {
                            return true;
                        }
                    } else {
                        return false;
                    }
                });

                callback(null, links);
            })
        },

        find_links: function (story, from_chapter, to_chapter, link_type, callback) {
            this.links(story, function (err, links) {
                if (err) return callback(err);
                links = _.values(links);
                links = links.filter(function (link) {
                    if (from_chapter && (link.from_chapter != from_chapter)) {
                        if (DEBUG_2) console.log('rejecting %s: from_chapter %s != %s',
                            util.inspect(link), link.from_chapter, from_chapter
                        );
                        return false;
                    }
                    if (to_chapter && (link.to_chapter != to_chapter)) {
                        if (DEBUG_2) console.log('rejecting %s: to_chapter %s != %s',
                            util.inspect(link), link.to_chapter, to_chapter
                        );
                        return false;
                    }
                    if (link_type) {
                        if (DEBUG_2)  console.log('checking for link_type %s = %s', link.link_type, link_type);
                        return link.link_type == link_type;
                    } else {
                        return true;
                    }
                });

                callback(null, links);
            })
        },

        links: function (story, callback) {
            var story_name = story.name;
            var subdir = this.link_dir(story_name);

            var self = this;

            this.files(subdir, function (err, links) {
                if (err) {
                    links = [];
                }
                var link_json_files = sutils.json.filter_file_list(links);
                if (DEBUG) console.log('link files: %s', link_json_files.join('; '));
                var out = {};

                var gate = Gate.create();

                link_json_files.forEach(function (file) {
                    var latch = gate.latch();

                    var tio = setTimeout(function () {
                        console.log('timeout loading %s', file);
                    }, 1000);

                    self.get_link(story, file, function (err, link) {
                        clearTimeout(tio);
                        out[file] = link;
                        latch();
                    });
                });

                gate.await(function () {
                    callback(null, out);
                });
            });

        },

        get_link: function (story, file, callback) {
            var self = this;
            var lc = ++links;
            console.log('# %s: getting chapter %s', lc, file);
            var got = false;
            self.get(this.link_dir(story) + '/' + file, function (err, data) {
                if (err) return callback(err);
                if (got) throw new Error('return twice for #' + lc);
                if (DEBUG)   console.log('# %s: got data %s for file', lc, util.inspect(data), file);
                got = true;
                //   function Link(story, from_chapter, to_chapter, name, link_type, data) {
                callback(null, new Link(story, '', '', sutils.json.remove_suffix(file), '', data));
                if (DEBUG)   console.log('# %s: end new link %s', lc, file);
            })
        },

        link_dir: function (story) {
            var story_name = (_.isString(story)) ? story : story.name;
            story_name = sutils.json.remove_suffix(story_name);
            return 'stories/' + story_name + '/links'
        },

        load_chapters: function (story, links, callback) {
            if (!_.isArray(links)) {
                links = [links];
            }

            var gate = Gate.create();

            var chapters = {};

            links.forEach(function (link) {
                ['from_chapter', 'to_chapter'].forEach(function (term) {
                    if (chapters[link[term]]) {
                        link.from_chapter_obj = chapters[link[term]];
                    } else {
                        var latch = gate.latch();
                        library.models.chapters.get_chapter(story, link[term], function (err, chapter) {
                            link[term + '_obj'] = chapter;
                            latch();
                        });
                    }
                })
            }, this);

            gate.await(function (err) {
                callback(err, links);
            })
        }
    });
}

module.exports = Link;