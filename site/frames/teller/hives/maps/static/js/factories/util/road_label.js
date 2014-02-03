(function () {

    var app = angular.module('teller_app');

    app.factory('road_label', function (map_stage_bounds) {

        return function (road, scale) {

            var bounds = map_stage_bounds(road.map_info.map, road.map_info.stage);

            function _distance(point_data) {
                if (point_data.p) {
                    point_data = point_data.p;
                }
                var xd = point_data.x - bounds.center.x;
                var yd = point_data.y - bounds.center.y;
                return xd * xd + yd * yd;
            }

            function nr(out, point, i) {
                if (!out || _distance(point) < _distance(out)) {
                    return {p: point, i: i};
                } else {
                    return out;
                }
            }

            var nearest_point_to_center = _.reduce(road.points, nr, null);

            var neighbors = _.compact([
                road.points[nearest_point_to_center.i + 1],
                road.points[nearest_point_to_center.i - 1]
            ]);

            var nearest_neighbor = _.reduce(neighbors, nr, null);
            if (nearest_neighbor) {
                var dx = nearest_point_to_center.p.x - nearest_neighbor.p.x;
                var dy = nearest_point_to_center.p.y - nearest_neighbor.p.y;
                var angle = Math.atan2(dx, dy) * -180 / Math.PI + 90;
                while (angle < 0) {
                    angle += 180;
                }
                while (angle > 90) {
                    angle -= 180;
                }
            } else {
                angle = 0;
            }

            var text = new createjs.Text(road.name, (14 / scale) + 'px Arial', 'black');
            var text_container = new createjs.Container();
            text.x = nearest_point_to_center.p.x;
            text.y = nearest_point_to_center.p.y;
            text.rotation = Math.round(angle);

            return text;
        }
    });
})();