<?php

declare(strict_types=1);

function get_username(object $pdo, string $username)
{
    $query = "SELECT user_name FROM disaster_supply_database.users WHERE user_name = :username;";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(":username", $username);
    $stmt->execute();

    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result;
}

function create_user(object $pdo, string $username, string $pwd, string $citname, string $citlname, float $citlong, float $citlat, string $citnum)
{
    $query = "INSERT INTO disaster_supply_database.users (user_name,user_pass,user_type) VALUES (:username,:pwd,'citizen');";
    $stmt = $pdo->prepare($query);

    $options = [
        'cost' => 12
    ];

    //$hashedPwd = password_hash($pwd, PASSWORD_BCRYPT, $options); 
    $stmt->bindParam(":username", $username);
    //$stmt->bindParam(":pwd", $hashedPwd);
    $stmt->bindParam(":pwd", $pwd);

    $stmt->execute();


    $id = "SELECT * FROM disaster_supply_database.users ORDER BY user_id DESC LIMIT 1";
    $stmt = $pdo->prepare($id);
    $stmt->execute();

    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $query2 = "INSERT INTO disaster_supply_database.citizen VALUES('".$citname."','".$citlname."',".$result['user_id'].",".$citlong.",".$citlat.",".$citnum.")";
    $stmt = $pdo->prepare($query2);
    $stmt->execute();

}