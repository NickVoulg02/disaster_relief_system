<?php
try {    
    require_once "db_connect.php";
    $query = "SELECT asdaa, Base.pr_id, pr_name, pr_quantity, cat_name FROM disaster_supply_database.base_load as Base
    INNER JOIN disaster_supply_database.product as Product on Base.pr_id = Product.pr_id
    INNER JOIN disaster_supply_database.categories as Category on Product.pr_cat_id = Category.cat_id
    ORDER BY asdaa";

      $stmt = $pdo->prepare($query);
      $stmt->execute();

      $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
      foreach ($results as $result) {
          $id = $result['asdaa'];
          echo"<tr><td>{$result['pr_name']}</td><td style='display:none;'>{$result['asdaa']}</td><td>
          {$result['cat_name']}</td><td>{$result['pr_quantity']}</td>";
          echo "<td class='clickable' onclick='openBaseForm($id, 2)'>Remove from Available</td>
          <td class='clickable' onclick='openBaseForm($id, 3)'>Remove Entirely</td></tr>\n";                      
        }
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}