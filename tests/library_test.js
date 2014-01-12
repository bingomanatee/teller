var tap = require('tap');
var path = require('path');
var Library = require('./../src/Library');
var fs = require('fs');
var library_root = path.resolve(__dirname, '../test_data/library');
var util = require('util');
var _ = require('underscore');

tap.test('library', function (test) {

    var library = new Library({file_path: library_root});

    // loading an existing story from definition

    test.test('creation', {skip: false}, function (create_test) {
        library.models.stories.get_story('alpha', function (err, story) {
            create_test.ok(story, 'story returned');
            create_test.equal(story.title, 'The First Story', 'got story data');
            create_test.equal(story.name, 'alpha', 'story has name');

            // putting new chapter
            story.put_chapter('day_one', {title: 'Once Upon a Time', content: 'Once upon a time there was a frog'},
                function (err, chapter) {
                    create_test.equals(chapter.title, 'Once Upon a Time', 'chapter created');

                    story.put_chapter('day_two', {title: 'The next chapter', summary: 'frog\'s trip', content: 'the frog took a trip'},

                        function (err, chapter2) {

                            create_test.equals(chapter2.title, 'The next chapter', 'chapter two created');
                            create_test.equals(chapter2.summary, "frog's trip", 'chapter two summary');

                            // (story, from_ch, to_ch, name, link_type, data, callback){
                            library.link_chapters(story, chapter, chapter2, '1_to_2', 'continue', {}, function (err, link) {

                                story.put_chapter('day_3_choice_A', {title: 'day 3 A', summary: 'Choice A', content: 'Day three choice a'}, function (err, d3ca) {

                                    story.put_chapter('day_3_choice_B', {title: 'day 3 B', summary: 'Choice B', content: 'Day three choice a'}, function (err, d3cb) {

                                        library.link_chapters(story, chapter2, d3ca, '', 'choice', {}, function (err, day_a_link) {
                                            create_test.equals(day_a_link.name, '1', 'link 1 name');

                                            library.link_chapters(story, chapter2, d3cb, '', 'choice', {}, function (err, day_b_link) {
                                                create_test.equals(day_b_link.name, '2', 'link 2 name');

                                                // removing new chapter files to reset state

                                                d3ca.destroy();
                                                d3cb.destroy();
                                                day_a_link.destroy();
                                                day_b_link.destroy();
                                                chapter.destroy();
                                                chapter2.destroy();
                                                link.destroy();
                                                create_test.end();
                                            });
                                        });
                                    });
                                });

                            });

                        });

                });

        });
    });

    test.test('reading', function(read_test){

       library.models.stories.get_story('beta', function(err, story){

           story.thread(function(err, thread){
               var names = _.pluck(thread, 'name');
               read_test.deepEqual(names, ['a', 'b', 'c'], 'threaded names');
               read_test.end();
           });

       })

    });

});