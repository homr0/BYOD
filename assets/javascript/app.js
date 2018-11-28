jQuery(document).ready(function () {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyBRwZRG6eCVCYqeoVCSLcopNEFiDKIrips",
        authDomain: "bring-your-own-diet.firebaseapp.com",
        databaseURL: "https://bring-your-own-diet.firebaseio.com",
        projectId: "bring-your-own-diet",
        storageBucket: "bring-your-own-diet.appspot.com",
        messagingSenderId: "50377680750"
    };
    firebase.initializeApp(config);

    // Sets up global variables.
    // Assigns reference to the database.
    var database = firebase.database();
    
    // Regions with states and colors.
    var regions = {
        "New England": {
            states: [
                "CT", "ME", "MA", "NH", "RI", "VT"
            ],
            color: "#00ff00"
        },

        "Mid-Atlantic": {
            states: [
                "NJ", "NY", "PA", "DE", "DC", "MD"
            ],
            color: "#00ff00"
        },

        "Great Lakes": {
            states: [
                "IL", "IN", "MI",  "OH", "WI"
            ],
            color: "#00ff00"
        },

        "Midwest": {
            states: [
                "IA", "KS", "ND", "SD", "MO", "NE","TX","LA","OK","AR","MN"
            ],
            color: "#ff0000"
        },

        "South": {
            states: [
                "FL", "GA", "NC", "SC", "VA", "WV", "AL", "KY", "MS", "TN", 
            ],
            color: "#00ff00"
        },

        "Mountain": {
            states: [
                "AZ", "CO", "ID", "MT", "NM", "UT", "WY"
            ],
            color: "#0000ff"
        },

        "Pacific": {
            states: [
                "AK", "CA", "HI", "OR", "WA","NV"
            ],
            color: "#FFFF00"
        }
    };

    // Favorite recipes and places.
    var uname = "";
    var uid = "";
    var favPlaces = {};
    var favRecipes = {};

    // Sets up region colors.
    var regionColors = {};
    $.each(regions, function(key, region) {
        $(region.states).each(function(index, state) {
            regionColors[state.toLowerCase()] = region.color;
        });
    });

    // Initialize the FirebaseUI Widget using Firebase.
    var ui = new firebaseui.auth.AuthUI(firebase.auth());

    // Handles user authentication
    var uiConfig = {
        callbacks: {
            signInSuccessWithAuthResult: function(authResult, redirectURL) {
                // User successfully signed in.
                $("#firebaseui-auth-container").modal('hide');
                return false;
            },

            uiShown: function() {
                // The widget is rendered.
                $("#firebaseui-auth-container").modal('show');
            }
        },
        signInFlow: 'default',
        // signInSuccessUrl: 'index.html',
        signInOptions: [
            // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            firebase.auth.EmailAuthProvider.PROVIDER_ID
        ]
    };

    // Watches for user status.
    firebase.auth().onAuthStateChanged(function(user) {
        if(user) {
            // User is signed in.
            $("#firebaseui-auth-container").modal('hide');

            uname = user.displayName;
            uid = user.uid;

            // Checks if the user has an account.
            database.ref("users").once("value").then(function(user) {
                // If the user doesn't exist, then add them to the database.
                if(!(user.child(uid).exists())) {
                    database.ref("users").child(uid).set({
                        name: uname
                    });
                } else {
                    // Sets up the favorite recipes and favorite places objects.
                    database.ref("users/" + uid + "/favorites")
                }
            });

            // Show the favorites page.
            if ($("#favorites-page").length) {
                $("#favorites-page").removeClass("d-none");

                // Renders the favorites page
                renderFavorites();
            }
            
        } else {
            // User is signed out.
            // Hides and cleans the favorites page.
            $("#favorites-page").addClass("d-none");
            $("#favorite-recipes, #favorite-places").empty();
            favRecipes = {};
            favPlaces = {};
    
            // The start method will wait until the DOM is loaded.
            ui.start("#firebaseui-auth-container", uiConfig);
        }
    });

    // Renders favorite recipes and places.
    function renderFavorites() {
        $("#favorite-recipes, #favorite-places").empty();
        
        database.ref("users/" + uid + "/favorites").once("value").then(function(fave) {
            $.each(fave.val(), function(key, info) {
                // Adds recipe to the favorites area.
                if(info.type == "recipe") {
                    favRecipes[key] = info;

                    var recipeImage = $("<img>").attr({
                        "alt": info.name,
                        "src": info.image
                    });

                    var recipe = $("<button>").addClass("col-3 recipeImg").attr({
                        "data-dish": info.name,
                        "data-url": info.url
                    });

                    $(recipe).append(recipeImage);
                    $("#favorite-recipes").append(recipe);
                } else if(info.type == "restaurant") {
                    // Adds place to favorites list.
                    favPlaces[key] = info;

                    var place = $("<a>").text(info.name).attr("href", info.url);
                    place = $("<li>").append(place);
                    $("#favorite-places").append(place);
                }
            });

            $("#favorites-none, #places-none").show();
            if(Object.keys(favRecipes).length) {
                $("#favorites-none").hide();
            }

            if(Object.keys(favPlaces).length) {
                $("#places-none").hide();
            }
        });
    }

    // jQuery Vector Map

    var queryURL;
    var img;
    var label;
    var orgURL;

    jQuery('#vmap').vectorMap({
        map: 'usa_en',
        backgroundColor: null,
        color: '#ffffff',
        enableZoom: true,
        showTooltip: true,
        selectedColor: null,
        hoverColor: null,
        colors: regionColors,
        onRegionClick: function (event, code, region) {
            event.preventDefault();

            //Build API Call URL
            queryURL = "https://api.edamam.com/search?q=" + region + "&app_id=c16ec41a&app_key=8a6a3fa7dcc42aa6406a3ea1f8367e34&from=0&to=10";

            //Change the Title of Modal to the Name of State Clicked On & Empty Modal Body
            $("#modalTitle").text(region);
            $("#modalBody").empty();

            //Call API
            $.ajax({
                url: queryURL,
                method: "GET"
            }).then(function (response) {

                for (var i = 0; i < response.hits.length; i++) {
                    label = response.hits[i].recipe.label;
                    img = response.hits[i].recipe.image;
                    orgURL = response.hits[i].recipe.url;

                    var recipeImg = $("<img>").attr({
                        "alt": label,
                        "src": img
                    });

                    var recipeButton = $("<button>").addClass("recipeImg").attr({
                        "type": "button",
                        "data-dish": label,
                        "data-url": orgURL,
                        "data-dismiss": "modal"
                    }).append(recipeImg);

                    $("#modalBody").append(recipeButton);
                }
            });

            $("#modalCenter").modal("show");
        }
    });

    // Checks if this page is the splash page.
    if ($("#splash-page").length) {
        // Checks the time for different meals.
        function splashMeal() {
            let now = moment();

            let bFastTime = (now.diff(moment("06:00", "HH:mm"), "minutes") >= 0) && (now.diff(moment("10:30", "HH:mm"), "minutes") <= 0);

            let lunchTime = (now.diff(moment("11:30", "HH:mm"), "minutes") >= 0) && (now.diff(moment("14:30", "HH:mm"), "minutes") <= 0);

            let dinnerTime = (now.diff(moment("17:00", "HH:mm"), "minutes") >= 0) && (now.diff(moment("21:00", "HH:mm"), "minutes") <= 0);

            let mealTime = "";

            // Changes the Splash page look to reflect the meal time.
            switch (true) {
                case bFastTime:
                    mealTime = "It's breakfast time!";

                    $("#splash-page").addClass("breakfast").removeClass("lunch dinner");

                    break;
                case lunchTime:
                    mealTime = "It's lunch time!";

                    $("#splash-page").addClass("lunch").removeClass("breakfast dinner");
                    
                    break;
                case dinnerTime:
                    mealTime = "It's dinner time!";

                    $("#splash-page").addClass("dinner").removeClass("breakfast lunch");

                    break;
                default:
                    $("#splash-page").removeClass("breakfast lunch dinner");
            }
            $("#splash-time").text(mealTime);
        }

        splashMeal();

        // Every minute, the page checks if it's a meal time.
        setInterval(splashMeal, 60000);
    }

    /*
    =======================================================
    Add Card Function 
    - Adds Card to Hold Recipe Details
    =======================================================
    */
    function addCard() {
        $("#recipeIngredients").empty();
        $("#recipeSpace").show();
    }

    /*
    =======================================================
    Listener for Image of Recipe Clicked
    - Brings up Card for Recipe Details to be Shown
    =======================================================
    */
    $(document).on("click", ".recipeImg", function () {
        addCard();

        var dish = $(this).attr("data-dish");
        var link =$(this).attr("data-url");

        queryURL = "https://api.edamam.com/search?q=" + dish + "&app_id=c16ec41a&app_key=8a6a3fa7dcc42aa6406a3ea1f8367e34&from=0&to=1";

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            console.log(response);
            let recipe = response.hits[0].recipe;
            label = recipe.label;
            let categories = recipe.healthLabels;
            let ingredients = recipe.ingredientLines;
            let calories = recipe.calories;
            let daily = recipe.totalDaily;
            let nutrients = recipe.totalNutrients;
            


            $("#recipeIns h3").text(label);
            $("#recipeIns img").attr({
                "alt": label,
                "src": recipe.image
            });
            $("#servings").text(recipe.yield);
           
            //Nutritional Value Information
            $("#calories").text(parseInt(recipe.calories));
            $("#fat").text(parseInt(daily.FAT.quantity));
            $("#sodium").text(parseInt(daily.NA.quantity));
            $("#sugar").text(parseInt(nutrients.SUGAR.quantity));
            $("#protein").text(parseInt(nutrients.PROCNT.quantity));
            
           
            for (var j = 0; j < ingredients.length; j++) {
                let ing = $("<p>").text(ingredients[j]);

                $("#recipeIngredients").append(ing);
            }

            if(categories.length > 0) {
                $("#recipeCtg").show();
                $("#categories").text(categories.join(", "));
            } else {
                $("#recipeCtg").hide();
                $("#categories").text("");
            }

            $("#recipeIns a").attr("href", link);

            // Checks the user's favorite recipes to see if the recipe is on there.
            $("#recipeSpace #recipeAdd").show();
            $("#recipeSpace #recipeRemove").hide();
            $.each(favRecipes, function(name, info) {
                // Checks if the uri is the same.
                if(info.uri == recipe.uri) {
                    $("#recipeSpace #recipeAdd").hide();
                    $("#recipeSpace #recipeRemove").show();
                    return false;
                }
            });

            let uri = recipe.uri;
            let recipeId = uri.substring(uri.indexOf("recipe_"));
            $("#recipeAdd, #recipeRemove").attr("data-id", recipeId);
            $("#recipeAdd").attr({
                "data-uri": uri,
                "data-ingr": JSON.stringify(ingredients),
                "data-ctg": JSON.stringify(categories)
            });
        });

    });

    /*
    =======================================================
    Listener for Close Button Clicked in Recipe Space
    - Will Remove Card if User is Done Looking at Details
    =======================================================
    */    
   $(document).on("click","#closeRecipe",function(){
        // $("#recipeSpace").empty();
        $("#recipeAdd").removeAttr("data-uri data-ingr data-ctg");
        $("#recipeAdd, #recipeRemove").removeAttr("data-id");
        $("#recipeSpace").hide();
   });

   // Adds a recipe to favorite recipes.
   $("#recipeAdd").on("click", function() {
        $("#recipeAdd").hide();
        $("#recipeRemove").show();
        let recipeId = $(this).attr("data-id");

        // Adds it to the local array
        favRecipes[$(this).attr("data-id")] = {
            uri: $(this).attr("data-uri"),
            name: $("#recipeIns h3").text(),
            url: $("#recipeIns a").attr("href"),
            image: $("#recipeIns img").attr("src"),
            ingredients: $(this).attr("data-ingr"),
            servings: $("#servings").text(),
            calories: $("#calories").text(),
            fat: $("#fat").text(),
            sodium: $("#sodium").text(),
            sugar: $("#sugar").text(),
            protein: $("#protein").text(),
            type: "recipe"
        }

        // Adds it to the Firebase favorites.
        database.ref("users/" + uid + "/favorites").child(recipeId).set(favRecipes[recipeId]);
   });

   // Removes a recipe from favorites.
   $("#recipeRemove").on("click", function() {
        $("#recipeAdd").show();
        $("#recipeRemove").hide();

        let recipeId = $(this).attr("data-id");

        // Removes the recipe from the favorite recipes object.
        delete favRecipes[recipeId];

        // Removes the recipe from the Firebase favorites.
        database.ref("users/" + uid + "/favorites/" + recipeId).remove();

        if($("#favorites-page").length) {
            $("#closeRecipe").trigger("click");
            renderFavorites();
        }
   });
});