var util = require('util');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var Mongoose_Model = require('hive-model-mongoose');

module.exports = function(apiary, callback) {

    var mongoose = apiary.get_config('mongoose');

    var model = Mongoose_Model(
        {
            name: 'teller-chapter'
        } // mixins
        , {
            mongoose:   mongoose,
            schema_def: path.resolve(__dirname, 'schema/chapter.json')
        } // configurations
        , apiary.dataspace // hive-model.Dataspace || Object (optional)
    );

    callback(null, model);
};