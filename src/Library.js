var util = require('util');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');

var File_Model = require('./File_Model');
var Story = require('./Story');

function Manager(options) {

    this.models = {
        stories: new File_Model(this, 'stories'),
        chapters: new File_Model(this, 'chapters')
    };

    this.stories = {};

    this.file_path = path.resolve(__dirname, '../library');

    _.extend(this, options);

}

_.extend(Manager.prototype, {

    get_story: function(name, callback){
        var self = this;

        if (this.stories[name]){
            return callback(null, this.stories[name]);
        }

        if (!(name && (_.isString(name)))){
            throw new Error('bad story name');
        }

        this.models.stories.get(name, function(err, data){

            if (err){
                callback(err);
            } else {
                try {
                    var story = new Story(name, self, data);
                    callback(null, story);
                } catch(err2){
                    callback(err2);
                }
            }

        });

    }

});

module.exports = Manager;