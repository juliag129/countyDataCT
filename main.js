// load the data
d3.dsv(',','employmentbyindustry.csv',function(d) {
    if(d.Year=="2018" && d.County=="Hartford County" && d.Variable=="Annual Average Employment" ||
       d.Year=="2018" && d.County=="Litchfield County" && d.Variable=="Annual Average Employment" ||
       d.Year=="2018" && d.County=="Tolland County" && d.Variable=="Annual Average Employment" ||
       d.Year=="2018" && d.County=="Fairfield County" && d.Variable=="Annual Average Employment" ||
       d.Year=="2018" && d.County=="New Haven County" && d.Variable=="Annual Average Employment" ||
       d.Year=="2018" && d.County=="New London County" && d.Variable=="Annual Average Employment" ||
       d.Year=="2018" && d.County=="Middlesex County" && d.Variable=="Annual Average Employment" ||
       d.Year=="2018" && d.County=="Windham County" && d.Variable=="Annual Average Employment") {
       return {
           county: d.County,
           industry: d.Industry,
           value: +d.Value
       }
    }
}).then(function(data) {
    // load county geojson file
    d3.json('ct-counties.geojson').then(function (counties) {
        console.log(data);
        console.log(counties);

        // load map and position
        let center = [41.5, -72.8];
        let map = L.map('mapid').setView(center, 8.5);

        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: 'mapbox/light-v9'
        }).addTo(map);

        // basic instructions
        let info = L.control();

        info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
            this.update();
            return this._div;
        };

        info.update = function () {
            this._div.innerHTML = '<h4>CT County Data</h4>' + 'Click on a county to see more';
        };

        info.addTo(map);

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
                fillOpacity: 0.5
            };
        }

        // add data from geojson to map
        L.geoJSON(counties, {style: style}).addTo(map);

        // highlight county when mouseover
        function highlightFeature(e) {
            let layer = e.target;

            layer.setStyle({
                weight: 5,
                color: '#333333',
                dashArray: ''
            });

            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                layer.bringToFront();
            }
        }

        let geojson;

        function resetHighlight(e) {
            geojson.resetStyle(e.target);
        }

        function onEachFeature(feature, layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight
            });

            let popupContent = "This is " + feature.properties.NAME + " county" +
                "<br>Population is " + feature.properties.POPULATION;
            layer.bindPopup(popupContent);
        }

        geojson = L.geoJSON(counties, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(map);

    });
});