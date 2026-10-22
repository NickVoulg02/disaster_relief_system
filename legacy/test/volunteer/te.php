<?php
session_start();
require_once 'db_connect.php';

$user_id = $_SESSION['userid'];


	$query = 'SELECT veh_task_num FROM disaster_supply_database.vehicle WHERE veh_vol_id=2';
	$stmt = $pdo-> prepare($query);
    $stmt-> execute();
	$result= $stmt-> fetch(PDO::FETCH_ASSOC);
	
		echo $result['veh_task_num'];
	


//pare to id tou task vres to kanto insert sta accepted 