<?php
require_once 'db_connect.php';

session_start();
$id = "SELECT veh_id FROM disaster_supply_database.vehicle WHERE veh_vol_id=".$_SESSION['userid'];
$stmt = $pdo->prepare($id);
$stmt->execute();

$result = $stmt->fetch(PDO::FETCH_ASSOC); 
$user_id = $result['veh_id']; 
if(isset($_POST['quantity']) && isset($_POST['id']))
{
    //$x = json_decode($_POST['x'],true);
	$quantity=$_POST['quantity'];
	$id=$_POST['id'];
	foreach (array_map(null, $quantity, $id) as list($pr_id, $pr_quantity)) {
		
		$query ='CALL disaster_supply_database.load_from_base(:pr_quantity,:user_id, :pr_id)';
		$stmt = $pdo-> prepare($query);
		$stmt->bindParam(':user_id', $user_id);
		$stmt->bindParam(':pr_id', $pr_id);
		$stmt->bindParam(':pr_quantity', $pr_quantity);
		$stmt-> execute();
	}
	/*
	foreach ($data_tb as $row) {
		var_dump($row);
		echo "a";
		if(is_array($data_tb))
    {
        foreach ($data_tb as $row) {
			echo "b";
            if(is_array($row))
            {
                foreach ($row as $data){
					echo "c";
                    echo "?".$data."?";
                }
            }
			//else  echo "-".$row . 'a1'."-";
        }
    }
	//else  echo "<".'a2'.">";
		
		
		//echo json_encode($pr_id);
	}
	//var_dump($data_tb);*/
}




/*if(isset($_POST['pr_id']))
{
    $pr_id = $_POST['pr_id'];

}




if(isset($_POST['pr_quantity']))
{
    $pr_quantity = $_POST['pr_quantity'];

}*/

	
	//$query = 'DELETE FROM base_load WHERE pr_id='. $pr_id;
	//$stmt = $pdo-> prepare($query);
	//$stmt-> execute();
	
	//$query = "INSERT INTO veh_load (veh_load_id,veh_load_prod,pr_quantity) VALUES ('".$user_id . "','" . $pr_id . "',". "'". $pr_quantity . "')";
	//$query = "CALL load_from_base2(':vol_id'".$user_id . "','" . $pr_id . "',". "'". $pr_quantity . "')";

/*$query ='CALL load_from_base3(:pr_quantity,:user_id, :pr_id)';
	$stmt = $pdo-> prepare($query);
	$stmt->bindParam(':user_id', $user_id);
	$stmt->bindParam(':pr_id', $pr_id);
	$stmt->bindParam(':pr_quantity', $pr_quantity);
	$stmt-> execute();
*/


//echo json_encode($pr_id);

//Επιλεγει απο πινακα πραγμα και αριθμο
//Αφαιρει απο την βαση
//Τα βαζει στο πινακα veh_load μεχρι 4
//δινει id και πληθος. για τωρα θα βαλω μονο id.
