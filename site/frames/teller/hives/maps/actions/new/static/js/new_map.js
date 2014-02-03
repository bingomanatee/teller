(function () {

    var app = angular.module('teller_app');

    app.controller('teller_map_new', function ($scope, $window, $http, terrains, building_types, scale_options, templates, story) {

        var _view = _.template('/stories/<%= story %>/maps/<%= _id %>');

        $scope.scale_options = scale_options;
        $scope.building_types = building_types;

        $scope.building_type = building_types[0];

        $scope.scale = scale_options[0];

        $scope.size = $scope.scale.value;

        $scope.terrains = terrains;
        $scope.terrain = terrains[0];

        $scope.templates = templates;
        $scope.template = templates[0];

        $scope.units = [
            {name: 'm', value: 1}
            ,
            {name: 'km', value: 1000}
        ];

        $scope.unit = $scope.units[0];

        function _adjust_scale() {
            $scope.size = $scope.scale.value / $scope.unit.value;
        }

        $scope.$watch('scale', _adjust_scale);
        $scope.$watch('unit', _adjust_scale);

        $scope.real_size = function () {
            return $scope.size * $scope.unit.value;
        }

        $scope.show_bt = function () {
            return $scope.template.name == 'building'
        }

        $scope.save_map = function () {

            var map_data = {
                building_type: $scope.building_type.name,
                size:          $scope.unit.value * $scope.size,
                template:      $scope.template.name,
                title:         $scope.title,
                story:         story._id
            };

            $http({method: 'POST', data: map_data,
                url:       '/stories/' + story._id + '/maps/0/new'}).
                success(function (data, status, headers, config) {
                    // this callback will be called asynchronously
                    // when the response is available
                    console.log('data: ', data, 'status', status);

                    document.location = _view(data);
                }).
                error(function (data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    console.log('error', data, 'status', status);
                });

            return false;
        }

    });

})();