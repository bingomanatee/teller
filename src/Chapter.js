var util = require('util');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var sutils = require('./story_utils');
var File_Model = require('./File_Model');
var Gate = require('gate');

var cid = 0;
function Chapter(name, story, data) {

    if (!(_.isObject(story) && story.root)){
        throw new Error(util.format('bad story %s passed to Chapter', util.inspect(story)));
    }
    this.id = ++cid;
    console.log('new chapter %s # %s', name, this.id);
    this.name = sutils.json.remove_suffix(name);
    this.library = story.library;
    this.story = story;
    this.content = '(content pending)';
    this.title = name.replace(/[_]+/g, ' ');
    _.extend(this, data);
    this.story = story; // ensuring no inadvertent overwrite of story
}

var chapters = 0;

_.extend(Chapter.prototype, {

    load_content: function(callback){
       fs.readFile(this.content_path(), 'utf8', function(err, content){
           if (err){
               return callback(err);
           }
           this.content = content;
           callback(null, this);
       }.bind(this))
    },

    full_path: function () {
        return path.resolve(this.story.root(), 'chapters', sutils.json.ensure_suffix(this.name));
    },

    content_path: function(){
        var content_path = sutils.json.remove_suffix(this.full_path());
        content_path +=  '.md';
        return content_path;
    },

    update: function (data) {
        _.extend(this, data);
    },

    save: function (callback) {
        var self = this;
        try {
            var full_path = this.full_path();
        } catch (err) {
            return callback(err);
        }

        this.library.models.chapters.put(full_path, this.toJSON(), function (err) {
            if (err) return callback(err);

            self.library.models.chapters.put_text(self.content_path(), self.content, function(err){
                callback(err, self);
            });
        });
    },

    toJSON: function () {
        return _.pick(this, 'title', 'name');
    },

    destroy: function(){

        try {
            fs.unlinkSync(this.content_path());
        } catch(err) {} // don't care if file doesn't exist.

        try {
            fs.unlinkSync(this.full_path());
        } catch (err) {} // don't care if file doesn't exist.

    }

});

Chapter.file_model = function(library){
    return new File_Model(library, '', { // the subdirectory is different for each chapter.
        chapters: function(story, callback){
            var story_name =  story.name;
            var subdir = this.chapter_dir(story_name);

            var self = this;

            this.files(subdir, function(err, chapters){
                var chapter_json_files = sutils.json.filter_file_list(chapters);
                console.log('chapter files: %s', chapter_json_files.join('; '));
                var out = {};

                var gate = Gate.create();

                chapter_json_files.forEach(function(file){
                   var latch = gate.latch();

                    self.get_chapter(story, file, function(err, chapter){
                        out[file] = chapter;
                        latch();
                    });
                });

                gate.await(function(){
                    console.log('done loading chapters');
                    callback(null, out);
                });
            });

        },

        get_chapter: function(story, file, callback){
            var self = this;
           var lc =  ++chapters;
            console.log('# %s: getting chapter %s', lc, file);
            var got = false;
            self.get(this.chapter_dir(story) + '/' + file, function(err, data){
                if (got) throw new Error('return twice for #' + lc);
                console.log('# %s: got data %s for file', lc, util.inspect(data), file);
                got = true;
                callback(null, new Chapter(file, story, data));
                console.log('# %s: end new chapter %s', lc, file);
            })
        },

        chapter_dir: function(story){
            var story_name = (_.isString(story)) ? story : story.name;
            story_name = sutils.json.remove_suffix(story_name);
            return 'stories/' + story_name + '/chapters'
        }
    });
}

module.exports = Chapter;