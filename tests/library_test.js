var tap = require('tap');
var path = require('path');
var Library = require('./../src/Library');
var fs = require('fs');
var library_root = path.resolve(__dirname, '../test_data/library');
var util = require('util');

tap.test('library', function (test) {

    var library = new Library({file_path: library_root});

    // loading an existing story from definition

    library.models.stories.get_story('alpha', function (err, s) {
        test.ok(s, 'story returned');
        test.equal(s.title, 'The First Story', 'got story data');
        test.equal(s.name, 'alpha', 'story has name');

        // putting new chapter
        s.put_chapter('day_one', {title: 'Once Upon a Time', content: 'Once upon a time there was a frog'},
            function (err, chapter) {
                test.equals(chapter.title, 'Once Upon a Time', 'chapter created');

                // removing new chapter files to reset state
                chapter.destroy();
                test.end();
            });

    });

});