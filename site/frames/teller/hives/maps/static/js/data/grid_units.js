(function () {

    var app = angular.module('teller_app');

    app.factory('grid_units', function () {

        var km = 1000;
        return [
            {
                min: 0,
                max: 150,
                inc: 10,
                unit: 'm'
            },
            {
                min: 150,
                max: 400,
                inc: 25,
                unit: 'm'
            },
            {
                min: 400,
                max: 1000,
                inc: 100,
                unit: 'm'
            },
            {
                min: 1 * km,
                max: 4 * km,
                inc: 500,
                unit: 'm'
            },
            {
                min: 4 * km,
                max: 10 * km,
                inc: 1 * km,
                unit: 'km'
            },
            {
                min: 10 * km,
                max: 50 * km,
                inc: 5 * km,
                unit: 'km'
            },
            {
                min: 50 * km,
                max: 100 * km,
                inc: 10 * km,
                unit: 'km'
            },
            {
                min: 100 * km,
                max: 1000 * km,
                inc: 50 * km,
                unit: 'km'
            }

        ];

    });
})();