<?php
try {    
    require_once "db_connect.php";
    $query = "SELECT ann_id, ann_pr_id, pr_name, ann_value FROM disaster_supply_database.announcements 
    INNER JOIN disaster_supply_database.product on ann_pr_id = pr_id";

      $stmt = $pdo->prepare($query);
      $stmt->execute();

      $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
      foreach ($results as $result) {
          $id = $result['ann_id'];
          //echo"<tr onclick='donateProd($id)'><td>{$result['ann_id']}</td><td>{$result['ann_pr_id']}</td><td>{$result['pr_name']}</td></tr>\n";        
          echo"<tr><td>{$result['pr_name']}</td><td>{$result['ann_value']}</td><td class='clickable' onclick='deleteAnnouncement($id)'>Delete</td></tr>\n";                      
        }
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
