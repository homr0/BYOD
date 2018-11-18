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
            console.log(region);
            if (region === "California") {
               console.log(region+" Clicked!");
            }
        }
    });

    // Checks if this page is the splash page.
    if($("#splash-page").length) {
        // Keeps track of meal times.
        var bfast = {
            start: moment("06:00", "HH:mm"),
            end: moment("10:30", "HH:mm")
        };
            
        var lunch = {
            start: moment("11:30", "HH:mm"),
            end: moment("14:30", "HH:mm")
        };

        var dinner = {
            start: moment("17:00", "HH:mm"),
            end: moment("21:00", "HH:mm")
        };

        // Checks the time for different meals.
        function splashMeal() {
            let now = moment();

            let bFastTime = (now.diff(bfast.start, "minutes") >= 0) && (now.diff(bfast.end, "minutes") <= 0);

            let lunchTime = (now.diff(lunch.start, "minutes") >= 0) && (now.diff(lunch.end, "minutes") <= 0);

            let dinnerTime = (now.diff(dinner.start, "minutes") >= 0) && (now.diff(dinner.end, "minutes") <= 0);

            let mealTime = "";

            switch(true) {
                case bFastTime:
                    mealTime = "It's breakfast time!";
                    break;
                case lunchTime:
                    mealTime = "It's lunch time!";
                    break;
                case dinnerTime:
                    mealTime = "It's dinner time!";
                    break;
            }
            $("#splash-time").text(mealTime);
        }

        splashMeal();

        // Every minute, the page checks if it's a meal time.
        setInterval(splashMeal, 60000);
    }
});