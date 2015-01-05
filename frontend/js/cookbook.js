(function(Simple, Mustache) {
 
  window.Planner = window.Planner || {};

  Planner.startCookbook = function() {
    var recipes = new Planner.AllRecipes();

    var el = $("#createNewRecipe");
    var view = new Planner.Recipe.RecipeView({el: el, recipes: recipes, editMode: true});
    
    var el = $("#recipes");
    var view = new Planner.Recipe.AllRecipesView({el: el, recipes: recipes});

    recipes.fetch(); 
  }

  Planner.Recipe = Simple.Model.extend({
    dataType: "json",
    initialize: function() {
        this.url = "/recipe";
    }
  });

  Planner.AllRecipes = Simple.Model.extend({
    dataType: "json",
    initialize: function() {
        this.url = "/allRecipesDb"; 
    }
  }); 

  Planner.Recipe.RecipeView = Simple.View.extend({
    template:'<div class="panel panel-default">' +
          '<div class="panel-heading" style="position:relative"><h4 class="panel-title">{{name}}</h4></div>' +
          '<div class="panel-body">' +
            '<form role="form">' +
                '<div class="form-group">' +
                  '<label for="name">Oppskriftens navn</label>' +
                  '<input type="text" class="form-control" id="name" name="name" value="{{name}}">' +
                '</div>' +
                '<div class="form-group">' +
                  '<label for="category">Kategori</label>' +
                  '<select class="form-control" id="category" name="category">' +
                    '<option>{{category}}</option>' +
                    '<option>Fisk</option>' +
                    '<option>Rødt kjøtt</option>' +
                    '<option>Hvitt kjøtt</option>' +
                    '<option>Vegetar</option>' +
                  '</select>' +
                '</div>' +
                '<div class="form-group">' +
                  '<label for="description">Merkelapper</label>' +
                  '<input type="text" class="form-control" id="tags" name="tags" data-role="tagsinput" value="{{tags}}">' +
                '</div>' +
                '<div class="form-group">' +
                  '<label for="description">Antall posjoner</label>' +
                  '<input type="number" class="form-control" id="servings" name="servings" value="{{servings}}">' +
                '</div>' +
                '<div class="form-group">' +
                     '<label for="ingredients">Ingredienser</label>' +
                     '<div class="ingredients-list"></div>'+
                     '<div class="form-group">'+
                       '{{#ingredients}}' +
                         '<div class="form-inline ingredients">' +
                           '<div class="form-group"><input type="number" step="any" min="0" class="form-control amount" name="ingredients-amount" value="{{amount}}"></div>' +
                           '<div class="form-group">' +
                             '<select class="form-control unit" name="ingredients-unit">' +
                               '<option>{{unit}}</option>' +
                               '<option>g</option>' +
                               '<option>dl</option>' +
                               '<option>ss</option>' +
                               '<option>ts</option>' +
                               '<option>stk</option>' +
                             '</select>' +
                           '</div>' +
                           '<div class="form-group"><input type="text" class="form-control name" name="ingredients-name" value="{{name}}"></div>' +
                         '</div>' +
                       '{{/ingredients}}' + 
                       '<input id="add-row" type="button" value="Legg til ingrediens" class="btn btn-default"/>' +
                     '</div>' +
                     '<div class="form-group">' +
                       '<label for="description">Fremgangsmåte</label>' +
                       '<textarea rows="8" class="form-control" id="description" name="description">{{description}}</textarea>' +
                     '</div>' +
                     '<button type="submit" class="btn btn-default">Send inn</button>' +
                '</div>' +
            '</form>' +
          '</div>' +
        '</div>',
    templateIngredients: '<div class="form-inline ingredients">' +
          '<div class="form-group"><input type="number" step="any" min="0" class="form-control amount" name="ingredients-amount" placeholder="Mengde"></div>' +
          '<div class="form-group">' +
            '<select class="form-control unit" name="ingredients-unit">' +
              '<option>g</option>' +
              '<option>dl</option>' +
              '<option>ss</option>' +
              '<option>ts</option>' +
              '<option>stk</option>' +
            '</select>' +
          '</div>' +
          '<div class="form-group"><input type="text" class="form-control name" name="ingredients-name" placeholder="ingrediens"></div>' +
        '</div>',
    templateShow: '<div class="panel panel-default">' +
        '<div class="panel-heading" style="position:relative"><h4 class="panel-title">{{name}}</h4>' +
          '<button type="button" class="btn btn-xs btn-primary edit" style="position:absolute;right:10px;top:10px">Endre</button>' +
          '<button type="button" class="btn btn-xs btn-danger delete" style="position:absolute;right:60px;top:10px;padding:0px 2px;font-size:75%;">Slett</button></div>' + 
      '<div class="panel-body">' +
      '<div><span class="label label-success">{{category}}</span><span class="label label-info">Porsjoner: {{servings}}</span></div>' +
      '<div>Ingredienser:' +
      '<ul>' +
      '{{#ingredients}}<li>{{amount}}{{unit}} {{name}}</li>{{/ingredients}}</ul></div>' +
      '<div class="recipe-description">Beskrivelse: {{description}}</div></div>' +
      '</div>',
    initialize: function(options) {
      this.el = options.el;
      this.recipe = options.recipe;
      this.recipes = options.recipes;
      this.editMode = options.editMode;
      if (this.recipe != undefined && this.recipe.on != undefined) this.recipe.on("fetch:finished", this.render, this);
      this.render();
    },
    render: function() {
      if (this.recipe != undefined) {
        if (this.recipe.attrs != undefined) {
            var recipeAttrs = this.recipe.attrs();
        } else {
            var recipeAttrs = this.recipe;
        }
      } else {
        var recipeAttrs = {name: "Lag ny oppskrift"}
      }
      
      if (this.editMode) {
        var html = Mustache.to_html(this.template, recipeAttrs);
      } else {
        var html = Mustache.to_html(this.templateShow, recipeAttrs);
      }
      
      this.el.html(html);
      this.setupListeners();
    },
    setupListeners: function(){
      var that = this;
      that.el.find("form").off("submit");
      that.el.find("form").on("submit", function(event) {
        event.preventDefault();
        var formData = {};
        formData.name = $(this).find("input#name").val();
        formData.description = $(this).find("textarea#description").val();
        formData.category = $(this).find("select#category").val();
        formData.tags = $(this).find("#tags").val();
        formData.servings = $(this).find("#servings").val();
        formData.ingredients = [];
        var ingredients = $(this).find(".form-inline.ingredients");
        ingredients.each(function(ingredient) {
          var amount = $(ingredients[ingredient]).find(".amount").val();
          var unit = $(ingredients[ingredient]).find(".unit").val();
          var name = $(ingredients[ingredient]).find(".name").val();
          formData.ingredients.push({"amount": amount, "unit": unit, "name": name});
        });
        
        $.post( 
           "/createRecipe",
           JSON.stringify(formData),
           function(data) {
              console.log("ja");
              that.editMode = false;
              that.render();
              var form = that.el.find("form")[0];
              if (form) form.reset();
              if (that.recipes != undefined) that.recipes.fetch();
              if (that.recipe != undefined && that.recipe.fetch != undefined) that.recipe.fetch();
            }
        ); 
      });
      that.el.off("mouseup", "input#add-row");
      that.el.on("mouseup", "input#add-row", function(event) {
        that.el.find(".ingredients-list").append(that.templateIngredients);
      });
      that.el.off("mouseup", "button.edit");
      that.el.on("mouseup", "button.edit", function(event) {
        that.editMode = true;
        that.render();
      });
      that.el.off("mouseup", "button.delete");
      that.el.on("mouseup", "button.delete", function(event) {
        var result = confirm("Vil du virkelig slette " + that.recipe.name + "?");
        if (result == true) {
            var formData = {};
            formData.name = that.recipe.name;
            $.post( 
               "/deleteRecipe",
               JSON.stringify(formData),
               function(data) {
                  if (that.recipes != undefined) that.recipes.fetch();
                }
            );
        }
      });
    }
  });

  Planner.Recipe.AllRecipesView = Planner.Recipe.RecipeView.extend({
    initialize: function(options) {
      this.recipes = options.recipes;
      this.el = options.el;
      this.recipes.on("fetch:finished", this.render, this); 
    },
    render: function() {
      var attrs = this.recipes.attrs();
      for (var i in attrs.recipes) {
        var recipe = attrs.recipes[i];
        var element = $("<div></div>");
        this.el.append(element);
        var recipeView = new Planner.Recipe.RecipeView({recipe: recipe, el: element, editMode: false});
      }
    }
  });
  
})(Simple, Mustache);