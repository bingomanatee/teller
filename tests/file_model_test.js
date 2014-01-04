var tap = require('tap');
var path = require('path');
var File_Model = require('./../src/File_Model');
var fs = require('fs');
var test_data_root = path.resolve(__dirname, '../test_data');

tap.test('put data', function(test){

    var foo_data = new File_Model({file_path: path.resolve(test_data_root, 'put_data_test_data')}, 'foos');

    var seed_bar_data = {id: 'bar', notes: 'i am bar'};

    foo_data.put('bar', seed_bar_data, function(err){
       test.ok(!err, 'no error when putting bar');

        foo_data.get('bar', function(err, bar_data){
            test.deepEqual(bar_data, seed_bar_data, 'bar data found');

            var bar_path = foo_data.full_path('bar.json');
            console.log('cleaning up path %s', bar_path);

            fs.unlink(bar_path, function(){
                test.end();
            })
        });

    });

});