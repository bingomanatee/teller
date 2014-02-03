(function () {

    var app = angular.module('teller_app');

    app.controller('teller_map_edit', function ($scope, $window, $modal, $location, appearance, map, road, town, building) {

        var add_options = [
            {
                name: 'road'
            },
            {
                name: 'town'
            },
            {
                name: 'building'
            },
            {
                name: 'terrain'
            }
        ];

        $scope.background = appearance.bg_options[0];
        $scope.scale = appearance.scale_options[0];
        $scope.add_options = add_options;
        map.$scope = $scope;
        map.init_map($scope.scale);

        // EASEL_MAP.grid_layer('back grid', map, {grid_params:{line_color: 'rgba(0, 204,0,0.5)'}});

        $scope.add_item = function (type) {
            switch (type) {
                case 'town':
                    town.dialog($scope, function (town) {
                        map.add_town(town);
                    });
                    break;

                case 'road':
                    road.dialog($scope, function (road_data) {

                        var road_obj = map.add_road(road_data, $scope);
                    });
                    break;

                case 'building':
                    building.dialog($scope, function (building_data) {

                        var building_obj = map.add_building(building_data, $scope);
                    });
                    break;

                default:
            }
        };

        $scope.$watch('search_text', function (value) {
            map.set_search_text(value);
        });

        $scope.edit_item = function (type) {
            switch (type) {
                case 'town':

                    break;

                case 'road':
                    road.edit_dialog($scope, map, function (road_obj) {
                        if (road_obj) {
                            road_obj.edit_road();

                            $scope.confirm_start('done with road', function () {
                                road_obj.done_drawing_road();
                            })
                        }
                    });
                    break;

                default:
            }
        };

        $scope.show_search_menu = $scope.show_add_menu = $scope.show_appearance_menu = function () {
            return map.mode == map.MODE_MOVE;
        }

        $scope.map_mode = function () {
            return map.mode;
        }

        var c = _.template('x: <%= left %>, y: <%= top %>, scale: <%= scale %>');

        $scope.coords = function () {
            return c(map.render_params) + 'width: ' + Math.round(map.stage.canvas.width / map.render_params.scale)
        };

        $scope.show_confirm_button = false;

        $scope.confirm_done = function () {
            $scope._confirm_done();
            $scope.show_confirm_button = false;
            $scope._confirm_done = null;
        };

        $scope.confirm_start = function (message, on_done) {
            if ($scope._confirm_done) {
                throw new Error('attempting to add confirm start ' + message
                    + ' with existing handler ' + $scope.confirm_text);
            }
            $scope.show_confirm_button = true;
            $scope.confirm_text = message || 'Done';
            $scope._confirm_done = on_done;
        };

        var scales = [1/30, 1/20, 1/10, 1, 2, 4, 6, 8, 10, 12, 15];
        $('#map-scale-slider').slider({
            value:  5,
            min:    0,
            max:    scales.length - 1,
            step:   1,
            handle: 'square'
        }).on('slide', function (ev) {
                var scale = scales[ev.value]
                console.log('scale: ', scale);
                map.set_scale(scale);
            });

        map.background = $scope.background = appearance.bg_options[0];

        $scope.set_appearance = function () {
            appearance.dialog($scope, function (settings) {
                map.background = $scope.background = settings.background;
                map.scale = $scope.scale = settings.scale;
                map.init_map(settings.scale);
                map.update();
            });
        };

        $scope.center = function(){
          map.center();
        };

        map.set_scale(scales[5]);
        map.update();

    })
})();