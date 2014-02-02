(function () {

    var app = angular.module('teller_app');

    app.factory('building', function ($modal, make_class, building_types) {

        var NewBuildingModalCtrl = function ($scope, $modalInstance, editing_building, base_scope) {

            $scope.ok = function () {
                console.log('returning background');
                $modalInstance.close($scope.building);
            };

            $scope.building = {
                name: editing_building ? editing_building.name : '',
                type: editing_building ? editing_building.type : building_types[0],
                size: editing_building ? editing_building.size : building_types[0].size
            };

            if (base_scope){
                $scope.building.$scope = base_scope;
            }

            $scope.building_types = building_types;

            $scope.$watch('building.type', function (btype) {
                $scope.building.size = btype.default_size;
            }, true);

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };

        var _color = _.template('rgb(<%= r %>,<%= g %>,<%= b %>)');

        var Building = make_class(function (props) {
            this.name = '';
            this.size = 10;
            this.type = 'home';
            this.position = {x: 0, y: 0};
            this.shapes = [];
            this.map_info = null;
            _.extend(this, props);

        }, {

            edit: function () {
                building_info.dialog({}, function (data) {
                    console.log('building changed: ', data);
                    if (data){
                        this.name = data.name;
                        this.size = data.size;
                        this.type = data.type;
                        this.map_info.building_layer.refresh();
                        this.map_info.map.render_layer(this.map_info.building_layer, this.map_info.render_params, this.map_info.stage);
                        this.map_info.stage.update();

                    }
                }.bind(this), this)
            },

            to_easel: function (scale) {
                var shape = new createjs.Shape();

                shape.graphics.f(_color(this.type.default_color)).dr(0, 0, this.size, this.size).ef()
                    .ss(1 / scale).s('black').dr(0, 0, this.size, this.size);
                shape.x = shape.y = this.size / -2;
                var container = new createjs.Container();

                container.x = this.position.x;
                container.y = this.position.y;

                container.addChild(shape);

                if (this.name) {
                    var outline = new createjs.Text(this.name, 14 / scale + 'px Arial', 'white');
                    outline.outline = 2 / scale;
                    outline.x = this.size * -4 / 10;

                    var label = new createjs.Text(this.name, 14 / scale + 'px Arial', 'black');
                    label.x = this.size * -4 / 10;
                    container.addChild(outline);
                    container.addChild(label);
                }

                return container;
            },

            range: function () {
                return {
                    left:   this.position.x - this.size,
                    right:  this.position.x + this.size + 200,
                    top:    this.position.y - this.size,
                    bottom: this.position.y + this.size
                }
            }

        });

        var building_info = {

            Building: Building,

            add_building_layer: function (map_info) {

                map_info.building_layer = map_info.map.add_layer('buildings', {

                    add_tile_shapes: function (tile) {
                        _.each(map_info.buildings, function (building) {
                            if (tile.contains(building.range())) {
                                var shape = building.to_easel(tile.layer.scale());
                                console.log('adding tile to shapes');
                                building.shapes.push({tile: tile, shape: shape});

                                tile.container().addChild(shape);
                                var move_shape;
                                shape.on('mousedown', function (e) {
                                    console.log('mousedown for building', building);
                                    console.log('shape: ', shape);

                                    if (e.nativeEvent.altKey) {
                                        //  this.remove_point(point);
                                    } else if (e.nativeEvent.shiftKey) {
                                        e.stopPropagation();
                                        return  building.edit();
                                    }

                                    _.each(building.shapes, function (data) {
                                        console.log('clearing ', data);
                                        data.shape.visible = false;
                                        data.tile.container().updateCache();
                                    });

                                    map_info.stage.update();
                                    move_shape = building.to_easel(tile.layer.scale());
                                    map_info.building_move_layer.offset_layer().addChild(move_shape);
                                });

                                shape.on('pressmove', function (e) {
                                    if (!move_shape) return;

                                    var local = map_info.building_layer.offset_layer()
                                        .globalToLocal(e.stageX, e.stageY);
                                    console.log('pressmove for ', building.name, local);
                                    move_shape.x = local.x;
                                    move_shape.y = local.y;
                                    building.position.x = local.x;
                                    building.position.y = local.y;
                                    map_info.stage.update();
                                });

                                shape.on('pressup', function () {
                                    console.log('pressup for ', building.name);
                                    map_info.building_move_layer.offset_layer().removeAllChildren();
                                    building.shapes = [];
                                    map_info.update();
                                    move_shape = false;
                                })
                            }
                            ;
                        })
                    },
                    events:          {/*
                     pressmove: function(ev){
                     console.log('mouse event for building: ', ev);
                     },
                     pressup: function(e2){
                     console.log('mouse up for building:', e2)
                     }*/
                    }
                });

                map_info.building_move_layer = map_info.map.add_layer('buildings_move', {});
                map_info.building_move_layer.render = function () {
                    // blocking creation of tiles
                }
            },

            building_types: building_types,

            dialog: function ($scope, on_result, building) {
                var modalInstance = $modal.open({
                    templateUrl: '/partials/teller/maps/building-modal.html',
                    controller:  NewBuildingModalCtrl,
                    resolve:     {
                        editing_building: function () {
                            return building
                        },
                        base_scope:       function () {
                            return $scope;
                        }
                    }
                });

                modalInstance.result.then(on_result, function () {
                    console.log('Modal dismissed at: ' + new Date());
                });
            }
        };

        return building_info;

    });

})();