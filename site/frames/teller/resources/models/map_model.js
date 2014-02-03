var util = require('util');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var Mongoose_Model = require('hive-model-mongoose');
var Q = require('q');

module.exports = function (apiary, callback) {

    var mongoose = apiary.get_config('mongoose');

    var model = Mongoose_Model(
        {
            name: 'teller_map',
            get_map_in_action: _get_map_in_action
        } // mixins
        , {
            mongoose: mongoose,
            schema_def: path.resolve(__dirname, 'schema/map.json')
        } // configurations
        , apiary.dataspace // hive-model.Dataspace || Object (optional)
    );


    function _get_map_in_action(ctx, done, success, error) {
        var id = ctx.map || ctx._id;

        console.log('getting map %s', id);

        function _on_error(m) {
            console.log('error get map: %s', m);
            if (error) {
                error(m);
            } else {
                ctx.add_message(m || 'cannot find map ' + id, 'danger');
                ctx.$go('/stories', done);
            }
        }

        if (!id) {
            return _on_error('no map id found in context');
        }

        var deferred = Q.defer();

        model.get(id, function (err, map) {
            if (err) {
                deferred.reject(err);
            } else if (map) {
                deferred.resolve(map);
            } else {
                deferred.reject('no map for id ' + id);
            }
        });

        deferred.promise.then(function (map) {
            ctx.$out.set('map', map);
            ctx.map = map;
            success ? success(map) : done();
        }, _on_error);
    }

    callback(null, model);
};