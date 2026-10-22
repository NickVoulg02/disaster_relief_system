let enableUserMarker = true;
			let enableBaseMarker = true;
			let enableVehiclesMarker = true;
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
			
			function loadMap(){
				$.ajax({
					type: "POST",
					url: "demands_hanlder.php",
					crossDomain: true,
					success: dem_marker,
					error: error,
					dataType: "json"
				});
				/*
				$.ajax({
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
				/*$.ajax({
					type: "POST",
					url: "vol_acc_dem_markers.php",
					crossDomain: true,
					success: acc_dem_markers,
					error: error,
					dataType: "json"
				});*/
				
				function error(data){
					alert("Error getting datas from DB");
					console.log("Error getting datas from DB");
					console.log(data);

					//showMap(46.187164,5.997526,null);
				}
				/*
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
					if(enableUserMarker == true){Formation.addLayer(markers);}
					return marker;
				}
				*/
				function Vehicles(data, data2){
					
					var allMarkers = [];
					var markers = L.layerGroup();
					for (var i = 0; i < Object.keys(data).length; i++) 
					{
						var markerOptions = {
							title: "Vehicle",
							clickable: true,
							//draggable: true
						}
						var marker = L.marker(new L.LatLng(data[i]['latitude'],data[i]['longtitude']), markerOptions);
						var desc= "Volunteer Username: " + data[i]['user_name']+'<br>'+
								"Volunteer Name: " + data[i]['vol_name']+'<br>'+
								"Volunteer Surname: " +data[i]['vol_lname'] + '<br>'+
								"Vehicle Load: ";
						var found=0;
								for (var j=0; j<Object.keys(data2).length; j++)
								{
									if (data2[j]['veh_load_id'] == data[i]['veh_id']) 
									{	
										desc += data2[j]['pr_name'] + ' ';
										found = 1;
									}
								}

								if(found == 0)
									desc += 'None'

						marker.bindPopup(desc,{
								maxWidth: 200,
								maxHeight: 200
						}).openPopup();
						//marker.bindTooltip(val, {direction: 'bottom', permanent: true});
						placeMarker(marker);
						markers.addLayer(marker);
						allMarkers[data[i]['veh_id']] = marker;
					}
		
					if(enableVehiclesMarker == true){Formation.addLayer(markers);}
					return allMarkers;
				} // End Vehicles
				
				function dem_marker(data){
					var ReqMarkers = L.layerGroup();
					var OffMarkers = L.layerGroup();
					var accReqMarkers = L.layerGroup();
					var accOffMarkers = L.layerGroup();
					var polyline = L.layerGroup();
					var vehMarkers=[];
					vehMarkers=Vehicles(data['Vehicles'], data['VehLoad']);
					for (var i = 0; i < Object.keys(data['Demands']).length; i++) 
					{
						if(data['Demands'][i]['task_acceptance_date']!=null){
							if(data['Demands'][i]['dem_type']==='request'){
							var markerOptions = {
								title: 'accepted ' + data['Demands'][i]['dem_type'],
								clickable: true
								,draggable: true
								,icon: accReqIcon
							};
							}
							else if(data['Demands'][i]['dem_type']==='donation'){
								var markerOptions = {
									title: 'accepted ' + data['Demands'][i]['dem_type'],
									clickable: true
									,draggable: true
									,icon: accOffIcon
							}}
							var marker = L.marker(new L.LatLng(data['Demands'][i]['cit_lat'],data['Demands'][i]['cit_long']), markerOptions);

							var desc= "Citizen Name: " + data['Demands'][i]['cit_name']+'<br>'+
								"Citizen Surname: " +data['Demands'][i]['cit_laname'] + '<br>'+ 
								"Citizen Telephone: " +data['Demands'][i]['cit_number'] + '<br>'+ 
								"Submission Date: " +data['Demands'][i]['task_submission_date'] +  '<br>'+
								"Product: " + data['Demands'][i]['pr_name']+'<br>'+
								"Size: " +data['Demands'][i]['dem_value'] +  '<br>'+
								"Acceptance Date: " +data['Demands'][i]['task_acceptance_date'] +  '<br>'+
								"Vehicle username: " +data['Demands'][i]['user_name'] +  '<br>';
								
							marker.bindPopup(desc,{
										maxWidth: 200,
										maxHeight: 200
								}).openPopup();
							placeMarker(marker);
							if(data['Demands'][i]['dem_type']==='request'){accReqMarkers.addLayer(marker);}
							else if(data['Demands'][i]['dem_type']==='donation'){accOffMarkers.addLayer(marker);}
							polyline.addLayer(L.polyline([marker.getLatLng(), vehMarkers[data['Demands'][i]['veh_id']].getLatLng()], {color: 'red'}));
						}
						else{
							if(data['Demands'][i]['dem_type']==='request'){
							var markerOptions = {
								title: data['Demands'][i]['dem_type'],
								clickable: true
								,draggable: true
								,icon: reqIcon
							};
							}
							else if(data['Demands'][i]['dem_type']==='donation'){
								var markerOptions = {
									title: data['Demands'][i]['dem_type'],
									clickable: true
									,draggable: true
									,icon: offIcon
							}}
							var marker = L.marker(new L.LatLng(data['Demands'][i]['cit_lat'],data['Demands'][i]['cit_long']), markerOptions);

							var desc= "Citizen Name: " + data['Demands'][i]['cit_name']+'<br>'+
								"Citizen Surname: " +data['Demands'][i]['cit_laname'] + '<br>'+ 
								"Citizen Telephone: " + +data['Demands'][i]['cit_number'] + '<br>'+
								"Submission Date: " +data['Demands'][i]['task_submission_date'] +  '<br>'+
								"Product: " + data['Demands'][i]['pr_name']+'<br>'+
								"Size: "+data['Demands'][i]['dem_value'] +  '<br>'+
								"Acceptance Date: " + 'Not Accepted<br>'+
								"Vehicle username: " + 'Not Accepted<br>';
								
							marker.bindPopup(desc,{
										maxWidth: 200,
										maxHeight: 200
								}).openPopup();
							placeMarker(marker);
							if(data['Demands'][i]['dem_type']==='request'){ReqMarkers.addLayer(marker);}
							else if(data['Demands'][i]['dem_type']==='donation'){OffMarkers.addLayer(marker);}
						}
					}
		
					if(pendingOffers){Formation.addLayer(OffMarkers);}
					if(pendingRequests){Formation.addLayer(ReqMarkers);}
					if(acceptedOffers){Formation.addLayer(accOffMarkers);}
					if(acceptedRequests){Formation.addLayer(accReqMarkers);}
					if(connections){Formation.addLayer(polyline);}
				} // End dem_marker
	
				function base_marker(data){
					var markers = L.layerGroup();
					//create markers for all rows on table
					for (var i = 0; i < Object.keys(data).length; i++) 
					{
						//create marker for base
						var marker = L.marker(new L.LatLng(data[i]['latitude'],data[i]['longtitude']),{
							title: "Base",
							clickable: true,
							draggable: true,
							icon: baseIcon});
						//add draggability to marker
						marker.on('dragend', function (e) {
							//confirm to change base location else just refreshMap.
							function fChange(){
								$.ajax({  
									type: 'POST',  
									url: 'updateBase.php', 
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
						//add new marker to Layer markers.
						placeMarker(marker);
						markers.addLayer(marker);
					}
					//Formation.clearLayers();
		
					//dont load markers for base if choosen by user
					if(enableBaseMarker == true){Formation.addLayer(markers);}
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
							clickable: true
							,icon: accReqIcon
						};
						}
						else if(data['accDem'][i]['dem_type']==='donation'){
						var markerOptions = {
							title: 'Accepted',
							clickable: true
							,icon: accOffIcon
						};
						}
						var marker = L.marker(new L.LatLng(data['accDem'][i]['cit_lat'],data['accDem'][i]['cit_long']), markerOptions);

						var desc= "Citizen Name: " + data['accDem'][i]['cit_name']+'<br>'+
								"Citizen Surname: " +data['accDem'][i]['cit_laname'] + '<br>'+ 
								"Citizen Telephone: " + 'Not finished<br>'+
								"Submission Date: " +data['accDem'][i]['task_submission_date'] +  '<br>'+
								"Product: " + data['accDem'][i]['pr_name']+'<br>'+
								"Size: " + 'Not finished<br>'+
								"Acceptance Date: " +data['accDem'][i]['task_acceptance_date']+ '<br>'+
								"Vehicle username: " + 'Accepted<br>';
								
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
			function switchVehicles(){
				var checkBox= document.getElementById("VehSwitch");
				if (checkBox.checked == true) {
					enableVehiclesMarker = false;
				} else {
					enableVehiclesMarker = true
				}
				refreshMap();
			}
			
			function switchBase(){
				var checkBox= document.getElementById("baseSwitch");
				if (checkBox.checked == true) {
					enableBaseMarker = false;
				} else {
					enableBaseMarker = true
				}
				refreshMap();
			}
			
			function switchUser(){
				var checkBox= document.getElementById("UserSwitch");
				if (checkBox.checked == true) {
					enableUserMarker = false;
				} else {
					enableUserMarker= true
				}
				refreshMap();
            }