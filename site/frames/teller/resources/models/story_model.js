var util = require('util');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var Mongoose_Model = require('hive-model-mongoose');
var Q = require('q');

function _get_story_in_action(ctx, done, success, error) {

    var id = ctx._id ||  ctx.story;

    function _on_error(m) {
        if (error){
             error(m);
        } else {
            ctx.add_message(m || 'cannot find story ' + id, 'danger');
            ctx.$go('/stories', done);
        }
    }

    if (!id){
        return _on_error('no story id found in context');
    }

    Q.nfcall(this.get.bind(this), id).then(function (story) {
        if (!story) {
            _on_error();
            return;
        }
        ctx.$out.set('story', story);
        ctx.story = story;
        success ? success(story) : done();
    }, done);
}

module.exports = function (apiary, callback) {

    var mongoose = apiary.get_config('mongoose');

    var model = Mongoose_Model(
        {
            name: 'teller_story',
            get_story_in_action: _get_story_in_action
        } // mixins
        , {
            mongoose: mongoose,
            schema_def: path.resolve(__dirname, 'schema/story.json')
        } // configurations
        , apiary.dataspace // hive-model.Dataspace || Object (optional)
    );

    callback(null, model);
};