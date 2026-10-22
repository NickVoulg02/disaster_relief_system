<?php
require_once 'db_connect.php';

session_start();
$id = "SELECT veh_id FROM disaster_supply_database.vehicle WHERE veh_vol_id=".$_SESSION['userid'];
$stmt = $pdo->prepare($id);
$stmt->execute();

$result = $stmt->fetch(PDO::FETCH_ASSOC); 
$user_id = $result['veh_id']; 
/*
$query = 'SELECT * FROM veh_load WHERE veh_load_id='. $user_id ;
$stmt = $pdo-> prepare($query);
$stmt-> execute();

$table = [];
while($result= $stmt-> fetch(PDO::FETCH_ASSOC) ){

array_push($table, $result);
}

$query = 'DELETE FROM veh_load WHERE veh_load_id='. $user_id ;
$stmt = $pdo-> prepare($query);
$stmt-> execute();

foreach($table as $row){
	$query = "INSERT INTO base_load (base_id,pr_id,pr_quantity) VALUES ('0','" . $row['veh_load_prod'] . "','". $row['pr_quantity'] . "')";
	$stmt = $pdo-> prepare($query);
	$stmt-> execute();
}

echo json_encode($table);*/


$query = 'CALL disaster_supply_database.load_to_base(:user_id)';
$stmt = $pdo-> prepare($query);
$stmt->bindParam(':user_id', $user_id);
$stmt-> execute();
echo 'ok';