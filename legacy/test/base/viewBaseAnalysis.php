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
          echo"<tr class='hidden_row'><td>{$result['pr_name']}</td><td style='display:none;'>{$result['pr_id']}</td><td id='category'>{$result['cat_name']}</td>
          <td>{$result['pr_quantity']}</td>
          <td>Base</td><td>Not inside a vehicle</td></tr>\n";                      
    }

    $query = "SELECT VehLoad.veh_load_prod, pr_name, pr_quantity, cat_name, Users.user_name FROM disaster_supply_database.veh_load as VehLoad
    INNER JOIN disaster_supply_database.product as Product on VehLoad.veh_load_prod = Product.pr_id
    INNER JOIN disaster_supply_database.categories as Category on Product.pr_cat_id = Category.cat_id
    INNER JOIN disaster_supply_database.vehicle as Veh on VehLoad.veh_load_id = Veh.veh_id
    INNER JOIN disaster_supply_database.volunteer as Volunteer on Volunteer.vol_id = Veh.veh_vol_id
    INNER JOIN disaster_supply_database.users as Users on Volunteer.vol_id = Users.user_id
   ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($results as $result) {
              echo"<tr class='hidden_row'><td>{$result['pr_name']}</td><td style='display:none;'>{$result['veh_load_prod']}</td><td id='category'>{$result['cat_name']}</td>
              <td>{$result['pr_quantity']}</td>
              <td>Vehicle</td><td>{$result['user_name']}</td></tr>\n";                      
    }
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}