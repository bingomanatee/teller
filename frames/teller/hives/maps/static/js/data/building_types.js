(function () {

    var app = angular.module('teller_app');

    app.factory('building_types', function () {

        return [
            {
                "name":          "house",
                "default_size":  20,
                "default_color": {
                    r: 200,
                    g: 250,
                    b: 255
                }
            }   ,
            {
                "name":          "store",
                "default_size":  40,
                "default_color": {
                    r: 220,
                    g: 250,
                    b: 220
                }
            },
            {
                "name":          "warehouse",
                "default_size":  80,
                "default_color": {
                    r: 100,
                    g: 100,
                    b: 70
                }
            },
            {
                "name":          "barn",
                "default_size":  80,
                "default_color": {
                    r: 204,
                    g: 0,
                    b: 51
                }
            },
            {
                "name":          "office",
                "default_size":  70,
                "default_color": {
                    r: 255,
                    g: 250,
                    b: 200
                }
            },
            {
                "name":          "factory",
                "default_size":  80,
                "default_color": {
                    r: 250,
                    g: 200,
                    b: 225
                }
            },
            {
                "name":          "church",
                "default_size":  60,
                "default_color": {
                    r: 255,
                    g: 255,
                    b: 240
                }
            },
            {
                "name":          "government",
                "default_size":  80,
                "default_color": {
                    r: 150,
                    g: 125,
                    b: 150
                }
            },
            {
                "name":          "entertainment",
                "default_size":  80,
                "default_color": {
                    r: 255,
                    g: 200,
                    b: 200
                }
            },
            {
                "name":          "ruins",
                "default_size":  60,
                "default_color": {
                    r: 100,
                    g: 100,
                    b: 120
                }
            },
            {
                "name":          "stadium",
                "default_size":  200,
                "default_color": {
                    r: 100,
                    g: 100,
                    b: 255
                }
            },
            {
                "name":          "vacant",
                "default_size":  80,
                "default_color": {
                    r: 255,
                    g: 255,
                    b: 240
                }
            }
        ];
    });
})();