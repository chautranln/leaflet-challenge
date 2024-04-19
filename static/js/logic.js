
  // Store earthquake url
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform a GET request to the URL
d3.json(url).then(function(data) {
    createFeatures(data.features);
});

//Create features on map
function createFeatures(earthquakeData) {
    // Binding a popup to each layer
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${feature.properties.mag}</p>`)
    }

    // GeoJSON layer
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function(feature, latlng) {
            let mag = feature.properties.mag;
            let depth = feature.geometry.coordinates[2];
            return L.circleMarker (latlng, {
                radius: mag * 3,
                color: "#000",
                fillColor: colors(depth),
                fillOpacity: 0.5,
                weight: 0.5
            });
        }
    });

    createMap(earthquakes)
}

// Determine color scale
function colors(depth) {
    if (depth >= -10 && depth < 10) {
        return '#00FF00';
    } else if (depth >= 10 && depth < 30) {
        return '#ADFF2F';
    } else if (depth >= 30 && depth < 50) {
        return '#FFFF00';
    } else if (depth >= 50 && depth < 70) {
        return '#FFA500';
    } else if (depth >= 70 && depth < 90) {
        return '#FF6347';
    } else if (depth >= 90) {
        return '#FF0000';
    } else {
        return '#808080';
    }
}

// Create other maps
function createMap(earthquakes){
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }); 

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      });

    let baseMaps = {
        "Outdoors": street,
        "Satelite": topo
    };

    let overlapMaps = {
        "Earthquakes": earthquakes
    };

// Creating the map object
    let myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 4,
        layers: [street, topo]
    });

    L.control.layers(baseMaps, overlapMaps).addTo(myMap)
}

// Add legend
function createLegend() {
    let legend = L.control({position: "bottomright"});
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend");
        let scale = [-10, 10, 30, 50, 70, 90];
        let colors = ["#00FF00","#ADFF2F", "#FFFF00","#FFA500","#FF6347","#FF0000"];
        let labels = [];

        let legendInfo = "<h4>Earthquake Depth</h4>";
        div.innerHTML = legendInfo;
 
        for (let i = 0; i < scale.length; i++) {
            let from = scale[i];
            let to = scale[i+1];
            labels.push("<li style=\"background-color: " + colors[from] + "\"></li>" + from + (to ? '&ndash;' + to : '+'));
        }

        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
    };

    legend.addTo(myMap);
}
