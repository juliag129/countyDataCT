// load county geojson file
d3.json('ct-counties.geojson').then(function (counties) {
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

    // marker that will hold the graph
    let marker = L.marker([0, 0]);

    // remove the marker when popup is closed
    marker.on("popupclose", function () {
        marker.remove();
    });

    // update county info on mouseover
    let info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    info.update = function (props) {
        this._div.innerHTML = '<h4>CT Counties</h4>' +  (props ?
            '<b>' + props.NAME + ' County</b><br />Population: ' + props.POPULATION
            : 'Hover over a county to see its <br>population or double click to see<br>' +
            'the annual average employment<br> for each county by industry');
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
        info.update(layer.feature.properties);
    }

    let geojson;

    function resetHighlight(e) {
        geojson.resetStyle(e.target);
        info.update();
    }

    // show bar graph
    function graph(e) {
        marker.setLatLng(e.target.getBounds().getCenter());
        // html returns html object, not consumable by popup, so text is used instead
        d3.text("./graph.html").then(function(d) {
            let html = d;
            html = html.replace("@n", e.target.feature.properties.name).replace("@z", "2");
            let frame = document.createElement("iframe");
            frame.srcdoc = html;
            marker.bindPopup(frame);
            marker.addTo(map);
            marker.openPopup();
        });
        e.stopPropagation();
    }

    // show entire graph when double clicked
    map.on("dblclick", function (e) {
        marker.setLatLng(e.latlng);
        d3.text("./bar.html").then(function (d) {
            let html = d;
            html = html.replace("@z", "2");
            let frame = document.createElement("iframe");
            frame.srcdoc = html;
            marker.bindPopup(frame);
            marker.addTo(map);
            marker.openPopup();
        });
    });

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            dblclick: graph
        });
    }

    geojson = L.geoJSON(counties, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);

});