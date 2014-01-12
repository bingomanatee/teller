var util = require('util');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');

var Story = require('./Story');
var Chapter = require('./Chapter');
var Link = require('./Link');

function Manager(options) {

    this.models = {
        stories: Story.file_model(this),
        chapters: Chapter.file_model(this),
        links: Link.file_model(this)
    };

    this.stories = {};

    this.file_path = path.resolve(__dirname, '../library');

    _.extend(this, options);

}

_.extend(Manager.prototype, {
    new_story: function(name, data){
        var s = new Story(name, this, data);
        s.library = this;
        return s;
    },

    new_chapter: function(name, story, data){
        var c = new Chapter(name, story, data);
        c.library = this;
        return c;
    },

    link_chapters: function(story, from_ch, to_ch, name, link_type, data, callback){
        callback = _.last(arguments);

        if (!name || (_.isFunction(name))){
            name = '';
        }
        if (!link_type || _.isFunction(link_type)){
            link_type = 'continue';
        }
        if (!data || _.isFunction(data)){
            data = {};
        }

        var link = new Link(story, from_ch, to_ch, name, link_type, data);
        link.save(callback);
    }
});

module.exports = Manager;