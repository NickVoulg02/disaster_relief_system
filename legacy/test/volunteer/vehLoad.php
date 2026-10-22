<?php
session_start();
try {    
    require_once "db_connect.php";
    $query = "SELECT pr_name, veh.pr_quantity as quantity, veh.veh_load_id as id, veh.veh_load_prod as prid FROM disaster_supply_database.product INNER JOIN disaster_supply_database.veh_load as veh ON veh.veh_load_prod=pr_id
    INNER JOIN disaster_supply_database.vehicle on veh.veh_load_id=veh_id WHERE veh_vol_id =".$_SESSION['userid'];

      $stmt = $pdo->prepare($query);
      $stmt->execute();

      $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
      foreach ($results as $result) {
          if($result['quantity']!=0){
            echo"<tr><td>{$result['pr_name']}</td><td>{$result['quantity']}</td></tr>\n";}
          if($result['quantity']==0)
          {
            $query = "DELETE FROM disaster_supply_database.veh_load WHERE veh_load_id =".$result['id']. " AND veh_load_prod=".$result['prid'];
            $stmt = $pdo->prepare($query);
            $stmt->execute();
          }

        }
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}