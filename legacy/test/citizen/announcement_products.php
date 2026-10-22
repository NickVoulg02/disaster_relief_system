<?php
try {    
    require_once "db_connect.php";
    $query = "SELECT pr_name FROM disaster_supply_database.announcements 
    INNER JOIN disaster_supply_database.product on ann_pr_id = pr_id";

      $stmt = $pdo->prepare($query);
      $stmt->execute();

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo"<option selected disabled hidden>Choose here</option>";
        foreach ($results as $result) {        
            echo"<option>{$result['pr_name']}</option>";                
        }
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
