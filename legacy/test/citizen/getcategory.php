<?php
require_once "db_connect.php";
require_once "json_creator.php";
$q= $_GET["q"];
$json = file_get_contents("./data.json");               // Read the JSON file  
$json_data = json_decode($json,true);                   // Decode the JSON file 


echo"<thead><tr><th>Product Name</th><th>Detail Name</th><th>Category</th></tr></thead>\n";
foreach ($json_data as $result) {
    if($result['cat_name'] == $q){
        echo"<tr><td>{$result['pr_name']}</td><td>{$result['detail_name']}</td><td>{$result['cat_name']}</td></tr>\n";                         // Display data 
    }
}
  
