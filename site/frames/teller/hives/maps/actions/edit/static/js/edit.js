(function () {

    var app = angular.module('teller_app');


    app.controller('teller_map_edit', function ($scope, $window, $modal, $location,
                                                appearance,
                                                map,
                                                road,
                                                town) {

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

        map.init_map();

        $scope.background = appearance.bg_options[0];

        $scope.add_options = add_options;

        // EASEL_MAP.grid_layer('back grid', map, {grid_params:{line_color: 'rgba(0, 204,0,0.5)'}});

        $scope.add_item = function (type) {
            switch (type) {
                case 'town':
                    town.dialog($scope, function(town){
                        map.add_town(town);
                    });
                    break;

                case 'road':
                    road.dialog($scope, function(road){
                        map.add_road(road);
                    });
                    break;

                default:
            }
        };

        var c = _.template('x: <%= left %>, y: <%= top %>');

        $scope.coords = function(){
            return c(map.render_params);
        }

       $('#map-scale-slider').slider({
            value: 1,
            min: 0.125,
           max: 4,
           step: 0.125,
           handle: 'square'
       }).on('slide', function(ev){
            var scale =  ev.value;
               console.log('scale: ', scale);
            map.set_scale(scale);
        })

        map.background = $scope.background = appearance.bg_options[0];
        map.update();

        $scope.set_appearance = function () {
            appearance.dialog($scope, function(settings){
                map.background = $scope.background = settings.background;
                map.update();
            });
        };

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.


    })
})();