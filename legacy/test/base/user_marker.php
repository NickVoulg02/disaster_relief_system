<?php
require_once 'db_connect.php';

$user_name = "markkennei";
$query = "SELECT user_id FROM disaster_supply_database.users WHERE user_name= :vol_username";
$stmt = $pdo-> prepare($query);
$stmt->bindParam(':vol_username', $user_name);
$stmt-> execute();

$result = $stmt->fetch(PDO::FETCH_ASSOC);           // fetching vol id

$query="SELECT vol_long,vol_lat FROM disaster_supply_database.volunteer WHERE  vol_id = ".$result['user_id'];
$stmt = $pdo-> prepare($query);
$stmt-> execute();


$data = [];
while($result= $stmt-> fetch(PDO::FETCH_ASSOC) ){
	array_push($data, $result);
}


//if(data['user_type']==='Civillian'){}
//elseif(data['user_type']==='Volunteer')
//elseif(data['user_type']==='Admin')
//else print("error");

echo json_encode($data);