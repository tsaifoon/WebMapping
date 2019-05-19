//link
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

var eqMag = []

function createFeatures(earthquakeData) {    

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
      layer.bindPopup("<h1>" + feature.properties.title + "</h1> <hr> <h3>Place: " + feature.properties.place + "</h3> <br> <h3> Magnitude: " + feature.properties.mag + "</h3>");
    }
  
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
      pointToLayer: function(feature,latlng){

        if(feature.properties.mag < 1){
          magcolor = "green"
        }
        else if(feature.properties.mag >= 1 && feature.properties.mag < 2.5){
          magcolor = "orange"
        }
        else if(feature.properties.mag >= 2.5 && feature.properties.mag <4.5){
          magcolor = "red"
        }
        else if(feature.properties.mag >= 4.5){
          magcolor = "black"
        }

        return new L.circle(latlng,
          {    
          fillOpacity: 0.5,
          color: magcolor,
          fillColor: "white",
          radius: feature.properties.mag * 35000
          });
        },
      onEachFeature: onEachFeature
    });
  
    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
  }

  function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.streets",
      accessToken: API_KEY
    });

    var grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.light",
      accessToken: API_KEY
    });

    var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.satellite",
      accessToken: API_KEY
    });
  
    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Street Map": streetmap,
      "Gray Scale": grayscale,
      "Satellite": satellite
    };
    
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      Earthquakes: earthquakes,
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [streetmap, earthquakes]
    });
  
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

    function getColor(d) {
      return d > 5  ? 'black' :
             d > 4.5  ? 'black' :
             d > 2.5   ? 'red' :
             d > 1   ? 'orange' :
             d > 0   ? 'green' :
                        '#FFEDA0';
    }

    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (myMap) {

        var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2.5, 4.5, 5],
        labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

      return div;
    };

    legend.addTo(myMap);
  
  }