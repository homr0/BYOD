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
    
    // Diet filters
    var diets = [
        "High Fiber", "High Protein", "Low Carb", "Low Fat",
        "Low Sodium", "Vegan", "Vegetarian", "Gluten free"
    ];
    
    // Regions with states and colors.
    var regions = {
        "New England": {
            states: [
                "CT", "ME", "MA", "NH", "RI", "VT"
            ],
            color: "#00ffff"
        },

        "Mid-Atlantic": {
            states: [
                "NJ", "NY", "PA", "DE", "DC", "MD"
            ],
            color: "#ff00ff"
        },

        "Great Lakes": {
            states: [
                "IL", "IN", "MI", "MN", "OH", "WI"
            ],
            color: "#ffff00"
        },

        "Midwest": {
            states: [
                "IA", "KS", "ND", "SD", "MO", "NE"
            ],
            color: "#ff0000"
        },

        "South": {
            states: [
                "FL", "GA", "NC", "SC", "VA", "WV", "AL", "KY", "MS", "TN", "AR", "LA", "OK", "TX"
            ],
            color: "#00ff00"
        },

        "Mountain": {
            states: [
                "AZ", "CO", "ID", "MT", "NM", "NV", "UT", "WY"
            ],
            color: "#0000ff"
        },

        "Pacific": {
            states: [
                "AK", "CA", "HI", "OR", "WA"
            ],
            color: "#999999"
        }
    };

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
                $("#firebaseui-auth-container").hide();
                return false;
            },

            uiShown: function() {
                // The widget is rendered.
                $("#firebaseui-auth-container").hide();
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
            console.log(user.displayName + " has logged in");
        } else {
            // User is signed out.
            // The start method will wait until the DOM is loaded.
            ui.start("#firebaseui-auth-container", uiConfig);
        }
    });

    // jQuery Vector Map
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
            console.log(region);
            if (region === "California") {
               console.log(region+" Clicked!");
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
});