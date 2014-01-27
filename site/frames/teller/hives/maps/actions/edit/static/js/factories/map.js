(function () {


    var app = angular.module('teller_app');

    app.factory('map', function (map_stage_bounds, town) {

        var canvas;
        var stage;

        var map_info = {

            init_map: function () {
                canvas = $('canvas#map')[0];
                map_info.map = new EASEL_MAP.Map({
                    left: Math.floor(map_data.size / 2),
                    right: Math.ceil(map_data.size / 2),
                    top: Math.floor(map_data.size / 2),
                    bottom: Math.ceil(map_data.size / 2)

                });

                map_info.ground_layer = map_info.map.add_layer('ground', {

                    add_tile_shapes: function (tile) {
                        var back_fill = new createjs.Shape();
                        back_fill.graphics.f(map_info.background ? map_info.background.color : 'white').r(tile.left() - 1,
                            tile.top() - 1,
                            this.tile_width / this.scale() + 1,
                            this.tile_height / this.scale() + 1
                        );
                        tile.container().addChild(back_fill);
                    }

                });

                map_info.town_layer = map_info.map.add_layer('towns', {
                    add_tile_shapes: function (tile) {
                        _.each(map_info.towns, function(town){
                            if (tile.contains(town.range())){
                                var shape = town.to_easel(tile.layer.scale());
                                tile.container().addChild(shape);
                            };
                        })
                    }
                });

                stage = map_info.map.render(map_info.render_params, null, canvas);
            },

            add_town: function(new_town){
                var  bounds = map_stage_bounds(map_info.map, stage);
                new_town.position = bounds.center;
                this.towns.push(new town.Town(new_town));
                map_info.update();
            },

            town_layer: null,

            ground_layer: null,

            update: function () {
                map_info.map.refresh();
                stage.update();
            },

            render_params: {scale: 0.25, left: 0, top: 0, heavy_freq: 6, tile_width: 100, tile_height: 100, hex_size: 50},

            towns: [],

            bg_color: 'white'

        };

        return map_info;

    });
})();