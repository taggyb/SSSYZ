CactusJs
=====

CactusJS is a lightweight javascript framework that provides communication with a Server using server APIs over a RESTful JSON interface.

It is similar in structure to Backbone.Js and users of that framework should have no problem using CactusJs.

Dependencies
=====
jquery, underscore.js


Steps
=====
Put CactusJs and its dependencies in the scripts folder.

Structure
===== 
CactusJs follows a MVC structure and has the following components:

- Model
- Collection
- View
- Router
- Event

Examples
=====
## Creating a Model
```javascript
Cactus2.Models.Review=Cactus.Model.extend({
	defaults:{
		comment: null,
		id: null,
		movie_id: null,
		score: null,
		updated_at: null,
		user: {
			id: null,
			username: null
		}
	}
})
```

## Creating events
```javascript
   events: {
                "click .main"           : "backToIndex",
                "click #update_movie"   : "updateMovie",
                "click #delete_movie"   : "deleteMovie",
                "click #submit_review"  : "submitReview",
                "click #delete_review"  : "deleteReview"
        },
```

## Creating a View
```javascript
Cactus2.Views.SingleMovie = Cactus.View.extend({
        template: JST['movies/singlemovie'],

        initialize: function(options) {
                this.model = options.model;

                this.model.on('change', this.render, this);
                this.model.fetch();
                this.mid = options.mid;
                this.router = options.router

                this.reviews = new Cactus2.Collections.Reviews([],{id:this.mid});
                this.reviews.on('reset change', this.render, this);
                this.reviews.fetch({reset:true});
        },
```

## Creating a Router
``` javascript
Cactus2.Routers.Index=Cactus.Router.extend({
        routes: {
                ''                      : 'index',
                'movies'                : 'index',
                'new'                   : 'newMovie',
                ':page'                 : 'index',
                'movies/:id'            : 'displaySingleMovie',
                'movies/:id/edit'       : 'editSingleMovie'
        },
```