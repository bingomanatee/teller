(function () {

    var app = angular.module('teller_app');

    app.factory('town', function ($modal) {


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

        var town_dialog = {

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

            dialog: function($scope){
                var modalInstance = $modal.open({
                    templateUrl: '/partials/teller/maps/town-modal.html',
                    controller: NewTownModalCtrl,
                    resolve: {
                        town_types: function () {
                            return town_dialog.town_types;
                        }
                    }
                });

                modalInstance.result.then(function (town) {
                    console.log('got town ', town);
                    $scope.add_town(town);
                }, function () {
                    console.log('Modal dismissed at: ' + new Date());
                });
            }
        };

        return town_dialog;

    });

})();