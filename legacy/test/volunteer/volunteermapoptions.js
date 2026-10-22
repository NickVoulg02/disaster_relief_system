		
//MAP SECTION
let markerUser = true;
let enableBaseMarker = true;

let acceptedRequests = true;
let pendingRequests = true;
let acceptedOffers = true;
let pendingOffers = true;
let connections = true;





var accReqIcon = L.icon({
    iconUrl: 'red_marker.png',
    iconSize: [25, 41],
    //shadowSize: [50, 64],
    iconAnchor: [12, 41],
    //shadowAnchor: [4, 62],
    popupAnchor: [0, -35]
    });
var accOffIcon = L.icon({
    iconUrl: 'dark_blue_marker.png',
    iconSize: [25, 41],
    //shadowSize: [50, 64],
    iconAnchor: [12, 41],
    //shadowAnchor: [4, 62],
    popupAnchor: [0, -35]
    });
var userIcon = L.icon({
    iconUrl: 'green_marker.png',
    iconSize: [25, 41],
    //shadowSize: [50, 64],
    iconAnchor: [12, 41],
    //shadowAnchor: [4, 62],
    popupAnchor: [0, -35]
    });
var reqIcon = L.icon({
    iconUrl: 'orange_marker.png',
    iconSize: [25, 41],
    //shadowSize: [50, 64],
    iconAnchor: [12, 41],
    //shadowAnchor: [4, 62],
    popupAnchor: [0, -35]
    });
var offIcon = L.icon({
    iconUrl: 'blue_marker.png',
    iconSize: [25, 41],
    //shadowSize: [50, 64],
    iconAnchor: [12, 41],
    //shadowAnchor: [4, 62],
    popupAnchor: [0, -35]
    });
var baseIcon = L.icon({
    iconUrl: 'purple_marker.png',
    iconSize: [25, 41],
    //shadowSize: [50, 64],
    iconAnchor: [12, 41],
    //shadowAnchor: [4, 62],
    popupAnchor: [0, -35]
    });



// Creating map options
var mapOptions = {
    center: [38.24,21.73],
    zoom: 15,
    maxBoundsViscosity: 1.0,
    minZoom: 2,
    maxBounds: [
    [-90, -180],
    [90, 180]
    ]
    }
//Creating tile options
var tileOptions ={
    noWrap: true
}
// Creating a map object
var map = new L.map('map', mapOptions);

// Creating the world map layer
var layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', tileOptions);

// Adding layer to the map
map.addLayer(layer);

//create base layer called Formation
var Formation = L.layerGroup();
//add Formation to map
Formation.addTo(map);

//   Running the main function to create the map
refreshMap();
load_data_to_table();


//Clear the previous data and remake the map 
function refreshMap(){
    Formation.clearLayers();
    loadMap();
}

//Check if the marker is inside the map, if not place it at the border.
function placeMarker(marker){
    if (marker.getLatLng().lat <-90) marker.getLatLng().lat = -90
    else if (marker.getLatLng().lat >90) marker.getLatLng().lat= 90
    if (marker.getLatLng().lng <-180) marker.getLatLng().lng = -180
    else if (marker.getLatLng().lng>180) marker.getLatLng().lng= 180
}

function myFunction(button){
var y = button.getAttribute('demID');
console.info('The task id: ' + y);
$.ajax({
        type: "POST",
        url: "change_task_to_accepted.php",
        crossDomain: true
        //,success: dem_marker
        ,success: function(data) {
            refreshMap();
            loadTasksPanel();
        }
        ,data: {task_id : y}, 
        error: error
    });
    

}

function loadMap(){
    $.ajax({
        type: "POST",
        url: "vol_dem_handler.php",
        crossDomain: true,
        success: dem_marker,
        error: error,
        dataType: "json"
    });
    /*$.ajax({
        type: "POST",
        url: "user_marker.php",
        crossDomain: true,
        success: user_marker,
        error: error,
        dataType: "json"
    });*/
    $.ajax({
        type: "POST",
        url: "base_handler.php",
        crossDomain: true,
        success: base_marker,
        error: error,
        dataType: "json"
    });
    $.ajax({
        type: "POST",
        url: "vol_acc_dem_markers.php",
        crossDomain: true,
        success: acc_dem_markers,
        error: error,
        dataType: "json"
    });
    
    function error(data){
        alert("Error getting datas from DB");
        console.log("Error getting datas from DB");
        console.log(data);

        //showMap(46.187164,5.997526,null);
    }
    
    function user_marker(data){
        var markers = L.layerGroup();


            var markerOptions = {
                title: "MyLocation",
                clickable: true,
                draggable: true
                ,icon: userIcon
            };
            var marker = L.marker(new L.LatLng(data[0]['vol_lat'],data[0]['vol_long']), markerOptions);
            marker.bindPopup('Your Location').openPopup();
            
            
            marker.on('dragend', function (e) {
                //pan to marker if outside
                var position = marker.getLatLng();
                if (!map.getBounds().contains(position)) {
                    map.panTo(position);
                    }
                    
                //confirm to change base location else just refreshMap.
                function fChange(){
                    console.info('afas');
                    $.ajax({  
                        type: 'POST',  
                        url: 'updateUserLocation.php', 
                        data: { longtitude: marker.getLatLng().lng, latitude: marker.getLatLng().lat },
                        success: function(response) {
                            console.info(response);
                            refreshMap();
                        },
                        error: error
                    });
                }
                function fCancel(){
                    refreshMap();
                }
                const buttons = "<button id='myButton'>Change Location</button><button id='myButton2'>Cancel</button>";
                marker.bindPopup(buttons).openPopup();
                document.getElementById('myButton').addEventListener('click', fChange);
                document.getElementById('myButton2').addEventListener('click', fCancel);
            });
        
            
            
            placeMarker(marker);
            markers.addLayer(marker);
        if(markerUser == true){Formation.addLayer(markers);}
        return marker;
    }
    
    function dem_marker(data){
        var ReqMarkers = L.layerGroup();
        var OffMarkers = L.layerGroup();

        for (var i = 0; i < Object.keys(data).length; i++) 
        {
            if(data[i]['dem_type']==='request'){
            var markerOptions = {
                title: data[i]['dem_type'],
                clickable: true,
                draggable:true
                ,icon: reqIcon
            };
            }
            else if(data[i]['dem_type']==='donation'){
            var markerOptions = {
                title: data[i]['dem_type'],
                clickable: true,
                draggable:true
                ,icon: offIcon
            }}
            var marker = L.marker(new L.LatLng(data[i]['cit_lat'],data[i]['cit_long']), markerOptions);

            var desc= "Citizen Name: " + data[i]['cit_name']+'<br>'+
                    "Citizen Surname: " +data[i]['cit_laname'] + '<br>'+ 
                    "Citizen Telephone: " + +data[i]['cit_number'] + '<br>'+ 
                    "Submission Date: " +data[i]['task_submission_date'] +  '<br>'+
                    "Product: " + data[i]['pr_name']+'<br>'+
                    "Size: "  + data[i]['dem_value']+'<br>'+
                    "Acceptance Date: " + 'Not Accepted<br>'+
                    "Vehicle username: " + 'Not Accepted<br>';
                    
            const buttons = desc +"<p><button demID='"+data[i]['task_id']+"' onclick=myFunction(this)>Accept Task</button>";
            marker.bindPopup(buttons,{
                            maxWidth: 200,
                            maxHeight: 200
                    }).openPopup();
            placeMarker(marker);
            if(data[i]['dem_type']==='request'){ReqMarkers.addLayer(marker);}
            else if(data[i]['dem_type']==='donation'){OffMarkers.addLayer(marker);}
            
        }

        if(pendingOffers){Formation.addLayer(OffMarkers);}
        if(pendingRequests){Formation.addLayer(ReqMarkers);}
    } // End dem_marker

    function base_marker(data){
            //marker options 
            var markerOptions = {
                title: "Base",
                clickable: true
                ,icon: baseIcon
            }
            //create marker for base
            var marker = L.marker(new L.LatLng(data[0]['latitude'],data[0]['longtitude']), markerOptions);
            placeMarker(marker);

        //dont load markers for base if chosen by user
        if(enableBaseMarker == true){Formation.addLayer(marker);}
    } // End base_marker 

    
    
    
    function acc_dem_markers(data){
        var ReqMarkers = L.layerGroup();
        var OffMarkers = L.layerGroup();
        var polyline = L.layerGroup();
        userMarker=user_marker(data['userInfo']);

        for (var i = 0; i < Object.keys(data['accDem']).length; i++) 
        {
            if(data['accDem'][i]['dem_type']==='request'){
            var markerOptions = {
                title: 'Accepted',
                clickable: true,
                draggable:true
                ,icon: accReqIcon
            };
            }
            else if(data['accDem'][i]['dem_type']==='donation'){
            var markerOptions = {
                title: 'Accepted',
                clickable: true,
                draggable:true
                ,icon: accOffIcon
            };
            }
            var marker = L.marker(new L.LatLng(data['accDem'][i]['cit_lat'],data['accDem'][i]['cit_long']), markerOptions);

            var desc= "Citizen Name: " + data['accDem'][i]['cit_name']+'<br>'+
                    "Citizen Surname: " +data['accDem'][i]['cit_laname'] + '<br>'+ 
                    "Citizen Telephone: " + data['accDem'][i]['cit_number']+ '<br>'+ 
                    "Submission Date: " +data['accDem'][i]['task_submission_date'] +  '<br>'+
                    "Product: " + data['accDem'][i]['pr_name']+'<br>'+
                    "Size: " + data['accDem'][i]['dem_value']+'<br>'+
                    "Acceptance Date: " +data['accDem'][i]['task_acceptance_date']+ '<br>'+
                    "Vehicle username: "+ data['accDem'][i]['user_name']+'<br>';
                    
            marker.bindPopup(desc,{
                            maxWidth: 200,
                            maxHeight: 200
                    }).openPopup();
            placeMarker(marker);
            if(data['accDem'][i]['dem_type']==='request'){ReqMarkers.addLayer(marker);}
            else if(data['accDem'][i]['dem_type']==='donation'){OffMarkers.addLayer(marker);}
            polyline.addLayer(L.polyline([marker.getLatLng(), userMarker.getLatLng()], {color: 'red'}));
            
        }
        
        //add markers to layer
        if(connections && acceptedOffers && acceptedRequests && markerUser){Formation.addLayer(polyline);}
        if(acceptedOffers){Formation.addLayer(OffMarkers);}
        if(acceptedRequests){Formation.addLayer(ReqMarkers);}
    } // End acc_dem_markers


}//end LoadMap

//CHANGING MARRKER VISIBILITY



function switchAccReq(){
    var checkBox= document.getElementById("AccReq");
    if (checkBox.checked == true) {
        acceptedRequests = false;
    } else {
    acceptedRequests = true
    }
    refreshMap();
}
function switchAccOff(){
    var checkBox= document.getElementById("AccOff");
    if (checkBox.checked == true) {
        acceptedOffers = false;
    } else {
    acceptedOffers = true
    }
    refreshMap();
}
function switchPendReq(){
    var checkBox= document.getElementById("PendReq");
    if (checkBox.checked == true) {
        pendingRequests = false;
    } else {
    pendingRequests = true
    }
    refreshMap();
}
function switchPendOff(){
    var checkBox= document.getElementById("PendOff");
    if (checkBox.checked == true) {
        pendingOffers = false;
    } else {
    pendingOffers = true
    }
    refreshMap();
}
function switchLines(){
    var checkBox= document.getElementById("Lines");
    if (checkBox.checked == true) {
        connections = false;
    } else {
    connections = true
    }
    refreshMap();
}


function functionBase(){
    var checkBox= document.getElementById("switch2");
    if (checkBox.checked == true) {
        enableBaseMarker = false;
    } else {
        enableBaseMarker = true
    }
    refreshMap();
}

function functionUser(){
    var checkBox= document.getElementById("switch3");
    if (checkBox.checked == true) {
        markerUser = false;
    } else {
    markerUser = true
    }
    refreshMap();
}



//DISTANCE SECTION


function haversine(lat1, lon1, lat2, lon2) {
    console.log(lat1)
    console.log(lat2)
    console.log(lon1)
    console.log(lon2)
    const R = 6371e3;  // radius of Earth in meters
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const delta_phi = (lat2 - lat1) * Math.PI / 180;
    const delta_lambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(delta_phi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(delta_lambda / 2) ** 2;
    //const a = Math.sin(delta_phi / 2) * Math.sin(delta_phi / 2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(delta_lambda / 2) * Math.sin(delta_lambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    console.info(R * c);
    return R * c;
}

async function DistanceCheck(){
    var lat1,lat2,lng1,lng2;
    let response = await $.ajax({
        type: "POST",
        url: "base_volunteer.php",
        crossDomain: true,
        success: function (data) {
            lat1 = data['volunteer'][0]['vol_lat'];
            lng1 = data['volunteer'][0]['vol_long'];
            lat2 = data['base'][0]['latitude'];
            lng2 = data['base'][0]['longtitude'];
        },
        error: error,
        dataType: "json"
    });

    if(haversine(lat1,lng1,lat2,lng2) <=100){ return true; }
    else return false;
}
function Load(){
    //check distance of user from base
    DistanceCheck().then(
        function(value) {
            if(value == true) {
                const table = document.querySelector("#myTable");
                const rowCount = table.rows.length;
                var quantity = [];
                var id = [];
                for (var i = 1; i <rowCount; i++) {
                    var row = table.rows[i];
                    if(row.querySelector("#switch" + i).checked){
                        const selectedCells = row.querySelectorAll('td');
                        quantity.push(selectedCells[1].textContent);
                        id.push(row.querySelector("#dropdown" + i).value);
                        console.info('yes');
                    }
                }
                $.ajax({
                            type: "POST",
                            url: 'load_handler.php',
                            data: {quantity: quantity, id: id},
                            beforeSend: function() {
                            },
                            success: function(response) {
                                console.info('load ajax success');
                                console.info(response);
                                load_data_to_table();
                                vehLoad();
                            }
                        });
            }
            else console.info('no');
        },
        function(error) {console.info(error);}
    );

}//end Load

function Unload(){
    DistanceCheck().then(
        function(value) {
            if(value == true) {
                $.ajax({
                    url: 'unload_handler.php',
                    success: function(data) {
                        console.info('unload ajax success');
                        console.info(data);
                        load_data_to_table();
                        vehLoad();
                    }
                });
            }
            else console.info('no');
        },
        function(error) {console.info(error);}
    );

}//end Unload
function error(data){
    alert("Error getting datas from DB");
    console.log("Error getting datas from DB");
    console.log(data);
    //showMap(46.187164,5.997526,null);
}





//TABLE FOR LOAD SECTION

// Load data into HTML table
function load_data_to_table(){
$.ajax({
        type: "POST",
        url: "base_load_handler.php",
        crossDomain: true,
        beforeSend: function(){
            const tableBody = document.querySelector("#myTable");
            const rowCount = tableBody.rows.length;
            for (let i = rowCount-1; i >= 1; i--) {
                tableBody.deleteRow(i);
            }
        },
        success: function(data){
            const tableBody = document.querySelector("#myTable");
            var i = 0;
            data.forEach(row => {
                i++;
                const tr = document.createElement('tr');
                tr.innerHTML =  "<tr>" +
                "<td>" + "<input type='checkbox' id='switch"+ i + "'/>" + "</td>" +
                "<td style='display:none;'>" + row.pr_id + "</td>" +
                "<td>" + row.pr_name + "</td>" +
                "<td>" + row.pr_quantity + "</td>" +
                "<td>" + "<select id='dropdown"+ i +"'></select>" + "</td>" +
                "</tr>";
    
                tableBody.appendChild(tr);
    
                const dropdown = document.getElementById("dropdown" + i);
                for (let j = 0; j <= row.pr_quantity; j++) {
                    const option = document.createElement("option");
                    option.value = j;
                    option.text = j;
                    dropdown.appendChild(option);
                }
            });
        
        
        },
        dataType: "json"
    });
}