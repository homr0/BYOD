jQuery(document).ready(function () {
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
            //console.log(region);

            let imgURL = " " ; // You will set this value from the API
            let imgAlt = " " ;
            
            $('#modal-title').text(region);
            $('#modal-recipe-img').attr("src",imgURL);
            $('#modal-recipe-img').attr("alt",imgAlt);
            $('#modal-recipe-description').text(region);

            $('#testModal').modal('show');


            if (region === "California") {
               //console.log(region+" Clicked!");
               $('#testModal').modal('show');
               
            }
        }
    });

    // Checks if this page is the splash page.
    if($("#splash-page").length) {
        // Checks the time for different meals.
        function splashMeal() {
            let now = moment();

            let bFastTime = (now.diff(moment("06:00", "HH:mm"), "minutes") >= 0) && (now.diff(moment("10:30", "HH:mm"), "minutes") <= 0);

            let lunchTime = (now.diff(moment("11:30", "HH:mm"), "minutes") >= 0) && (now.diff(moment("14:30", "HH:mm"), "minutes") <= 0);

            let dinnerTime = (now.diff(moment("17:00", "HH:mm"), "minutes") >= 0) && (now.diff(moment("21:00", "HH:mm"), "minutes") <= 0);

            let mealTime = "";

            // Changes the Splash page look to reflect the meal time.
            switch(true) {
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
});