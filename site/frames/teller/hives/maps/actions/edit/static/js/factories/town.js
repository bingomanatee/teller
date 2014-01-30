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
            this.shapes = [];
            this.map_info = null;
            _.extend(this, props);

        }, {

            to_easel: function (scale) {
                var shape = new createjs.Shape();

                shape.graphics.f('black').dc(0, 0, TOWN_RADIUS).ef();

                var outline = new createjs.Text(this.name, '14px Arial','white');
                outline.outline = 4;
                outline.x =  TOWN_RADIUS ;

                var label = new createjs.Text(this.name, '14px Arial','black');
                label.x =  TOWN_RADIUS ;

                var container = new createjs.Container();
                container.x = this.position.x;
                container.y = this.position.y;
                container.scaleX = container.scaleY = 1/scale;

                container.addChild(shape);
                container.addChild(outline);
                container.addChild(label);

                return container;
            },

            range: function(){
                return {
                    left: this.position.x - TOWN_RADIUS / this.map_info.render_params.scale ,
                    right: this.position.x + (100 + TOWN_RADIUS )/ this.map_info.render_params.scale,
                    top: this.position.y - TOWN_RADIUS/ this.map_info.render_params.scale,
                    bottom: this.position.y + TOWN_RADIUS / this.map_info.render_params.scale
                }
            }

        });


        var town = {

            Town: Town,

            add_town_layer: function(map_info){

                map_info.town_layer = map_info.map.add_layer('towns', {

                    add_tile_shapes: function (tile) {
                        _.each(map_info.towns, function(town){
                            if (tile.contains(town.range())){
                                var shape = town.to_easel(tile.layer.scale());
                                console.log('adding tile to shapes');
                                town.shapes.push({tile: tile, shape: shape});

                                tile.container().addChild(shape);
                                var move_shape;
                                shape.on('mousedown', function(e){
                                    console.log('mousedown for town', town);
                                    console.log('shape: ', shape);


                                    _.each(town.shapes, function(data){
                                        console.log('clearing ', data);
                                        data.shape.visible = false;
                                        data.tile.container().updateCache();
                                    });

                                    map_info.stage.update();
                                    move_shape = town.to_easel(tile.layer.scale());
                                    map_info.town_move_layer.offset_layer().addChild(move_shape);
                                });

                                shape.on('pressmove', function(e){
                                    var local = map_info.town_layer.offset_layer()
                                        .globalToLocal(e.stageX, e.stageY);
                                    console.log('pressmove for ', town.name, local);
                                    move_shape.x = local.x;
                                    move_shape.y = local.y;
                                    town.position.x = local.x;
                                    town.position.y = local.y;
                                    map_info.stage.update();
                                });

                                shape.on('pressup', function(){
                                    console.log('pressup for ', town.name);
                                    map_info.town_move_layer.offset_layer().removeAllChildren();
                                    town.shapes = [];
                                    map_info.update();

                                })
                            };
                        })
                    },
                    events: {/*
                        pressmove: function(ev){
                            console.log('mouse event for town: ', ev);
                        },
                        pressup: function(e2){
                            console.log('mouse up for town:', e2)
                        }*/
                    }
                });

                map_info.town_move_layer = map_info.map.add_layer('towns_move', {});
                map_info.town_move_layer.render = function(){
                    // blocking creation of tiles
                }
            },

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