(function () {


    var app = angular.module('teller_app');

    app.factory('map', function (map_stage_bounds, appearance, town, road) {

        var canvas;

        var map_info = {

            MODE_DRAW_ROAD: 1,

            MODE_MOVE: 0,

            mode: 0,

            stage: null,

            search_text: '',

            set_search_text: function(value){
                this.search_text = value || '';
                this.update();
            },

            init_map: function () {
                canvas = $('canvas#map')[0];
                map_info.map = new EASEL_MAP.Map({
                    left: Math.floor(map_data.size / 2),
                    right: Math.ceil(map_data.size / 2),
                    top: Math.floor(map_data.size / 2),
                    bottom: Math.ceil(map_data.size / 2)

                });

                var start_point;
                var start_offset;

                appearance.add_ground_layer(map_info);
                road.add_road_layer(map_info);
                town.add_town_layer(map_info);
                road.add_road_draw_layer(map_info);

                map_info.stage = map_info.map.render(map_info.render_params, null, canvas);
            },

            add_town: function (new_town) {
                new_town.map_info = map_info;
                var bounds = map_stage_bounds(map_info.map, map_info.stage);
                new_town.position = bounds.center;
                this.towns.push(new town.Town(new_town));
                map_info.update();
            },

            add_road: function (new_road, $scope) {
                new_road.map_info = map_info;
                map_info.mode = map_info.MODE_DRAW_ROAD;
                new_road.scope = $scope;
                var bounds = map_stage_bounds(map_info.map, map_info.stage);

                var road_obj = new road.Road(new_road);
                map_info.roads.push(road_obj);
                road_obj.edit_road();
                road_obj.add_point(bounds.center);
                return road_obj;
            },

            town_layer: null,

            ground_layer: null,

            update: function () {
                map_info.map.refresh();
                map_info.map.render(map_info.render_params, map_info.stage);
            },

            set_scale: function (n) {
                map_info.render_params.scale = n;
                map_info.update();
            },

            render_params: {scale: 0.25, left: 0, top: 0, heavy_freq: 6, tile_width: 100, tile_height: 100, hex_size: 50},

            towns: [],

            roads: [],

            bg_color: 'white'

        };

        return map_info;

    });
})();