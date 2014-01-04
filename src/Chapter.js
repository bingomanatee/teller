var util = require('util');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var sutils = require('./story_utils');

function Chapter(name, story, data) {
    this.name = sutils.json.remove_suffix(name);
    this.story = story;
    this.content = '(content pending)';
    this.title = name.replace(/_/g, ' ');
    _.extend(this, data);
}

_.extend(Chapter.prototype, {

    library: function () {
        return this.story.library
    },

    full_path: function () {
        return path.resolve(this.story.root(), 'chapters', sutils.json.ensure_suffix(this.name));
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

        this.library().models.chapters.put(full_path, this.toJSON(), function (err) {
            if (err) return callback(err);
            var content_path = sutils.json.remove_suffix(full_path);
            content_path +=  '.md';
            self.library().models.chapters.put_text(content_path, self.content, function(err){
                callback(err, self);
            });
        });
    },

    toJSON: function () {
        return _.extend(_.pick(this, 'title', 'name'),
            {story: this.story.name}
        );
    }

})

module.exports = Chapter;