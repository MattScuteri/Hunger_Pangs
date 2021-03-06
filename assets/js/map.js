//get the Div of map view
let map;
let marker;
let infowindow;
let directionsDisplay;
let directionsService;
let autocomplete;

//defualt values in case
let latitude = 40.730813;
let longitude = -74.065983;

let mapCenter;

let searchResultsList = [];
let mapCanvas = document.getElementById("map");

let inputAddress;
let numOfResults = 10;

const markerImages = {
  'Indian': 'assets/images/food-icon-indian.png',
  'Italian' : 'assets/images/food-icon-italian-1.png',
  'Mexican' : 'assets/images/food-icon-mexican.png',
  'Chinese' : 'assets/images/food-icon-chinese.png',
  'Cafe' : 'assets/images/food-icon-cafe.png',  
  'All' : 'assets/images/food-icon-4.png'
}

//initialize the map
function initMap() {

	mapCenter = {
		lat: latitude, 
		lng: longitude
	};

	mapOptions = {
		zoom: 14,
		center: mapCenter
	}

	map = new google.maps.Map(mapCanvas, mapOptions);
  
}

//convert input address into lat/long and display on the map
function drawInitMap(){	

	initMap();
	inputAddress = localStorage.getItem('input-address');

	getLatLong(inputAddress, function(latlng){

		map.setCenter(
		{
			lat: latlng.latitude,
			lng: latlng.longitude
		});

		createMarker({
						lat: latlng.latitude,
						lng: latlng.longitude
					 }, 
					"YOU ARE HERE! @ " + inputAddress, 
					12, 
					'assets/images/home-icon-3.png',
					40, 
					google.maps.Animation.BOUNCE);

		});
}

//get points of yelp results
function displayMarkers(yelpResponse){

	console.log("**Yelp Results**", numOfResults, yelpResponse);
  let markerImage = getMarkerIcon();

	for(let i = 0; i < numOfResults; i++){

    if(yelpResponse[i] && yelpResponse[i] != null && yelpResponse[i] != undefined ){
  		let latitude_business = yelpResponse[i].coordinates.latitude;
  		let longitude_business = yelpResponse[i].coordinates.longitude;

      let price = yelpResponse[i].price != undefined ? yelpResponse[i].price : "";
      let infoText = yelpResponse[i].name +'<br> Price : ' + price  + "<br> Rating : " + getRatingStars(parseInt(yelpResponse[i].rating));    

  		createMarker(
  			{
  				lat: latitude_business, 
  				lng: longitude_business
  			},
  			infoText, 
  			22, 
  			markerImage, 
  			50,
  			google.maps.Animation.DROP);
    }else{
      console.log("End of results");
      break; 
    }
												
	}		
}

function getMarkerIcon(){
  let category = localStorage.getItem("input-category");

  if(category){
    return markerImages[category];
  }
  
  return 'assets/images/food-icon-5.png';
}

//show markers with infowindows
function createMarker(latlng, txt, zoom, image, size, anime) {

    infowindow = new google.maps.InfoWindow;

    marker = new google.maps.Marker({
        position: latlng,
        map: map,
        animation: anime,
        icon: {
        	url: image,
        	scaledSize : new google.maps.Size(size, size),        	
        }
    });

    //on mouseover show info
    google.maps.event.addListener(marker, 'mouseover', function() {
        infowindow.setContent("<p class='infotext'>" + txt + "</p>"); 
        infowindow.open(map, this);
    });

    //on mouseout remove info
    google.maps.event.addListener(marker, 'mouseout', function() {
        infowindow.close(map, this);
    });

    //on click, zoom in and time out after 3 secs
    google.maps.event.addListener(marker,'click',function() {
    	var pos = map.getZoom();
    	var center = map.getCenter();
    	map.setZoom(18);
    	map.setCenter(this.getPosition());
    	window.setTimeout(
    		function() {
    			map.setZoom(pos);
    			map.setCenter(center);
    		},3000);
  	});

    marker.setMap(map);
    marker.MyZoom = zoom; 
}

//zoom the map given a latitude and longitude
function zoomToLocation(latitude, longitude, zoom){
	var center = new google.maps.LatLng(latitude, longitude);
 	 map.setCenter(center);
 	 map.setZoom(zoom); 	 
}

//function to convert a given address to latitude and longitude
function getLatLong(address, callback){

	var geocoder = new google.maps.Geocoder();

	geocoder.geocode(
		{
		'address': address
		}, function(results, status) {
			if (status === 'OK') {
				callback(
					{
						latitude : results[0].geometry.location.lat(),
						longitude : results[0].geometry.location.lng()
					});
			} else {
				alert('Geocode was not successful for the following reason: ' + status);
			}
    });

}

//function to convert an address to latitude and longitude
function getAddressTxt(latitude, longitude, callback){

  var latlng = new google.maps.LatLng(latitude, longitude);
  var geocoder = new google.maps.Geocoder();

  geocoder.geocode({ 'latLng': latlng }, function (results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      callback(results[0].formatted_address);
    }else{
      alert(status);
    }
  });
}

// test function to get textual directions  
function getDirections(start, end, id){

  // Clear past routes
  if (directionsDisplay != null) {
    directionsDisplay.setMap(null);
    directionsDisplay = null;
  }

  directionsDisplay = new google.maps.DirectionsRenderer;
  directionsService = new google.maps.DirectionsService;

  directionsDisplay.setMap(map);
  directionsDisplay.setPanel(document.getElementById(id));

  document.getElementById(id).innerHTML = "";
  directionsDisplay.setOptions( { suppressMarkers: true } );

  directionsService.route({
    origin: start,
    destination: end,
    travelMode: 'WALKING'
  }, function(response, status) {
  
    if (status === 'OK') {
      console.log('directions', response);
      directionsDisplay.set('directions', null);
      directionsDisplay.setDirections(response);

    } else {
      console.log('Directions request failed due to ' + status);
    }
  });
}




