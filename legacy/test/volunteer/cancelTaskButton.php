<?php
require_once 'db_connect.php';

session_start();
$vol_id = $_SESSION['userid'];

if(isset($_POST['task_id']))
{
	$task_id=$_POST['task_id'];
	$query = 'CALL disaster_supply_database.CancelTaskProc( :vol_id, :task_id)';
	$stmt = $pdo-> prepare($query);
	$stmt->bindParam(':task_id', $task_id);
	$stmt->bindParam(':vol_id', $vol_id);
	$stmt-> execute();
	$data = [];
while($result= $stmt-> fetch(PDO::FETCH_ASSOC) ){

array_push($data, $result);}

echo json_encode($data);

}