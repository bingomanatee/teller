(function () {

    var app = angular.module('teller_app');

    app.factory('appearance', function ($modal) {

        var AppearanceModalCtrl = function ($scope, $modalInstance, background) {

            $scope.ok = function () {
                console.log('returning background');
                $modalInstance.close($scope.selected);
            };

            $scope.background = background;

            $scope.bg_options = appearance_dialog.bg_options;
            $scope.selected = {item: background};

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };

        var appearance_dialog = {

            bg_options: [
                {
                    "name": "concrete",
                    "color": "rgb(225,220,230)"
                },
                {
                    "name": "grass",
                    "color": 'rgb(51,204,102)'
                },
                {
                    "name": "dirt",
                    "color": 'rgb(175,75,51)'
                }

            ],

            dialog: function ($scope, on_result) {
                var modalInstance = $modal.open({
                    templateUrl: '/partials/teller/maps/appearance-modal.html',
                    controller: AppearanceModalCtrl,
                    resolve: {
                        background: function () {
                            return $scope.background;
                        }
                    }
                });

                modalInstance.result.then(on_result, function () {
                    console.log('Modal dismissed at: ' + new Date());
                });
            }
        };

        return appearance_dialog;

    });

})();