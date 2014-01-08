var util = require('util');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');

var Story = require('./Story');
var Chapter = require('./Chapter');

function Manager(options) {

    this.models = {
        stories: Story.file_model(this),
        chapters: Chapter.file_model(this)
    };

    this.stories = {};

    this.file_path = path.resolve(__dirname, '../library');

    _.extend(this, options);

}

_.extend(Manager.prototype, {

});

module.exports = Manager;