var _ = require('underscore');

module.exports = {

    on_input: function(ctx, done){

        var library = this.model('teller_library');

      library.models.stories.stories(function(err, stories){
          ctx.$out.set('stories', _.values(stories));

          done();
      });


    }

}