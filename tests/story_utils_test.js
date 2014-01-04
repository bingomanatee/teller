var tap = require('tap');
var path = require('path');
var Library = require('./../src/Library');
var fs = require('fs');
var sutils = require('./../src/story_utils');
var util = require('util');

tap.test('story utils', function (test) {
    
    test.test('ensure suffix', function(et){

        var start_path = '/foo/bar/name';
        var extended_path = sutils.json.ensure_suffix(start_path);
        et.equals(extended_path, '/foo/bar/name.json', 'adding json suffix');
        extended_path = sutils.json.ensure_suffix(extended_path);
        et.equals(extended_path, '/foo/bar/name.json', 'repeated json suffix doesn\'t change path');

        et.end();
    });

    test.test('remove suffix', function(rt){

        var start_path = '/foo/bar/name.json';

        var con_path = sutils.json.remove_suffix(start_path);

        rt.equals(con_path, '/foo/bar/name', 'removing json suffix');
         con_path = sutils.json.remove_suffix(con_path);
        rt.equals(con_path, '/foo/bar/name', 'repeated removing json suffix doesn\'t change path');

        rt.end();
    });

    test.end();

});