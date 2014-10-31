(function(Simple, Mustache) {
 
  window.Planner = window.Planner || {};

  Planner.Recipe = Simple.Model.extend({
    dataType: "json",
    initialize: function() {
        this.url = "/recipe";
    }
  });

 Planner.Recipes = Simple.Model.extend({
    dataType: "json",
    initialize: function() {
        this.url = "/recipes"; 
    }
  });


  Planner.Recipe.RecipeView = Simple.View.extend({
    template:'<div class="panel panel-default">' +
                '<div class="panel-heading"><h3 class="panel-title">{{name}}</h3></div>' + 
                '<div class="panel-body">' +
                '<div class="ingredients"><h5>Ingredienser</h5>{{{ingredients}}}</div><br />' +
                '<div class="recipe"><h5>Oppskrift</h5>{{recipe}}</div>' +
                '</div>' + 
              '</div>',
    initialize: function(options) {
      this.recipe = options.recipe;
      this.recipe.on("fetch:finished", this.render, this);
      this.el = options.el;
    },
    render: function() {
      var recipeAttrs = this.recipe.attrs();
      recipeAttrs.ingredients = recipeAttrs.ingredients.replace(/\|/g,'<br />');
      var html = Mustache.to_html(this.template, recipeAttrs);
      this.el.html(html);
    }
  }); 
})(Simple, Mustache);