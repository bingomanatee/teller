(function () {

    var app = angular.module('teller_app');

    app.factory('town', function ($modal, make_class) {

        var NewTownModalCtrl = function ($scope, $modalInstance, town_types) {

            $scope.ok = function () {
                console.log('returning background');
                $modalInstance.close($scope.town);
            };

            $scope.town = {
                name: '',
                type: town_types[0],
                size: 1000
            };

            $scope.town_types = town_types;

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };

        var TOWN_RADIUS = 10;

        var Town = make_class(function (props) {
            this.name = '';
            this.size = 0;
            this.town_type = 'settlement';
            this.position = {x: 0, y: 0};

            _.extend(this, props);

        }, {

            to_easel: function (scale) {
                var shape = new createjs.Shape();
                shape.x = this.position.x;
                shape.y = this.position.y;

                shape.graphics.f('black').dc(0, 0, TOWN_RADIUS / scale).ef();

                return shape;
            },

            range: function(){
                return {
                    left: this.position.x - TOWN_RADIUS,
                    right: this.position.x + TOWN_RADIUS,
                    top: this.position.y - TOWN_RADIUS,
                    bottom: this.position.y + TOWN_RADIUS
                }
            }

        });


        var town = {

            Town: Town,

            town_types: [
                {
                    "name": "town"
                }   ,
                {
                    "name": "fortress"
                },
                {
                    "name": "ruins"
                },
                {
                    "name": "caves"
                },
                {
                    "name": "industry"
                },
                {
                    "name": "transport"
                }

            ],

            dialog: function ($scope, on_result) {
                var modalInstance = $modal.open({
                    templateUrl: '/partials/teller/maps/town-modal.html',
                    controller: NewTownModalCtrl,
                    resolve: {
                        town_types: function () {
                            return town.town_types;
                        }
                    }
                });

                modalInstance.result.then(on_result, function () {
                    console.log('Modal dismissed at: ' + new Date());
                });
            }
        };

        return town;

    });

})();