var _ = require('underscore');

module.exports = {

    on_input: function(ctx, done){
        var member = this.model('member');

        var story_model = this.model('teller-story');


      story_model.all(function(err, stories){
          ctx.$out.set('stories',stories);

          member.ican(ctx,['teller create story'] , function(){
              ctx.$out.set('create_story', true);
              done();
          }, function(){
              ctx.$out.set('create_story', false);
              done();
          });
      });


    }

}