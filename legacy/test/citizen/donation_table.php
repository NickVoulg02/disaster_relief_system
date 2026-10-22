<?php
session_start();
try {    
    require_once "db_connect.php";

      $query = "SELECT dem_cit_id, dem_id, dem_pr_id, dem_type, task_submission_date, task_acceptance_date, task_completion_date, task_status, pr_name
      FROM disaster_supply_database.demands INNER JOIN disaster_supply_database.task on dem_id = task_dem_id
      INNER JOIN disaster_supply_database.product on pr_id=dem_pr_id
      WHERE dem_cit_id =" . $_SESSION['userid'] . "";

      $stmt = $pdo->prepare($query);
      $stmt->execute();


      $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

      foreach ($results as $result) {
          if($result['dem_type'] == 'donation'){
          echo"<tr><td>{$result['pr_name']}</td><td>{$result['task_submission_date']}</td><td>{$result['task_acceptance_date']}
          </td><td>{$result['task_completion_date']}</td><td>{$result['task_status']}</td>";

            if($result['task_completion_date'] !== NULL){
              echo"<td></td></tr>\n";
            }
            else{
              $id = $result['dem_id'];
              echo"<td class='clickable' onclick='deleteTask($id)'>Cancel</td></tr>\n";
            }
          }
      }

        echo"</tr></tbody></table>";
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
