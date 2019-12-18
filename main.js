// load the data
d3.dsv(',','employmentbyindustry.csv',function(d) {
    return {
        county: d.County,
        industry: d.Industry,
        value: d.Value
    };
}).then(function(data) {
    // load county geojson file
    d3.json('ct-counties.geojson').then(function (counties) {
        console.log(data);
        console.log(counties);

        // load map and position
        var center = [41.5, -72.8];
        var map = L.map('mapid').setView(center, 8.5);

        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: 'mapbox/light-v9'
        }).addTo(map);

        // color each county based on population
        function getColor(p) {
            return p > 900000  ? '#800026' :
                   p > 800000  ? '#BD0026' :
                   p > 200000  ? '#E31A1C' :
                   p > 100000  ? '#FC4E2A' :
                                 '#FD8D3C';
        }

        function style(feature) {
            return {
                fillColor: getColor(feature.properties.POPULATION),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.75
            };
        }

        // add data from geojson to map
        L.geoJSON(counties, {style: style}).addTo(map);
    });
});