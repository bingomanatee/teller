(function(){

    var app = angular.module('teller_app');

    app.factory('make_class', function () {

        function _constructor(constructor, base){
            if (base){
                return function(){
                   var args = _.toArray(arguments);
                    base.apply(this, arguments);
                    constructor.apply(this, arguments);
                };
            } else {
                return constructor;
            }
        };

        return function(){
            var new_class;
            var constructor;
            var methods;
            var base;

            methods = _.toArray(arguments);

            if (_.isFunction(methods[0])){
                constructor = methods.shift();
            } else {
                constructor = function(params){
                    _.extend(this, params);
                }
            }

            if (_.isFunction(methods[0])){
                base = methods.shift();
            }
            new_class = _constructor(constructor, base);

            if (base){
                new_class.prototype = _.clone(base.prototype);
            }

            _.each(methods, function(m){
                _.extend(new_class.prototype, m);
            });

            return new_class;
        }

    })

})();