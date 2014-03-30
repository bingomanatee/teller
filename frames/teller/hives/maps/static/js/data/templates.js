(function () {

    var app = angular.module('teller_app');

    app.factory('templates', function () {

        var km = 1000;

        return [
            {name: "empty", title: "Empty"},
            {name: "building", title: "Building"},
            {name: "town", title: "Town"},
            {name: "country", title: "Country"}
        ];

    });
})();