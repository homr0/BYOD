jQuery(document).ready(function () {

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
        colors: {
        },
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

                    $("#modalBody").append('<button class="recipeImg" type="button" data-dish="' + label +'" data-url="'+orgURL+'"><img alt="' + label + '" src="' + img + '"></button');
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

                    $("#splash-page").addClass("lunch").removeClass("breakfash dinner");

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
        $("#recipeSpace").empty();
        var card = $("<div>");
        $(card).addClass("card");
        $(card).append("<div class='card-header'><strong><i class='fas fa-info-circle'></i> Recipe Details</strong></div>");
        $(card).append("<div class='card-body' id='recipeIns'></div>");
        $("#recipeSpace").append(card);
    }

    /*
    =======================================================
    Listener for Image of Recipe Clicked
    - Brings up Card for Recipe Details to be Shown
    =======================================================
    */
    $(document).on("click", ".recipeImg", function () {
        $("#modalCenter").modal("hide");

        addCard();

        var dish = $(this).attr("data-dish");
        var link =$(this).attr("data-url");

        queryURL = "https://api.edamam.com/search?q=" + dish + "&app_id=c16ec41a&app_key=8a6a3fa7dcc42aa6406a3ea1f8367e34&from=0&to=1";

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            //console.log(response);
            label = response.hits[0].recipe.label;
            img = response.hits[0].recipe.image;
            let servings=response.hits[0].recipe.yield;
            let ctgCount=response.hits[0].recipe.healthLabels.length;
            let categories=response.hits[0].recipe.healthLabels;

            $("#recipeIns").append("<h3>" + label + "</h3>");
            $("#recipeIns").append("<hr class='my-4'>");
            $("#recipeIns").append("<img alt='" + label + "' src='" + img + "'>");
            $("#recipeIns").append("<br><p>Servings: "+servings+"</p>");
            $("#recipeIns").append("<br><strong><p>Ingredients: </p></strong>");

            for (var j = 0; j < response.hits[0].recipe.ingredientLines.length; j++) {
                let ing = response.hits[0].recipe.ingredientLines[j];

                $("#recipeIns").append("<p>" + ing + "</p>");
            }

            if(ctgCount>0){
                $("#recipeIns").append("<br><p>This recipe is "+categories+"</p>");
            }


            $("#recipeIns").append("<br><p>For More Information <a href='"+link+"'><i class='fas fa-external-link-alt'></i></a></p>")
            $("#recipeIns").append("<br><button type='button' class='btn btn-outline-dark' id='closeRecipe'>Close</button>");
        });

    });

    /*
    =======================================================
    Listener for Close Button Clicked in Recipe Space
    - Will Remove Card if User is Done Looking at Details
    =======================================================
    */    
   $(document).on("click","#closeRecipe",function(){
        $("#recipeSpace").empty();
   });

});