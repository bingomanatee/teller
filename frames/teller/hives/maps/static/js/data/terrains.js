(function () {

    var app = angular.module('teller_app');

    app.factory('terrains', function () {

        var km = 1000;

        return [
            {
                "name" : "empty"
            },
            {
                "name": "forest-conifer"
            },
            {
                "name": "forest-deciduous"
            },
            {
                "name": "desert-sand"
            },
            {
                "name": "desert-scrub"
            },
            {
                "name": "taiga"
            },
            {
                "name": "grassland"
            },
            {
                "name": "swanp"
            },
            {
                "name": "settled"
            },
            {
                "name": "farmland"
            },
            {
                "name": "jungle"
            },
            {
                "name": "barren"
            },
            {
                "name": "ocean"
            }
        ];

    });
})();