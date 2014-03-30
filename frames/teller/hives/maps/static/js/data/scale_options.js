(function () {

    var app = angular.module('teller_app');

    app.factory('scale_options', function () {

        var km = 1000;

        return [
            {
                name: "50m (small building)", value: 50
            },
            {
                name: "100m (med building)", value: 100
            },
            {
                name: "250 (block/lg building)", value: 250
            },
            {
                name: "1km (shopping center)", value: km
            },
            {
                name: "5km (small town)", value: 5 * km
            },
            {
                name: "10km (airport, town)", value: 10 * km
            },
            {
                name: "50km (city)", value: 50 * km
            },
            {
                name: "100km (large city)", value: 100 * km
            },
            {
                name: "500km (state, sm country)", value: 500 * km
            },
            {
                name: "1,000km (country)", value: 1000 * km
            },
            {
                name: "2,000km (lg country, moon)", value: 2000 * km
            },
            {
                name: "4,000km (continent)", value: 4000 * km
            },
            {
                name: "8,000km (Mars +)", value: 8000 * km
            },
            {
                name: "12,000km (Earth)", value: 12000 * km
            }
        ];

    });
})();