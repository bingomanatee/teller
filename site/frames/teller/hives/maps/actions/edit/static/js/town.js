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

        var Town = make_class(function(props){
            this.name = '';
            this.size = 0;
            this.town_type = 'settlement';

            _.extend(this, props);

        }, {


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

            dialog: function($scope, on_result){
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