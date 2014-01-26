if (typeof module != 'undefined') {
var window = module.exports;
var _ = require('underscore');}
(function(window){
(function (window) {
    var EASEL_MAP = {
        util: {
            color: function (r, g, b) {
                if (arguments.length < 3) {
                    g = b = r;
                }
                return _.template('rgb(<%= red %>, <%= green %>, <%= blue %>)', {
                        red: r,
                        green: g,
                        blue: b}
                );
            }
        },
        _proto: {
        },
        class: {
        }
    };

    window.EASEL_MAP = EASEL_MAP;
})(window);;
(function (window) {

    window._grid_extent = function _grid_extent(unit, scale,
                          width, height,
                          left, top) {
        var scaled_width = width / scale;
        var scaled_height = height / scale;

        var leftmost_index = Math.floor(left / unit);
        var topmost_index = Math.floor(top / unit);
        var index_width = scaled_width / unit;
        var index_height = scaled_height / unit;

        return {
            left_i: leftmost_index,
            right_i: Math.ceil(leftmost_index + index_width) + 1,
            top_j: topmost_index,
            bottom_j: Math.ceil(topmost_index + index_height) + 1
        }

    }

})(window);;
(function (w) {

    var _defaults = {
        top: -3250,
        bottom: 3250,
        left: -6500,
        right: 6500
    };

    window.EASEL_MAP.Map = function (params) {
        this.init();
        _.defaults(this, _defaults);
        _.extend(this, params);

    };

    window.EASEL_MAP.Map.prototype = {

        height: function () {
            return this.bottom - this.top;
        },

        width: function () {
            return this.right - this.left;
        },

        init: function () {
            this.paths = [];
            this.regions = [];
            this.spots = [];
            this.units = 'm';
            this.layers = {};
        },

        get_layers: function (reverse) {
            var out = _.sortBy(_.values(this.layers), 'order');
            if (reverse) {
                return out.reverse();
            } else {
                return out;
            }
        },

        add_layer: function (layer, params) {
            if (_.isString(layer)) {
                if (this.layers[layer]) {
                    throw new Error('already have a layer ' + layer);
                }
                layer = this.layers[layer] = new EASEL_MAP.Layer(layer, this, params || {});
            } else if (this.layers[layer.name]) {
                throw new Error('already have a layer ', layer.name);
            } else {
                this.layers[layer.name] = layer;
            }

            return layer;

        },

        event: function (name, e) {
            var bubbles = this.get_layers(true);

            var handled = false;

            _.each(bubbles, function (layer) {
                if (!handled) {
                    handled = layer.event(name, e);
                }
            })
        }

    };

})(window);;
(function (window) {

    window.EASEL_MAP.Map.prototype.render = function (params, stage, canvas ) {

        if (!stage) {
            if (!canvas) throw new Error("must provide stage or canvas to render");
            stage = new createjs.Stage(canvas);
        }

        _.each(this.get_layers(), function (layer) {
            if (layer.pre_render){
                layer.pre_render(stage, params);
            };
        }, this);

        _.each(this.get_layers(), function(layer){
            layer.render(stage, params);
            if (layer.post_render){
                layer.post_render(stage, params);
            }
        }, this);

        _.each(this.get_layers(), function(layer){
            if (layer.post_render){
                layer.post_render(stage, params);
            }
        }, this);

        stage.update();
        return stage;
    }

})(window);;
(function (window) {

    window.EASEL_MAP.Map.prototype.refresh = function (layer_names ) {

        _.each(this.layers, function(layer){
            if (!layer_names || _.contains(layer_names, layer.name)){
                layer.refresh();
            }
        })
    }

})(window);;
(function (window) {

    // generates perlin based on overlapping scaled bitmaps

    window.EASEL_MAP.util.Perlin_Canvas = function (scale, bw, bh) {

        this.bitmap_width = bw || 200;
        this.bitmap_height = bh || 100;
        this.alpha_pow = 2;
        this.scales = scale;

        this.offsets = _.map(this.scales, function () {
            return [Math.random() * this.bitmap_width, Math.random() * this.bitmap_height];
        }, this);
    };


    window.EASEL_MAP.util.Perlin_Canvas.prototype = {

        render: function (width, height) {

            this.bitmaps = _.map(this.scales, this.render_bitmap(this.bitmap_width, this.bitmap_height), this);

            this.canvas = document.createElement('canvas');
            this.canvas.width = width;
            this.canvas.height = height;

            var r = new createjs.Shape();
            r.graphics.f('rgb(128,128,128)').dr(0,0,width, height);

            var stage = new createjs.Stage(this.canvas);
            stage.addChild(r);

            _.each(this.scales, function (scale, i) {

                var a_canvas = document.createElement('canvas');
                var a_stage = new createjs.Stage(a_canvas);
/*                a_stage.addChild(_circles_on_shape(2, width, height));
                a_stage.update(); */

                var shape = new createjs.Shape();
                shape.alpha = 1/this.alpha_pow;
                stage.addChild(shape);

                var offset = this.offsets[i];
                var matrix = new createjs.Matrix2D(scale, 0, 0, scale, 0,0, offset[0], offset[1]);
                var bitmap = this.bitmaps[i];
                console.log('bitmap: ', bitmap);
                shape.graphics.bf(bitmap, 'repeat', matrix).dr(0, 0, width, height);
            }, this);

            stage.update();

        },

        color: function(x, y){
          if (x < 0 || y < 0 || x >= this.canvas.width || y >= this.canvas.height){
              return 0;
          }
            return this.canvas.getContext('2d').getImageData(x, y, 1, 1).data[0];
        },

        render_bitmap: function (width, height) {

            return function () {
                var t = new Date();
                var canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                var ctx = canvas.getContext('2d');
                var id = ctx.getImageData(0,0,width, height);

                var value = 0;
                _.each(id.data, function(v, index){
                   switch(index % 4){
                       case 3:
                           id.data[index] = 255;
                           break;

                       case 0:
                           value = Math.random() > 0.5 ? 255 : 0;
                           id.data[index] = value;
                           break;

                       default:
                           id.data[index] = value;
                   }
                });

                ctx.putImageData(id, 0, 0);
                /*
                var stage = new createjs.Stage(canvas);
                var r = new createjs.Shape();
             //   r.graphics.f('rgb(128,128,128)').r(0, 0, width, height).ef();
              //  stage.addChild(r);

                _.each([1, 2, 3].reverse(), function (scale) {
                    var shape = _circles_on_shape(scale, width, height);
                    shape.alpha = 0.5;
                    stage.addChild(shape);
                });

                stage.update();
                stage.removeAllChildren();

                console.log('random rendered in', (new Date().getTime() - t.getTime()), 'ms');*/

                return canvas;
            }
        }

    }


})(window);;
(function (window) {

    /**
     * The layer tile is a region of the map.
     * The map is broken into smaller regions to increase the utility of caching,
     * reduce the overhead of mouse click tracking, and because Google does it.
     *
     * No matter what the map scale is tiles always take up the same amount of
     * visual space. that is, if you zoom in, a given tile will have four times
     * as much stuff on it.
     *
     * @param layer {EASEL_MAP.Layer}
     * @param i {int} the column/x index
     * @param j {int} the row/y index
     *
     * @constructor
     */
    window.EASEL_MAP.Layer_Tile = function (layer, i, j) {
        this.layer = layer;

        if (!this.layer.caches) this.layer.caches = [];

        this.i = i;
        this.j = j;
        this.loaded = false;
    }

    window.EASEL_MAP.Layer_Tile.prototype = {

        /**
         * This is the main "draw" routine of the tile.
         * It presumes the tiles have been created.
         * it calls the local add_tile_shapes to load custom content
         * then caches itself.
         *
         */
        load: function () {
            this.container().removeAllChildren();
         var scale = this.layer.scale();

            this.layer.add_tile_shapes(this);
            this.cache(scale);
            this.loaded_scale = scale;

            this.loaded = true;
        },

        refresh: function(){
            this.container().uncache();
            this.container().removeAllChildren();
        },

        move_around: function (x, y) {
            var xd, yd;
            while (xd = this._x_d(x)) {
                this.i += xd;
            }
            while (yd = this._y_d(y)) {
                this.j += yd;
            }
        },

        _x_d: function (x) {
            var left = this.left();
            var right = this.right();

            if (x < left) {
                return -1;
            } else if (x > right) {
                return 1;
            } else {
                return 0;
            }
        },

        _y_d: function (y) {
            var top = this.top();
            var bottom = this.bottom();
            if (y < top) {
                return -1;
            } else if (y > bottom) {
                return 1;
            } else {
                return 0;
            }
        },

        cache: function (scale) {
            var left = Math.floor(this.left() - 1);
            var top = Math.floor(this.top() - 1);
            var width = Math.ceil(this.layer.tile_width / scale + 2);

           // console.log('caching', left, top, width, 'at scale', scale);

            if ((this.container().cacheLayer) && this.loaded_scale == scale){
                this.container().updateCache();
            } else {
                this.container().cache(
                    left,
                    top,
                    width,
                    width,
                    scale
                );
            }
        },

        left: function () {
            return this.i * this.width();
        },

        top: function () {
            return this.j * this.height();
        },

        right: function () {
            return this.left() + this.width();
        },

        bottom: function () {
            return this.top() + this.height();
        },

        width: function () {
            return this.layer.tile_width / this.layer.scale();
        },

        height: function () {
            return this.layer.tile_height / this.layer.scale();
        },

        container: function () {
            if (!this._container) {
                this._container = new createjs.Container();
                this.layer.offset_layer().addChild(this._container);
            }
            return this._container;
        },

        contains: function (range) {
            if (this.left() >= range.right) {
                console.log('left', this.left(), '>= range.right', range.right);
                return false;
            }
            if (this.right() <= range.left) {
                console.log('right', this.right(), '<= range.left', range.left);
                return false;
            }
            if (this.top() >= range.bottom) {
                console.log('top', this.top(), '>= range.bottom', range.bottom);
                return false;
            }
            if (this.bottom() <= range.top) {
                console.log('bottom', this.bottom(), '<= range.top', range.top);
                return false;
            }
            return true;
        }

    }


})(window);;
(function (window) {

    var DEBUG_TILES = true;
    var DEFAULT_TILE_SIZE = 200;

    window.EASEL_MAP.Layer = function (name, map, params) {
        if (!_.isString(name)) {
            throw new Error('name must be string');
        }
        this.name = name;
        this.map = map;
        this.tile_width = this.tile_height = DEFAULT_TILE_SIZE;
        this.events = {};
        this.tiles = [];
        _.extend(this, params);
        this.order = map.layers.length;
        this.name = name;
    };

    window.EASEL_MAP.Layer.prototype = {

        pre_render: function (stage, params) {
            this.set_stage(stage);
            if (params.hasOwnProperty('left')) {
                this.offset_layer().x = this.left(params.left);
            }
            if (params.hasOwnProperty('top')) {
                this.offset_layer().y = this.top(params.top);
            }
            if (params.hasOwnProperty('scale')) {
                var gc = this.scale_layer();
                gc.scaleX = gc.scaleY = this.scale(params.scale);
            }
        },
        render: function (stage, params) {
            this.set_stage(stage);
            var tiles = this.retile();

            _.each(tiles, function (tile) {
              //  console.log('scale for ', tile.i, tile.j, 'is', tile.loaded_scale, 'against', this.scale());
                if (tile.loaded_scale != this.scale()) {
                    tile.load();
                } else {
               //     console.log('not redrawing ', tile.i, tile.j);
                }
            }, this);
        },

        cache: function (stage) {
          //  console.log('caching layer', this);
            if (this.container.x || this.container.y || this.container.scaleX != 1 || this.container.scaleY != 1) {
                throw new Error('cannot cache offset/scaled containers');
            }
            this.container.cache(0, 0, stage.canvas.width, stage.canvas.height);
        },

        scale_layer: function () {
            if (!this._scale_layer) {
                this._scale_layer = new createjs.Container();
                this.stage_layer().addChild(this._scale_layer);
            }
            return this._scale_layer;
        },

        offset_layer: function () {
            if (!this._offset_layer) {
                this._offset_layer = new createjs.Container();
                this.scale_layer().addChild(this._offset_layer);
                _.each(this.events, function(handler, name){
                    this._offset_layer.on(name, handler);
                }, this);
            }
            return this._offset_layer;
        },

        scale: function (s) {
            if (arguments.length > 0) {
                this._scale = s;
            }
            return this._scale;
        },

        left: function (s) {
            if (arguments.length > 0) {
                this._left = s;
            }
            return this._left;
        },

        top: function (s) {
            if (arguments.length > 0) {
                this._top = s;
            }
            return this._top;
        },

        render_sublayers: function (render_params) {
            this.scale(render_params.scale || 1);
            var gc = this.scale_layer();
            gc.scaleX = gc.scaleY = this.scale();
            var gct = this.grid_container_t;
            gct.x = render_params.left;
            gct.y = render_params.top;
        },

        set_stage: function (stage) {
            this.stage = stage;
        },

        stage_layer: function () {
            if (!this.container) {
                var stage_container = this.stage.getChildByName(this.name);
                if (!stage_container) {
                    stage_container = new createjs.Container();
                    stage_container.name = this.name;
                    this.stage.addChild(stage_container);
                }
                this.container = stage_container;
            }
            return this.container;
        },

        event: function (name, e) {
            if (this.events[name]) {
                return this.events[name](e);
            } else {
                return false;
            }
        },

        local_tl: function () {
            return this.offset_layer().globalToLocal(0, 0);
        },

        local_br: function () {
            return this.offset_layer().globalToLocal(this.stage.canvas.width, this.stage.canvas.height);
        },

        tile_range: function () {
            var tl = this.tile(0, 0);
            var ltl = this.local_tl();

            //   ltl.x = Math.max(this.map.left, ltl.x);
            //    ltl.y = Math.max(this.map.top, ltl.y);

            tl.move_around(ltl.x, ltl.y);

            var br = this.tile(tl.i, tl.j);
            var lbr = this.local_br();

            //  lbr.x = Math.min(this.map.right,lbr.x);
            //   lbr.y = Math.min(this.map.bottom, lbr.y);

            br.move_around(lbr.x, lbr.y);


            return {tl: _.pick(tl, 'i', 'j'), br: _.pick(br, 'i', 'j')};
        },

        tile: function (x, y) {
            return new EASEL_MAP.Layer_Tile(this, x, y);
        },

        add_tile_shapes: function (tile) {
            throw new Error('must be overridden by layer definition')
        },

        refresh: function () {
            _.each(this.tiles, function (tile) {
                tile.refresh();
                tile.load();
            }, this);
        },

        retile: function () {
            // return;
            var tr = this.tile_range();
       //    console.log('tile range:', JSON.stringify(tr));

            var left = tr.tl.i;
            var right = tr.br.i;
            var top = tr.tl.j;
            var bottom = tr.br.j;

            function _in_range(tile) {
                return tile.i >= left &&
                    tile.i <= right &&
                    tile.j >= top &&
                    tile.j <= bottom;
            }

            console.log('looking for old tiles in', this.tiles.length, 'old tiles');

            var old_tiles = this.tiles.filter(_in_range);
            var removed_tiles = _.reject(this.tiles, _in_range);

            _.each(removed_tiles, function (tile) {
                tile.container().removeAllChildren();
                if (tile.container().parent) {
                    tile.container().parent.removeChild(tile.container());
                }
            }, this);

            _.each(_.range(left, right + 1), function (i) {
                _.each(_.range(top, bottom + 1), function (j) {
                    var old_tile = _.find(old_tiles, function (tile) {
                        return tile.i == i && tile.j == j;
                    });
                    if (!old_tile) {
                        var tile = this.tile(i, j);

                        this.tiles.push(tile);
                        old_tiles.push(tile);
                    }
                }, this);
            }, this);

            // forgetting tiles that are out of the screen

            this.tiles = old_tiles;
            return this.tiles;
        }

    };
})(window);;
(function (window) {


    var COS_30 = Math.cos(Math.PI / 6);
    var SIN_30 = Math.sin(Math.PI / 6);
    var COS_60 = SIN_30;
    var SIN_60 = COS_30;

    var CACHED_HEXES = {};

    /**
     * this library draws hexagons with the passed in shape.
     * It also has methods for predicting the drawn hex's extent based on
     * its index and its size. It is functional to reduce the overhead of
     * large numbers of drawn hexes.
     *
     * The center is computed by its position on a "jagged grid".
     * The hexagon's points are aligned so that they start at the left
     * and right corners (3 and 9 o'clock), so it's flat on the top and bottom.
     */

    window.EASEL_MAP.util.draw_hex = {};

    var COL_UNIT_SCALE = (1 + SIN_30);
    var ROW_UNIT_SCALE = (2 * SIN_60);

    function _center_x(row, col, radius) {
        return col * radius * COL_UNIT_SCALE;
    }

    function _center_y(row, col, radius) {
        var k = row;
        if (col % 2) {
            k -= 0.5;
        }
        return k * radius * ROW_UNIT_SCALE;
    }

    window.EASEL_MAP.util.draw_hex.points = function (row, col, radius) {

        var center = window.EASEL_MAP.util.draw_hex.placement(row, col, radius, true);

        var xs = [
            center.center_x + -radius,
            center.center_x - radius * COS_60 ,
            center.center_x + radius * COS_60 ,
            center.center_x + radius
        ];

        var ys = [
            center.center_y - radius * SIN_60 ,
            center.center_y,
            center.center_y + radius * SIN_60 ];

        return [
            xs[0], ys[1],
            xs[1], ys[0],
            xs[2], ys[0],
            xs[3], ys[1],
            xs[2], ys[2],
            xs[1], ys[2]
        ];
    }

    window.EASEL_MAP.util.draw_hex.placement = function (row, col, radius, center_only) {
        var out = {
            center_x: _center_x(row, col, radius),
            center_y: _center_y(row, col, radius)
        };

        if (center_only) return out;

        out.top = out.center_y - (SIN_60 * radius);
        out.bottom = out.center_y + (SIN_60 * radius);
        out.left = out.center_x - radius;
        out.right = out.center_x + radius;
        out.width = out.right - out.left;
        out.height = out.bottom - out.top;

        return out;
    };

    var DEBUG_EXTENT = false;

    window.EASEL_MAP.util.draw_hex.hex_extent = function (left, right, top, bottom, radius) {
        // estimating top left coordinates based on derived projection of center
        var left_col = Math.floor(left / (radius * COL_UNIT_SCALE));
        var top_row = Math.floor(top / (radius * ROW_UNIT_SCALE));
        var bottom_row = 0;
        var right_col = 0;
        var failsafe = 30;

        var top_left_placement = window.EASEL_MAP.util.draw_hex.placement(top_row, left_col, radius);
        // ensuring that top_left_placement starts inside target area


        while (failsafe-- > 0 && top_left_placement.bottom < top) {
            if (DEBUG_EXTENT) console.log('moving down tlp.bottom: %s, top: %s, r: %s, c: %s', top_left_placement.bottom, top, top_row, left_col);
            top_left_placement = window.EASEL_MAP.util.draw_hex.placement(++top_row, left_col, radius);
        }
        while (failsafe-- > 0 && top_left_placement.right < left) {
            if (DEBUG_EXTENT)  console.log('moving right tlp.bottom: %s, top: %s, r: %s, c: %s', top_left_placement.bottom, top, top_row, left_col);
            top_left_placement = window.EASEL_MAP.util.draw_hex.placement(top_row, ++left_col, radius);
        }

        // moving the top_left_placement out of range
        while (failsafe-- > 0 && top_left_placement.bottom > top) {
            if (DEBUG_EXTENT) console.log('moving left tlp.bottom: %s, top: %s, r: %s, c: %s', top_left_placement.bottom, top, top_row, left_col);
            top_left_placement = window.EASEL_MAP.util.draw_hex.placement(--top_row, left_col, radius);
        }
        while (failsafe-- > 0 && top_left_placement.right > left) {
            if (DEBUG_EXTENT)  console.log('moving up tlp.bottom: %s, top: %s, r: %s, c: %s', top_left_placement.bottom, top, top_row, left_col);
            top_left_placement = window.EASEL_MAP.util.draw_hex.placement(top_row, --left_col, radius);
        }

        right_col = Math.floor(right / (radius * COL_UNIT_SCALE));
        bottom_row = Math.floor(bottom / (radius * ROW_UNIT_SCALE));

        var bottom_right_placement = window.EASEL_MAP.util.draw_hex.placement(bottom_row, right_col, radius);
        // ensuring that bottom_right_placement starts inside target area
        while (failsafe-- > 0 && bottom_right_placement.top > bottom) {
            if (DEBUG_EXTENT)   console.log('brp.bottom: %s, top: %s, r: %s, c: %s', bottom_right_placement.bottom, top, bottom_row, right_col);
            bottom_right_placement = window.EASEL_MAP.util.draw_hex.placement(--bottom_row, right_col, radius);
        }
        while (failsafe-- > 0 && bottom_right_placement.left > right) {
            if (DEBUG_EXTENT)  console.log('brp.bottom: %s, top: %s, r: %s, c: %s', bottom_right_placement.bottom, top, bottom_row, right_col);
            bottom_right_placement = window.EASEL_MAP.util.draw_hex.placement(bottom_row, --right_col, radius);
        }

        while (failsafe-- > 0 && bottom_right_placement.top < bottom) {
            if (DEBUG_EXTENT)    console.log('brp.bottom: %s, top: %s, r: %s, c: %s', bottom_right_placement.bottom, top, bottom_row, right_col);
            bottom_right_placement = window.EASEL_MAP.util.draw_hex.placement(++bottom_row, right_col, radius);
        }
        while (failsafe-- > 0 && bottom_right_placement.left < right) {
            if (DEBUG_EXTENT)   console.log('brp.bottom: %s, top: %s, r: %s, c: %s', bottom_right_placement.bottom, top, bottom_row, right_col);
            bottom_right_placement = window.EASEL_MAP.util.draw_hex.placement(bottom_row, ++right_col, radius);
        }


        return {
            top: top_row,
            left: left_col,
            bottom: bottom_row,
            right: right_col,
            top_left_extent: top_left_placement,
            bottom_right_extent: bottom_right_placement
        };

    };

    window.EASEL_MAP.util.draw_hex.draw = function (row, col, radius, color, shape) {
        if (!shape) shape = new createjs.Shape();
        shape.graphics.f(color);
        var points = window.EASEL_MAP.util.draw_hex.points(row, col, radius);

        shape.graphics.mt(points[0], points[1]);
        var os = 2;
        while (os < points.length) {
            shape.graphics.lt(points[os], points[os + 1]);
            os += 2;
        }
        shape.graphics.lt(points[0], points[1]);
        shape.graphics.ef();
        return shape;
    };

    window.EASEL_MAP.util.make_hex_cache = function (color, radius) {
        var extent = window.EASEL_MAP.util.draw_hex.placement(0, 0, radius);
        var canvas = document.createElement('canvas');
        canvas.width = Math.ceil(extent.width + 2);
        canvas.height = Math.ceil(extent.height + 2);

        var stage = new createjs.Stage(canvas);

        var hex_shape = window.EASEL_MAP.util.draw_hex.draw(0, 0, radius, color);
        hex_shape.x = canvas.width/2;
        hex_shape.y = canvas.height/2;

        stage.addChild(hex_shape);
        stage.update();

        return {
            radius: radius,
            color: color,
            canvas: canvas,
            extent: extent
        };
    };

})(window);;
(function (window) {

    function _render(params) {

        return function (stage, render_params) {
            var gp = this.grid_params;
            var scale = render_params.scale || 1;

            var gridline_shape = new createjs.Shape();
            gridline_shape.graphics.s(gp.line_color).ss(1 / scale);
            var axis_shape = new createjs.Shape();
            axis_shape.graphics.s(gp.axis_line_color).ss(2 / scale);

            if (render_params.heavy_freq){
                var gridline_h_shape = new createjs.Shape();
                gridline_h_shape.graphics.s(gp.heavy_line_color).ss(1 / scale);

                this.container.addChild(gridline_h_shape);
            }

            var grid_extent = EASEL_MAP.util.grid_extent(
                gp.unit, scale,
                stage.canvas.width, stage.canvas.height,
                render_params.left,
                render_params.top
            );

            var top = grid_extent.top_j * gp.unit;
            var bottom = grid_extent.bottom_j * gp.unit;
            var left = grid_extent.left_i * gp.unit;
            var right = grid_extent.right_i * gp.unit;

            console.log('render_params:', render_params, 'grid params: ', gp, ', grid extent:', grid_extent);

            for (var i = grid_extent.left_i; i <= grid_extent.right_i; ++i) {

                var x = i * gp.unit;
                console.log('drawing gridline at ', x);

                (i == 0 ? axis_shape : (
                    render_params.heavy_freq && (!(i % render_params.heavy_freq)) ?  gridline_h_shape: gridline_shape
                    )).graphics.mt(x, top).lt(x, bottom);
            }
            for (var j = grid_extent.top_j  ; j <= grid_extent.bottom_j; ++j) {

                var y = j * gp.unit;
                console.log('drawing gridline at y ', y);

                (j == 0 ? axis_shape : (
                    render_params.heavy_freq && (!(j % render_params.heavy_freq)) ?  gridline_h_shape: gridline_shape
                    )).graphics.mt(left, y).lt(right, y);
            }


            this.container.addChild(gridline_shape);
            this.container.addChild(axis_shape);
            this.container.x = -render_params.left * scale;
            this.container.y = -render_params.top * scale;

            this.container.scaleX = this.container.scaleY = scale;
        }
    }

    var _default_grid_params = {
        unit: 50,
        line_color: 'rgb(51,153,255)',
        axis_line_color: 'rgb(255,51,204)',
        heavy_line_color:'rgb(0,0,102)'
    };

    window.EASEL_MAP.grid_layer = function (name, map, params) {
        if (!params){
            params = {grid_params: {}};
        } else if (!params.grid_params){
            params.grid_params = {};
        }

        _.defaults(params.grid_params, _default_grid_params);

        var grid_layer = new EASEL_MAP.Layer(name, map, params);

        grid_layer.render = _render(params);

        map.add_layer(grid_layer);

        return grid_layer

    };


})(window)
})(window)