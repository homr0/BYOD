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
});