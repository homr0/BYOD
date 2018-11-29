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
    $.each(regions, function (key, region) {
        $(region.states).each(function (index, state) {
            regionColors[state.toLowerCase()] = region.color;
        });
    });

    // Initialize the FirebaseUI Widget using Firebase.
    var ui = new firebaseui.auth.AuthUI(firebase.auth());

    // Handles user authentication
    var uiConfig = {
        callbacks: {
            signInSuccessWithAuthResult: function (authResult, redirectURL) {
                // User successfully signed in.
                $("#firebaseui-auth-container").modal('hide');
                return false;
            },

            uiShown: function () {
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
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
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

            $("#modalTitle").text(region);
            $("#modalBody").empty();

            $("#modalBody").append('<button type="button" data-region="' + region + '" class="btn btn-outline-warning btn-lg center" id="cookBtn">Cook It</button>');
            $("#modalBody").append('<button type="button" data-region="' + region + '" data-state="' + code.toUpperCase() + '" class="btn btn-outline-warning btn-lg center" id="restBtn">Restaurants</button>');

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
    $(document).on("click", ".recipeImg, .searchImg", function () {
        addCard();

        var dish = $(this).attr("data-dish");
        var link = $(this).attr("data-url");

        queryURL = "https://api.edamam.com/search?q=" + dish + "&app_id=c16ec41a&app_key=8a6a3fa7dcc42aa6406a3ea1f8367e34&from=0&to=1";

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            let recipe = response.hits[0].recipe;
            label = recipe.label;
            let categories = recipe.healthLabels;
            let ingredients = recipe.ingredientLines;
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

            if (categories.length > 0) {
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
            $("#recipeAdd").attr("data-uri", uri);
        });

    });

    /*
    =======================================================
    Listener for Close Button Clicked in Recipe Space
    - Will Remove Card if User is Done Looking at Details
    =======================================================
    */    
   $(document).on("click","#closeRecipe",function(){
        $("#recipeAdd").removeAttr("data-uri data-ingr data-ctg");
        $("#recipeAdd, #recipeRemove").removeAttr("data-id");
        $("#recipeSpace").hide();
    });

    /*
     =======================================================
     Listener for Cook Button Clicked in Modal Space
     - Will Call Recipe API
     =======================================================
     */
    $(document).on("click", "#cookBtn", function () {
        //Set Region From Button Attribute
        let reg = $(this).attr("data-region");

        //Build API Call URL
        queryURL = "https://api.edamam.com/search?q=" + reg + "&app_id=c16ec41a&app_key=8a6a3fa7dcc42aa6406a3ea1f8367e34&from=0&to=10";

        //Change the Title of Modal to the Name of State Clicked On & Empty Modal Body
        $("#modalTitle").text(reg);
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
    });

    /*
     =======================================================
     Listener for Restaurant Button Clicked in Modal Space
     - Will Call Restaurant API
     =======================================================
     */
    $(document).on("click", "#restBtn", function () {
        //Set Region From Button Attribute
        let reg = $(this).attr("data-region");
        let sCode = $(this).attr("data-state");

        //Build API Call URL
        let qURL = "https://opentable.herokuapp.com/api/restaurants?state=" + sCode;

        //Change the Title of Modal to the Name of State Clicked On & Empty Modal Body
        $("#modalTitle").text(reg);
        $("#modalBody").empty();

        $.ajax({
            url: qURL,
            method: "GET",
        }).then(function (response) {
            console.log(response);
            for (var i = 0; i < response.restaurants.length; i++) {
                let name = response.restaurants[i].name;      //Restaurant Name
                let pic = response.restaurants[i].image_url;  //Restaurant Image
                let pNum = response.restaurants[i].phone;     //Restaurant Phone Number
                let rID = response.restaurants[i].id;         //Restaurant ID From API
                let city = response.restaurants[i].city;      //Restaurant's City
                let state = response.restaurants[i].area;     //Restaurant's State
                let address = response.restaurants[i].address + " " + city + ", " + state;    //Full Address
                let price = response.restaurants[i].price;

                var restImg = $("<img>").attr({
                    "alt": name,
                    "src": pic,
                });

                var restBtn = $("<button>").addClass("restImg").attr({
                    "type": "button",
                    "data-number": pNum,
                    "data-id": rID,
                    "data-price": price,
                    "data-address": address,
                    "data-img": pic,
                    "data-name": name
                }).append(restImg);

                $("#modalBody").append(restBtn);
            }
        });


    });

    /*
    =======================================================
    Listener for Image of Restaurant Clicked
    - Brings up Card for Recipe Details to be Shown
    =======================================================
    */
    $(document).on("click", ".restImg", function () {
        //Extract Restaurant Details Back
        let n = $(this).attr("data-name");
        let i = $(this).attr("data-img");
        let num = $(this).attr("data-number");
        let range = $(this).attr("data-price");
        let add = $(this).attr("data-address");

        $("#modalTitle").text(n);
        $("#modalBody").empty();

        var restImg = $("<img>").attr({
            "alt": n,
            "src": i
        });

        $("#modalBody").append(restImg);

        $("#modalBody").append("<p><strong>Address: </strong> " + add + "</p>");
        $("#modalBody").append("<p><strong>Phone Number: </strong>" + num + "</p>");
        $("#modalBody").append("<p><strong>Price Range: </strong> " + range + "</p>");

        $("#modalBody").append("<p>*Price Range is 1-4, 1 being lowest and 4 being the highest</p>");
    });

    /*
    =======================================================
    Listener for Search Button Clicked 
    - Fills Modal with Recipes
    =======================================================
    */
    $("#searchBtn").on("click", function (event) {
        event.preventDefault();
        $("#searchBody").empty();

        var ing = $("#searchIng").val().trim();
        var sNum = $("#recQ").val();
        var hRest = $("#healthRest").val();
        
        var searchURL = "https://api.edamam.com/search?q=" + ing + "&app_id=c16ec41a&app_key=8a6a3fa7dcc42aa6406a3ea1f8367e34&from=0&to=" + sNum;

        switch (hRest) {
            case "Vegan": {
                searchURL += "&health=vegan";
                break;
            }
            case "Vegetarian": {
                searchURL += "&health=vegetarian";
                break;
            }
            case "Gluten Free": {
                searchURL += "&health=gluten-free";
                break;
            }
            case "Dairy Free": {
                searchURL +="&health=dairy-free"
                break;
            }
            case "Peanut Free": {
                searchURL +="&health=peanut-free";
                break;
            }
            case "Sugar Free": {
                searchURL +="&health=low-sugar";
                break;
            }
            case "Red Meat-Free": {
                searchURL += "&health=red-meat-free";
                break;
            }
        }

        //API Call With AJAX
        $.ajax({
            url: searchURL,
            method: "GET"
        }).then(function (response) {
            console.log(response);
            if (response.hits.length <= 0) {
                $("#searchBody").append("<p>Sorry, no results found. Try Again");
            }
            else {
                for (var i = 0; i < response.hits.length; i++) {
                    label = response.hits[i].recipe.label;
                    img = response.hits[i].recipe.image;
                    orgURL = response.hits[i].recipe.url;

                    var searchImg = $("<img>").attr({
                        "alt": label,
                        "src": img
                    });

                    var resultBtn = $("<button>").addClass("searchImg").attr({
                        "type": "button",
                        "data-dish": label,
                        "data-url": orgURL,
                        "data-dismiss": "modal"
                    }).append(searchImg);

                    $("#searchBody").append(resultBtn);
                }
            }
        });

        $("#searchModalCenter").modal("show");


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