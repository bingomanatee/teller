(function () {

    var app = angular.module('teller_app');

    app.factory('appearance', function ($modal) {

        var AppearanceModalCtrl = function ($scope, $modalInstance, background, scale) {

            $scope.ok = function () {
                console.log('returning background');
                $modalInstance.close($scope.selected);
            };

            $scope.bg_options = appearance_info.bg_options;
            $scope.selected = {background: background};
            $scope.scale_options = appearance_info.scale_options;

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };

        var km = 1000;

        var appearance_info = {

            scale_options: [
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
            ],

            bg_options: [
                {
                    name:    "concrete",
                    "color": "rgb(225,220,230)"
                },
                {
                    name:    "grass",
                    "color": 'rgb(51,204,102)'
                },
                {
                    name:    "dirt",
                    "color": 'rgb(175,75,51)'
                }

            ],

            dialog: function ($scope, on_result) {
                var modalInstance = $modal.open({
                    templateUrl: '/partials/teller/maps/appearance-modal.html',
                    controller:  AppearanceModalCtrl,
                    resolve:     {
                        background: function () {
                            return $scope.background;
                        },
                        scale:   function () {
                            return $scope.scale;
                        }
                    }
                });

                modalInstance.result.then(on_result, function () {
                    console.log('Modal dismissed at: ' + new Date());
                });
            },

            add_ground_layer: function (map_info) {
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
                    events:          {
                        pressmove: function (ev) {
                            if (map_info._ground_move_time > new Date().getTime() + 50) {
                                return;
                            }
                            map_info._ground_move_time = new Date().getTime();
                            console.log('pressmove for ground: ', ev);
                            var point = map_info.ground_layer.offset_layer()
                                .globalToLocal(ev.stageX, ev.stageY);
                            var x = start_offset.left + point.x - start_point.x;
                            var y = start_offset.top + point.y - start_point.y;
                            map_info.render_params.left = x;
                            map_info.render_params.top = y;
                            map_info.map.set_coordinates(map_info.render_params, map_info.stage);
                            map_info.stage.update();
                        },
                        mousedown: function (e2) {
                            console.log('mouse down for ground:', e2)
                            start_point = map_info.ground_layer.offset_layer()
                                .globalToLocal(e2.stageX, e2.stageY);
                            start_offset = _.clone(map_info.render_params);
                        },

                        pressup: function () {
                            map_info.update();
                        }
                    }

                });
            },

            grid_units: [
                {
                    min: 0,
                    max: 50,
                    inc: 10,
                    unit: 'm'
                },
                {
                    min: 50,
                    max: 200,
                    inc: 25,
                    unit: 'm'
                },
                {
                    min: 200,
                    max: 1000,
                    inc: 100,
                    unit: 'm'
                },
                {
                    min: 1 * km,
                    max: 5 * km,
                    inc: 500,
                    unit: 'm'
                },
                {
                    min: 5 * km,
                    max: 10 * km,
                    inc: 1 * km,
                    unit: 'km'
                },
                {
                    min: 10 * km,
                    max: 50 * km,
                    inc: 5 * km,
                    unit: 'km'
                },
                {
                    min: 50 * km,
                    max: 100 * km,
                    inc: 10 * km,
                    unit: 'km'
                },
                {
                    min: 100 * km,
                    max: 1000 * km,
                    inc: 50 * km,
                    unit: 'km'
                }

            ],

            add_grid_layer: function(map_info){

                //todo: don't use tiles on grid layer

                map_info.grid_layer = map_info.map.add_layer('grid', {

                    add_tile_shapes: function(tile){
                        var scale = tile.layer.scale();
                        if (!scale){
                            scale = map_info.render_params.scale;
                        }
                        var view_size = tile.layer.stage.canvas.width / scale;
                        if (isNaN(view_size)){
                            console.log('nan');
                            return;
                        }
                        console.log('view_size: ', view_size);
                        var unit = _.find(appearance_info.grid_units, function(i){
                            return i.min < view_size && i.max >= view_size;
                        });
                        unit = unit || _.last(appearance_info.grid_units);

                        var left = tile.left();
                        left -= left % unit.inc;
                        var top = tile.top();
                        top -= top % unit.inc;
                        var right = tile.right();
                        var bottom = tile.bottom();

                        var shape = new createjs.Shape();
                        shape.graphics.s('rgba(0,0,102,0.5)').ss(1/scale);
                        _.each(_.range(left, right, unit.inc), function(x){
                            shape.graphics.mt(x, top).lt(x, bottom);

                            var g_pt = tile.container().localToGlobal(x, 0);
                            var text_pt = tile.container().globalToLocal(g_pt.x, 0);

                            g_pt = tile.container().localToGlobal(x + 50, 0);
                            var text_pt_2 = tile.container().globalToLocal(g_pt.x, 20);

                          //  var range = {left: text_pt.x, right: text_pt_2.x, top: text_pt.y, bottom: text_pt_2.y}

                        //    if (tile.contains(range)){
                                var label;
                                if (unit.unit == 'm'){
                                    label = x + ' m';
                                } else {
                                    label = Math.floor(x / 1000) + ' km';
                                }
                                var text = new createjs.Text( label, 12 / scale + 'px Arial Bold', 'blue');
                                _.extend(text, {x: text_pt.x, y: text_pt_2.y });
                                tile.container().addChild(text);
                         //   }

                        });


                        _.each(_.range(top, bottom, unit.inc), function(y){
                            shape.graphics.mt(left, y).lt(right, y);

                            var g_pt = tile.container().localToGlobal(0, y);
                            var text_pt = tile.container().globalToLocal(0, g_pt.y - 12);
                            var text_pt_2 = tile.container().globalToLocal(50, g_pt.y);

                          //  var range = {left: text_pt.x, right: text_pt_2.x, top: text_pt.y, bottom: text_pt_2.y}

                          //  if (tile.contains(range)){
                                var label;
                                if (unit.unit == 'm'){
                                    label = y + ' m';
                                } else {
                                    label = Math.floor(y / 1000) + ' km';
                                }
                                var text = new createjs.Text( label, 12 / scale + 'px Arial Bold', 'blue');
                                _.extend(text, {x: text_pt.x, y: text_pt_2.y });
                                tile.container().addChild(text);
                         //   }

                        });

                        tile.container().addChild(shape);
                    }

                })
            }
        };

        return appearance_info;

    });

})();