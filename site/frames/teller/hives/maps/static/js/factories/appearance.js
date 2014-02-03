(function () {

    var app = angular.module('teller_app');

    app.factory('appearance', function ($modal, scale_options, grid_units) {

        var AppearanceModalCtrl = function ($scope, $modalInstance, background, scale) {

            $scope.ok = function () {
                console.log('returning background');
                $modalInstance.close($scope.selected);
            };

            $scope.bg_options = appearance_info.bg_options;
            $scope.selected = {background: background, scale: scale};
            $scope.scale_options = appearance_info.scale_options;

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };

        var km = 1000;

        var appearance_info = {

            scale_options: scale_options,

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
                        scale:      function () {
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

                        back_fill.graphics.f('black').r(tile.left(), tile.top(), tile.width(), tile.height());

                        if (tile.contains(map_info.map)) {

                            var left = Math.max(map_info.map.left, tile.left());
                            var right = Math.min(map_info.map.right, tile.right());
                            var top = Math.max(map_info.map.top, tile.top());
                            var bottom = Math.min(map_info.map.bottom, tile.bottom());

                            back_fill.graphics.f(map_info.background ? map_info.background.color : 'white')
                                .r(left,
                                    top,
                                    (right - left),
                                    (bottom - top)
                                );
                        }
                        tile.container().addChild(back_fill);

                    },
                    events:          {
                        pressmove: function (ev) {
                            ev.stopPropagation();
                            if (map_info._ground_move_time > new Date().getTime() + 50) {
                                return;
                            }
                            map_info._ground_move_time = new Date().getTime();
                            //   console.log('pressmove for ground: ', ev);
                            var x = start_offset.left + (ev.stageX - start_point.x) / start_offset.scale;
                            var y = start_offset.top + (ev.stageY - start_point.y) / start_offset.scale;
                            if (map_info.render_params.scale <= 2) {
                                x -= x % Math.floor(10 / map_info.render_params.scale);
                                y -= y % Math.floor(10 / map_info.render_params.scale);
                            }

                            map_info.render_params.left = x;
                            map_info.render_params.top = y;
                            map_info.map.set_coordinates(map_info.render_params, map_info.stage);
                            map_info.stage.update();
                        },
                        mousedown: function (e2) {
                            start_point = {x: e2.stageX, y: e2.stageY};
                            start_offset = _.clone(map_info.render_params);
                        },

                        pressup: function () {
                            map_info.update();
                        }
                    }

                });
            },

            grid_units: grid_units,

            add_grid_layer: function (map_info) {

                //todo: don't use tiles on grid layer

                function _color_lines(m, shape) {
                    shape.graphics.s(_color_m(m));
                }

                function _color_m(m) {
                    if (m > 0) {
                        return ('rgb(102,0,125)');
                    } else if (m == 0) {
                        return('rgb(204,0,0)');
                    } else {
                        return('rgb(0,0,204)');
                    }
                }

                map_info.grid_layer = map_info.map.add_layer('grid', {

                    render: function () {
                        if (this.offset_layer().getNumChildren() > 0) {
                            this.offset_layer().removeAllChildren();
                            //    this.offset_layer().uncache();
                        }

                        var scale = this.scale()
                        var draw_grid = this.bounds();
                        var bounds = this.bounds();
                        var view_size = this.stage.canvas.width / this.scale();
                        var unit = _.find(appearance_info.grid_units, function (i) {
                            return i.min < view_size && i.max >= view_size;
                        });

                        draw_grid.left -= draw_grid.left % unit.inc;
                        draw_grid.top -= draw_grid.top % unit.inc;
                        var shape = new createjs.Shape();
                        shape.graphics.ss(1 / this.scale());

                        shape.mouseEnabled = false;

                       // shape.graphics.f('rgba(0,255,0,0.25)').dr(bounds.left, bounds.top, bounds.width, bounds.height).ef();
                        function _add_text(m, x, y) {
                            var label;
                            if (unit.unit == 'm') {
                                label = m + ' m';
                            } else {
                                label = Math.floor(m / 1000) + ' km';
                            }

                            var text = new createjs.Text(label, 'bold ' + 14 / scale + 'px Arial', _color_m(m));
                            text.x = x;
                            text.y = y;

                            var w = text.clone();
                            w.outline = 2 / scale;
                            w.color = 'white';
                            text.shadow = new createjs.Shadow('rgba(255,255,255,0.5)', 0, 0, 1 * w.outline);
                            this.offset_layer().addChild(w);
                            this.offset_layer().addChild(text);

                        }

                        var xs = _.uniq(_.range(0, bounds.right, unit.inc)
                            .concat(_.range(0, bounds.left - unit.inc, -unit.inc)));

                        _.each(xs,
                            function (x) {
                                _color_lines(x, shape);
                                shape.graphics
                                    .ss(1 / this.scale())
                                    .mt(x, bounds.top)
                                    .lt(x, bounds.bottom)
                                    .es();

                                _add_text.bind(this)(x, x, bounds.top);

                            }, this);


                        var ys = _.uniq(_.range(0, bounds.bottom, unit.inc)
                            .concat(_.range(0, bounds.top - unit.inc, -unit.inc)));

                        _.each(ys,
                            function (y) {

                                _color_lines(y, shape);
                                shape.graphics
                                    .ss(1 / this.scale())
                                    .mt(bounds.left, y)
                                    .lt(bounds.right, y)
                                    .es();

                                _add_text.bind(this)(y, bounds.left, y);
                            }, this);

                        this.offset_layer().addChild(shape);

                        // this.offset_layer().cache(bounds.left, bounds.top, bounds.width, bounds.height, 1/this.scale());
                    }

                })
            }
        };

        return appearance_info;

    });

})();