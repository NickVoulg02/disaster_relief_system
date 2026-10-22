<?php
session_start();
require_once 'db_connect.php';

$user_id = $_SESSION['userid'];


if(isset($_POST['task_id'])){
	$task_id = $_POST['task_id'];
	$query = 'SELECT veh_task_num FROM disaster_supply_database.vehicle WHERE veh_vol_id=:user_id';
	$stmt = $pdo-> prepare($query);
	$stmt->bindParam(':user_id', $user_id);
	$stmt-> execute();
	$result= $stmt-> fetch(PDO::FETCH_ASSOC);
	if($result['veh_task_num']<4)
	{
		$query = 'INSERT INTO disaster_supply_database.accepts (acc_vol_id,acc_task_id)
		VALUES (:user_id, :task_id);';
		$stmt = $pdo-> prepare($query);
		$stmt->bindParam(':user_id', $user_id);
		$stmt->bindParam(':task_id', $task_id);
		$stmt-> execute();
	}
	
}

echo $task_id;
//pare to id tou task vres to kanto insert sta accepted 