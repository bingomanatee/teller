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
            },

            add_ground_layer: function(map_info){
                map_info.ground_layer = map_info.map.add_layer('ground', {

                    add_tile_shapes: function (tile) {
                        var back_fill = new createjs.Shape();
                        back_fill.graphics.f(map_info.background ? map_info.background.color : 'white').r(tile.left() - 1,
                            tile.top() - 1,
                            this.tile_width / this.scale() + 1,
                            this.tile_height / this.scale() + 1
                        );
                        tile.container().addChild(back_fill);
                    },
                    events: {
                        pressmove: function(ev){
                            console.log('pressmove for ground: ', ev);
                            var point  = map_info.ground_layer.offset_layer()
                                .globalToLocal(ev.stageX, ev.stageY);
                            var x = start_offset.left + point.x - start_point.x;
                            var y = start_offset.top + point.y - start_point.y;
                            map_info.render_params.left = x;
                            map_info.render_params.top = y;
                            map_info.map.render(map_info.render_params, map_info.stage);
                        },
                        mousedown: function(e2){
                            console.log('mouse down for ground:', e2)
                            start_point = map_info.ground_layer.offset_layer()
                                .globalToLocal(e2.stageX, e2.stageY);
                            start_offset = _.clone(map_info.render_params);
                        },

                        pressup: function(){
                            map_info.update();
                        }
                    }

                });
            }
        };

        return appearance_dialog;

    });

})();