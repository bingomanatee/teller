var tap = require('tap');
var path = require('path');
var Library = require('./../src/Library');
var fs = require('fs');
var library_root = path.resolve(__dirname, '../test_data/library');
var util = require('util');

tap.test('library', function (test) {

    var library = new Library({file_path: library_root});

    // loading an existing story from definition

    library.models.stories.get_story('alpha', function (err, story) {
        test.ok(story, 'story returned');
        test.equal(story.title, 'The First Story', 'got story data');
        test.equal(story.name, 'alpha', 'story has name');

        // putting new chapter
        story.put_chapter('day_one', {title: 'Once Upon a Time', content: 'Once upon a time there was a frog'},
            function (err, chapter) {
                test.equals(chapter.title, 'Once Upon a Time', 'chapter created');

                story.put_chapter('day_two', {title: 'The next chapter', content: 'the frog took a trip'},

                function(err, chapter2){

                    test.equals(chapter2.title, 'The next chapter', 'chapter two created');

                  // (story, from_ch, to_ch, name, link_type, data, callback){
                    library.link_chapters(story, chapter, chapter2, '1_to_2', 'continue', {}, function(err, link){

                        // removing new chapter files to reset state
                        chapter.destroy();
                        chapter2.destroy();
                        link.destroy();
                        test.end();
                    });


                });

            });

    });

});