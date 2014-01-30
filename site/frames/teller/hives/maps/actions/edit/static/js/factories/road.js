(function () {

    var app = angular.module('teller_app');

    app.factory('road', function ($modal, make_class) {

        var NewRoadModalCtrl = function ($scope, $modalInstance, road_types) {

            $scope.ok = function () {
                console.log('returning background');
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

        var Road = make_class(function (props) {
            this.name = '';
            this.road_type = 'paved_road';
            this.map_info = null;
            this.points = [];
            _.extend(this, props);

        }, {

            start_road: function (point) {
                this.map_info.draw_mode = this.map_info.MODE_DRAW_ROAD;
                this.map_info.current_road = this;
                this.add_point(point);
            },

            add_point: function (point, from_point) {
                point.road = this;
                this.points.push(point);
                this.map_info.update();
            },

            to_easel: function (scale) {
                var shape = new createjs.Shape();
                if (!this.points.length > 1) return shape;

                shape.graphics.ss(2 / scale).s('black');
                shape.graphics.mt(this.points[0].x, this.points[0].y);
                _.each(this.points.slice(1), function (point) {
                    shape.graphics.lt(point.x, point.y);
                }, this);

                return shape;
            },

            make_cursor: function(point, layer){
                point.cursor = new createjs.Shape();

                point.cursor.graphics.f('white').s('black').ss(1).dc(0,0,5);

                point.cursor.on('pressmove', function(e){
                    var c = layer.offset_layer().globalToLocal(e.stageX, e.stageY);
                    _.extend(point, c);
                    _.extend(point.cursor, c);

                    point.road.map_info.stage.update();
                }.bind(this));


                return point.cursor;
            },

            update_cursors: function(layer){
                _.each(this.points, function(point){

                    if (!point.cursor){
                        layer.cursor_layer.addChild(this.make_cursor(point, layer));
                    }

                    point.cursor.scaleX = point.cursor.scaleY = 1/layer.scale();

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
                        if (map_info.draw_mode == map_info.MODE_DRAW_ROAD) {
                            var trapper = new createjs.Shape();
                            trapper.graphics.f('rgba(255, 0,0,0.5)').r(tile.left(), tile.top(), tile.width(), tile.height());
                            trapper.tile = tile;
                            tile.container().addChild(trapper);
                        }
                    },

                    events: {

                        mousedown: function (event) {
                            var point = event.target.globalToLocal(event.stageX, event.stageY);
                            map_info.current_road.add_point(point);
                            console.log('added point to ', map_info.current_road);
                            map_info.update();
                        }

                    },

                    post_render: function () {
                        if (!this.cursor_layer) {
                            this.cursor_layer = new createjs.Container();
                            this.offset_layer().addChild(this.cursor_layer);
                        }
                        this.offset_layer().setChildIndex(this.cursor_layer, this.offset_layer().getNumChildren() - 1);

                        if (map_info.draw_mode == map_info.MODE_DRAW_ROAD) {
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