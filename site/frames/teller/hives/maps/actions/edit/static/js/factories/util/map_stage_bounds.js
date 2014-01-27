(function () {
    var app = angular.module('teller_app');

    app.factory('map_stage_bounds', function () {
        return function (map, stage) {
            if (!stage) stage = map.stage;
            if (!stage) {
                return null;
            }
            var bx = stage.canvas.width;
            var by = stage.canvas.height;

            return {
                top_left: map.layers.ground.offset_layer().globalToLocal(0, 0),
                center: map.layers.ground.offset_layer().globalToLocal(bx / 2, by / 2),
                bottom_right: map.layers.ground.offset_layer().globalToLocal(bx, by)
            };
        }
    });
})();