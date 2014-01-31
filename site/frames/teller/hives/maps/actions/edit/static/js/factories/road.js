(function () {

    var app = angular.module('teller_app');

    app.factory('road', function ($modal, make_class, road_label) {

        var NewRoadModalCtrl = function ($scope, $modalInstance, road_types) {

            $scope.ok = function () {
                $modalInstance.close($scope.road);
            };

            $scope.road = {
                name: '',
                type: road_types[0]
            };

            $scope.road_types = road_types;

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };

        var EditRoadModalCtrl = function ($scope, $modalInstance, roads) {

            $scope.ok = function () {
                $modalInstance.close($scope.road);
            };

            $scope.roads = roads;

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        }

        var Road = make_class(function (props) {
            this.name = '';
            this.road_type = 'paved_road';
            this.map_info = null;
            this.points = [];
            _.extend(this, props);

        }, {

            done_drawing_road: function () {
                this.map_info.mode = this.map_info.MODE_MOVE;
                this.map_info.current_road = null;
                _.each(this.points, function (point) {
                    delete point.cursor
                });
                this.map_info.update();
            },

            remove_point: function(point){
                point.cursor.graphics.c();
                this.points = _.without(this.points, point);
                this.map_info.update();
            },
            insert_point: function (point) {
                var index = _.indexOf(this.points, point);

                var peer, new_point, insert_at;

                if (this.points[index + 1]) {
                    peer = this.points[index + 1];
                    insert_at = index + 1;
                } else {
                    peer = this.points[index - 1];
                    insert_at = index;
                }

                new_point = {
                    x: (point.x + peer.x) / 2,
                    y: (point.y + peer.y) / 2
                };

                this.points.splice(insert_at, 0, new_point);
                this.map_info.update();
            },

            edit_road: function () {
                if (this.map_info.current_road == this) return;
                this.scope.confirm_start('done with road',
                    this.done_drawing_road.bind(this));

                this.map_info.mode = this.map_info.MODE_DRAW_ROAD;
                this.map_info.current_road = this;
                this.map_info.update();
                this.scope.$apply();
            },

            add_point: function (point, from_point) {
                point.road = this;
                this.points.push(point);
                this.map_info.update();
            },

            in_search: function () {
                return new RegExp(this.map_info.search_text).test(this.name);
            },

            STROKE_WIDTH: 3,
            STROKE_WIDTH_SEARCHING: 6,
            STROKE_WIDTH_INACTIVE: 2,
            STROKE_COLOR: 'black',
            STROKE_COLOR_INACTIVE: 'rgb(128,128,128)',

            to_easel: function (scale) {

                var shape = new createjs.Shape();
                if (!this.points.length > 0) return shape;
                var stroke_width, color;

                if (!this.map_info.search_text) {
                    stroke_width = this.STROKE_WIDTH;
                    color = this.STROKE_COLOR;
                } else if (this.in_search()) {
                    stroke_width = this.STROKE_WIDTH_SEARCHING;
                    color = this.STROKE_COLOR;
                } else {
                    stroke_width = this.STROKE_WIDTH_INACTIVE;
                    color = this.STROKE_COLOR_INACTIVE;
                }


                shape.graphics.ss(stroke_width / scale).s(color);
                shape.graphics.mt(this.points[0].x, this.points[0].y);
                _.each(this.points.slice(1), function (point) {
                    shape.graphics.lt(point.x, point.y);
                }, this);

                var shape2 = new createjs.Shape();
                _.each(this.points, function (point) {
                    shape.graphics.f(color).dc(point.x, point.y, 2 * stroke_width / scale).ef().es();
                });

                var container = new createjs.Container();
                container.addChild(shape);
                container.addChild(shape2);

                if (this.in_search()) {
                    container.addChild(road_label(this, scale));
                }

                container.on('mousedown', function (e) {
                    e.stopPropagation();
                })
                container.on('click', function (e) {
                    e.stopPropagation();
                    this.edit_road()
                }.bind(this));

                return container;
            },

            make_cursor: function (point, layer) {

                var road = this;

                point.cursor = new createjs.Shape();

                point.cursor.graphics.f('white').s('black').ss(1).dc(0, 0, 8);

                point.cursor.on('mousedown', function (e) {
                    if (e.nativeEvent.altKey) {
                        this.insert_point(point);
                    } else if (e.nativeEvent.shiftKey){
                        this.remove_point(point);
                    }
                    e.stopPropagation();
                }.bind(this));

                point.cursor.on('pressmove', function (e) {
                    if (e.nativeEvent.altKey || e.nativeEvent.shiftKey) return;
                    e.stopPropagation();
                    var c = layer.offset_layer().globalToLocal(e.stageX, e.stageY);
                    _.extend(point, c);
                    _.extend(point.cursor, c);

                    road.map_info.road_layer.refresh();
                    road.map_info.map.render_layer(road.map_info.road_layer, road.map_info.render_params, road.map_info.stage);

                    road.map_info.stage.update();
                }.bind(this));


                return point.cursor;
            },

            update_cursors: function (layer) {
                _.each(this.points, function (point) {

                    if (!point.cursor) {
                        layer.cursor_layer.addChild(this.make_cursor(point, layer));
                    }

                    point.cursor.scaleX = point.cursor.scaleY = 1 / layer.scale();

                    point.cursor.x = point.x;
                    point.cursor.y = point.y;

                    //@TODO: add events to cursors


                }, this);
            },

            range: function () {
                return {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            }

        });

        var road = {

            Road: Road,

            add_road_draw_layer: function (map_info) {
                map_info.draw_road_layer = map_info.map.add_layer('draw road', {
                    add_tile_shapes: function (tile) {
                        if (map_info.mode == map_info.MODE_DRAW_ROAD) {
                            var trapper = new createjs.Shape();
                            trapper.graphics.f('rgba(255, 0,0,0.5)').r(tile.left(), tile.top(), tile.width(), tile.height());
                            trapper.tile = tile;
                            tile.container().addChild(trapper);
                        }
                    },

                    events: {
                        mousedown: function (event) {
                            if (map_info.mode == map_info.MODE_DRAW_ROAD) {
                                var point = event.target.globalToLocal(event.stageX, event.stageY);
                                map_info.current_road.add_point(point);
                                map_info.update(); //@TODO: update selected layers
                            }
                        }

                    },

                    post_render: function () {
                        if (!this.cursor_layer) {
                            this.cursor_layer = new createjs.Container();
                            this.offset_layer().addChild(this.cursor_layer);
                        }
                        this.offset_layer().setChildIndex(this.cursor_layer, this.offset_layer().getNumChildren() - 1);

                        if (map_info.mode == map_info.MODE_DRAW_ROAD) {
                            if ((!this.cursor_road) || (this.cursor_road != map_info.current_road)) {
                                this.cursor_layer.removeAllChildren();
                                this.cursor_road = map_info.current_road;
                            }
                            map_info.current_road.update_cursors(this);
                        } else {
                            this.cursor_layer.removeAllChildren();
                        }
                    }

                });

            },

            add_road_layer: function (map_info) {

                map_info.road_layer = map_info.map.add_layer('roads', {

                    add_tile_shapes: function (tile) {
                        _.each(map_info.roads, function (road) {
                            //@TODO: bounds check
                            console.log('drawing road', road);
                            tile.container().addChild(road.to_easel(tile.layer.scale()));
                        });
                    },

                    events: {/*
                     pressmove: function(ev){
                     console.log('mouse event for road: ', ev);
                     },
                     pressup: function(e2){
                     console.log('mouse up for road:', e2)
                     }*/
                    }
                });

                map_info.road_move_layer = map_info.map.add_layer('roads_move', {});
                map_info.road_move_layer.render = function () {
                    // blocking creation of tiles
                }
            },

            road_types: [
                {
                    "name": "path"
                }   ,
                {
                    "name": "stone_road"
                },
                {
                    "name": "paved_road"
                },
                {
                    "name": "paved_avenue"
                },
                {
                    "name": "freeway"
                },
                {
                    "name": "subway"
                }

            ],

            edit_dialog: function ($scope, map_info, on_result) {
                var modalInstance = $modal.open({
                    templateUrl: '/partials/teller/maps/road-edit-modal.html',
                    controller: EditRoadModalCtrl,
                    resolve: {
                        roads: function () {
                            return map_info.roads;
                        }
                    }
                });

                modalInstance.result.then(on_result, function () {
                    console.log('Modal dismissed at: ' + new Date());
                });
            },

            dialog: function ($scope, on_result) {
                var modalInstance = $modal.open({
                    templateUrl: '/partials/teller/maps/road-modal.html',
                    controller: NewRoadModalCtrl,
                    resolve: {
                        road_types: function () {
                            return road.road_types;
                        }
                    }
                });

                modalInstance.result.then(on_result, function () {
                    console.log('Modal dismissed at: ' + new Date());
                });
            }
        };

        return road;

    });

})();