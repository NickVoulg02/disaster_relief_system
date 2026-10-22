CREATE DATABASE disaster_supply_database; 
use disaster_supply_database;


CREATE TABLE users(
	user_id INT NOT NULL AUTO_INCREMENT,
    user_name VARCHAR(20) NOT NULL,
    user_pass  VARCHAR(50) NOT NULL,
	user_type ENUM('citizen','volunteer','admin') NOT NULL,
    PRIMARY KEY(user_id)
);

CREATE TABLE citizen(
    cit_name VARCHAR(20)NOT NULL,
    cit_laname VARCHAR(20) NOT NULL,
    cit_id INT NOT NULL,
    cit_long FLOAT NOT NULL, 
    cit_lat FLOAT NOT NULL,
    cit_number VARCHAR(20) NOT NULL, 
    PRIMARY KEY(cit_id),
	CONSTRAINT CITID FOREIGN KEY (cit_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
	);

CREATE TABLE volunteer(
    vol_name VARCHAR(20) NOT NULL,
    vol_lname VARCHAR(20) NOT NULL,
    vol_id INT NOT NULL,
    vol_long FLOAT NOT NULL, 
    vol_lat FLOAT NOT NULL,
    vol_num VARCHAR(20) NOT NULL,
    PRIMARY KEY(vol_id),
	CONSTRAINT VOLID FOREIGN KEY (vol_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
	);

CREATE TABLE categories(
    cat_id INT NOT NULL AUTO_INCREMENT,
    cat_name VARCHAR(30) NOT NULL,
    PRIMARY KEY(cat_id)
    );

CREATE TABLE base(
    id INT(20) NOT NULL,
    longtitude FLOAT NOT NULL,
    latitude FLOAT NOT NULL,
    PRIMARY KEY (id)
  );

CREATE TABLE product(
    pr_name VARCHAR(50) NOT NULL,
    pr_id INT NOT NULL AUTO_INCREMENT,
    pr_cat_id INT NOT NULL,
    detail_name VARCHAR(50),
    detail_value INT,
    PRIMARY KEY(pr_id, pr_cat_id),
    CONSTRAINT PRODUCTCATEGORY FOREIGN KEY (pr_cat_id)
    REFERENCES categories(cat_id)
    ON DELETE CASCADE ON UPDATE CASCADE
    );

CREATE TABLE base_load (
    asdaa INT(11) NOT NULL AUTO_INCREMENT,
    base_id INT(11) NULL DEFAULT 0,
    pr_id INT(11) NULL DEFAULT NULL,
    pr_quantity INT(11) NULL DEFAULT NULL,
    PRIMARY KEY (asdaa),
    CONSTRAINT base_load_ibfk_1
    FOREIGN KEY (base_id)
    REFERENCES base (id),
    CONSTRAINT base_load_ibfk_2
    FOREIGN KEY (pr_id)
    REFERENCES product (pr_id)
    );

	
CREATE TABLE demands(
    dem_id INT NOT NULL AUTO_INCREMENT,
    dem_cit_id INT NOT NULL,
    dem_pr_id INT NOT NULL,
    dem_value INT,
    dem_type ENUM('request','donation') NOT NULL,
    PRIMARY KEY(dem_id, dem_cit_id, dem_pr_id),
    CONSTRAINT DEMPROD FOREIGN KEY(dem_pr_id)
    REFERENCES product(pr_id)
    ON DELETE CASCADE ON UPDATE CASCADE, 
    CONSTRAINT DEMCIT FOREIGN KEY(dem_cit_id)
    REFERENCES citizen(cit_id)
    ON DELETE CASCADE ON UPDATE CASCADE
    ); 
	
CREATE TABLE task(
    task_id INT NOT NULL AUTO_INCREMENT,
    task_dem_id INT NOT NULL,
    task_submission_date DATETIME NOT NULL,
    task_acceptance_date DATETIME,
    task_completion_date DATETIME,
    task_status ENUM('Complete','Not Complete') NOT NULL,
    PRIMARY KEY(task_id, task_dem_id),
    CONSTRAINT TASKDEM FOREIGN KEY(task_dem_id)
    REFERENCES demands(dem_id)
    ON DELETE CASCADE ON UPDATE CASCADE
    );
	
CREATE TABLE accepts(
    acc_vol_id INT NOT NULL,
    acc_task_id INT NOT NULL,
    PRIMARY KEY(acc_vol_id, acc_task_id),
    CONSTRAINT ACCEPTTASK FOREIGN KEY(acc_task_id)
    REFERENCES task(task_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT VOLTASK FOREIGN KEY(acc_vol_id)
    REFERENCES volunteer(vol_id)
    ON DELETE CASCADE ON UPDATE CASCADE
    );
	
CREATE TABLE vehicle(
    veh_id INT NOT NULL AUTO_INCREMENT,
    veh_vol_id INT NOT NULL,
    veh_task_num INT NOT NULL,
	longtitude FLOAT NOT NULL,
	latitude FLOAT NOT NULL,
    PRIMARY KEY(veh_id, veh_vol_id),
    CONSTRAINT VEHICLEVOL FOREIGN KEY(veh_vol_id)
    REFERENCES volunteer(vol_id)
    ON DELETE CASCADE ON UPDATE CASCADE
    );
	
CREATE TABLE veh_load(
    veh_load_id INT NOT NULL,
    veh_load_prod INT NOT NULL,
    pr_quantity INT(11) NOT NULL,
    PRIMARY KEY(veh_load_id, veh_load_prod),
    CONSTRAINT VEHICLELOAD FOREIGN KEY(veh_load_id)
    REFERENCES vehicle(veh_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT LOADPRODUCT FOREIGN KEY(veh_load_prod)
    REFERENCES product(pr_id)
    ON DELETE CASCADE ON UPDATE CASCADE
    );

CREATE TABLE announcements(
    ann_id INT NOT NULL AUTO_INCREMENT,
    ann_pr_id INT NOT NULL,
    ann_value INT,
    PRIMARY KEY(ann_id, ann_pr_id),
    CONSTRAINT ANNPROD FOREIGN KEY(ann_pr_id)
    REFERENCES product(pr_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);


INSERT INTO users VALUES(NULL,'emmo','ytrfgbgf','citizen');
INSERT INTO users VALUES(NULL,'ginorton','gffg5tr','volunteer');
INSERT INTO users VALUES(NULL,'markkennei','hgfnf6543','volunteer');
INSERT INTO users VALUES(NULL,'louipetr','ghfefgb43','volunteer');
INSERT INTO users VALUES(NULL,'sergkrist','4532432','citizen');
INSERT INTO users VALUES(NULL,'georgerin','65433rthgr','citizen');
INSERT INTO users VALUES(NULL,'jonburg','nbbgf5','citizen');
INSERT INTO users VALUES(NULL,'nikosvoulg','thedarkknight','admin');
INSERT INTO users VALUES(NULL,'aggelos','hggfrs','citizen');
	
	
INSERT INTO volunteer VALUES('Gina', 'Norton', 2, 21.7350, 38.2420, 7564565);
INSERT INTO volunteer VALUES('Marc', 'Kein', 3 , 21.7322, 38.2462, 654357);
INSERT INTO volunteer VALUES('Louise', 'Peterson', 4, 21.7389, 38.2485, 6543565);


INSERT INTO citizen VALUES('Emmanuel', 'Moratti', 1 , 21.7349, 38.2444, 546544654);
INSERT INTO citizen VALUES('Sergei', 'Kristov', 5 , 21.7330, 38.2410, 4532432);
INSERT INTO citizen VALUES('George', 'Erin', 6 , 21.7320, 38.2450, 7655677);
INSERT INTO citizen VALUES('Jonas', 'Burgmann', 7 , 21.7325, 38.2430, 7654352);
INSERT INTO citizen VALUES('Aggelos', 'Voulgaris', 9 , 21.7369, 38.2469, 6971662770);


INSERT INTO categories VALUES(NULL, 'FOOD');
INSERT INTO categories VALUES(NULL, 'HYGIENE');
INSERT INTO categories VALUES(NULL, 'MEDICAL_SUPPLIES');
INSERT INTO categories VALUES(NULL, 'CLOTHING');


INSERT INTO product VALUES('Water', NULL, 1, 'Bottles', 2);
INSERT INTO product VALUES('Milk', NULL, 1, 'Bottles', 1);
INSERT INTO product VALUES('Winter Gloves', NULL, 4, 'Pair', 1);
INSERT INTO product VALUES('Winter Socks', NULL, 4, 'Pair', 2);
INSERT INTO product VALUES('Hand Sanitizer', NULL, 2, 'Bottle', 1);
INSERT INTO product VALUES('Hand Wipes', NULL, 2, 'Pack', 1);
INSERT INTO product VALUES('Pasta', NULL, 1, 'Pack', 1);
INSERT INTO product VALUES('Toothbrush', NULL, 2, 'Pack', 1);
INSERT INTO product VALUES('Depon', NULL, 3, 'Pack', 1);
INSERT INTO product VALUES('Toothpaste', NULL, 2, 'Tube', 1);


INSERT INTO demands VALUES(NULL, 1, 1, 5, 'request');
INSERT INTO demands VALUES(NULL, 1, 2, 3, 'request');
INSERT INTO demands VALUES(NULL, 6, 7, 2, 'request');
INSERT INTO demands VALUES(NULL, 9, 9, 2, 'request');


INSERT INTO demands VALUES(NULL, 5, 2, 3, 'donation');
INSERT INTO demands VALUES(NULL, 5, 7, 2, 'donation');
INSERT INTO demands VALUES(NULL, 7, 9, 3, 'donation');


INSERT INTO task VALUES(NULL, 1, '2024-01-09 16:53:50', NULL, NULL, 'Not Complete');
INSERT INTO task VALUES(NULL, 2, '2024-01-06 16:53:50', NULL, NULL, 'Not Complete');
INSERT INTO task VALUES(NULL, 3, '2024-01-31 16:53:50', NULL ,NULL ,'Not Complete');
INSERT INTO task VALUES(NULL, 4, CURRENT_TIMESTAMP, NULL, NULL, 'Not Complete');
INSERT INTO task VALUES(NULL, 5, '2024-02-02 16:53:50', NULL ,NULL ,'Not Complete');
INSERT INTO task VALUES(NULL, 6, '2024-02-01 16:53:50', NULL, NULL, 'Not Complete');
INSERT INTO task VALUES(NULL, 7, CURRENT_TIMESTAMP, NULL ,NULL ,'Not Complete');


INSERT INTO vehicle VALUES(NULL, 2, 0, 21.7398, 38.2420);
INSERT INTO vehicle VALUES(NULL, 3, 0, 21.7322, 38.2462);
INSERT INTO vehicle VALUES(NULL, 4, 0, 21.7389, 38.2485);


INSERT INTO announcements VALUES(NULL, 1, 5);
INSERT INTO announcements VALUES(NULL, 2, 3);
INSERT INTO announcements VALUES(NULL, 7, 2);
INSERT INTO announcements VALUES(NULL, 9, 2);


INSERT INTO base VALUES(1, 21.7351, 38.2462);


DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_to_base`(IN `in_pr_id` INT, IN `base_quantity` INT)
BEGIN
    SELECT 'HERE';
    IF base_quantity<= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid quantity';
    END IF;

    SELECT detail_value INTO @pr_quantity FROM disaster_supply_database.product WHERE pr_id = in_pr_id;

    IF @pr_quantity < base_quantity OR @pr_quantity IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Requested quantity is not available';

    ELSE 
	UPDATE disaster_supply_database.product SET detail_value = @pr_quantity - base_quantity WHERE pr_id = in_pr_id;
    END IF;        


    IF EXISTS (SELECT * FROM disaster_supply_database.base_load WHERE pr_id=in_pr_id) THEN
        UPDATE disaster_supply_database.base_load SET pr_quantity = pr_quantity + base_quantity WHERE pr_id = in_pr_id;
    ELSE
        INSERT INTO disaster_supply_database.base_load VALUES (NULL, 1, in_pr_id, base_quantity);
    END IF;
END$$
DELIMITER ;



DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `CancelTaskProc`(IN `in_volunteer_id` INT, IN `in_task_id` INT)
BEGIN
    DECLARE v_row_count INT;

    -- Check if there is a row in accepts with the specified volunteer_id and task_id
    SELECT COUNT(*) INTO v_row_count
    FROM disaster_supply_database.accepts
    WHERE acc_vol_id = in_volunteer_id AND acc_task_id = in_task_id;

    IF v_row_count > 0 THEN
        -- If the row exists, delete it
        DELETE FROM disaster_supply_database.accepts
        WHERE acc_vol_id = in_volunteer_id AND acc_task_id = in_task_id;

        -- Update task_acceptance_date to null in the task table
        UPDATE disaster_supply_database.task
        SET task_acceptance_date = NULL
        WHERE task_id = in_task_id;

        SELECT 'Task acceptance processed successfully.' AS result;
    ELSE
        -- If the row doesn't exist, throw an error
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Task acceptance not found.';
    END IF;
END$$
DELIMITER ;



DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `CompleteTaskProc`(IN `in_volunteer_id` INT, IN `in_task_id` INT)
BEGIN
    DECLARE v_sum DECIMAL(10, 2);
    DECLARE v_pr_id DECIMAL(10, 2);
    DECLARE v_dem_type VARCHAR(255);

    -- Check if task_id exists in accepts table
    IF EXISTS (SELECT * FROM disaster_supply_database.accepts WHERE acc_vol_id = in_volunteer_id AND acc_task_id = in_task_id) THEN
        -- Retrieve necessary data from task, product, and demands tables
        SELECT demands.dem_value AS sum,
               product.pr_id,
               demands.dem_type
        INTO v_sum, v_pr_id, v_dem_type
        FROM disaster_supply_database.task
        JOIN disaster_supply_database.demands ON task.task_dem_id = demands.dem_id
        JOIN disaster_supply_database.product ON demands.dem_pr_id = product.pr_id
        WHERE task.task_id = in_task_id;
		
		SET @veh_id := (SELECT veh_id FROM disaster_supply_database.vehicle WHERE veh_vol_id = in_volunteer_id);
		
        -- Check dem_type and update veh_load accordingly
        IF v_dem_type = 'request' THEN
            -- Subtract the sum from veh_load.pr_quantity (if enough quantity is available)
            UPDATE disaster_supply_database.veh_load
            SET pr_quantity = pr_quantity - v_sum
            WHERE veh_load_id = @veh_id
            AND pr_quantity >= v_sum AND veh_load_prod=v_pr_id;

            -- Check if the update was successful
            IF ROW_COUNT() = 0 THEN
                SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Not enough quantity available in veh_load for the request.';
            END IF;
        ELSEIF v_dem_type = 'donation' THEN
            -- Check if the row exists in veh_load for the donation product
            SET @veh_load_id := (SELECT veh_load_id FROM disaster_supply_database.veh_load WHERE veh_load_id = @veh_id AND veh_load_prod = v_pr_id);

            IF @veh_load_id IS NULL THEN
                -- If the row doesn't exist, create one with the given values
                INSERT INTO disaster_supply_database.veh_load (veh_load_id, veh_load_prod, pr_quantity)
                VALUES (@veh_id, v_pr_id, v_sum);
            ELSE
                -- If the row exists, add the sum to veh_load.pr_quantity
                UPDATE disaster_supply_database.veh_load
                SET pr_quantity = pr_quantity + v_sum
                WHERE veh_load_id = @veh_load_id;
            END IF;
        END IF;

        -- Update task_completion_date and task_status in the task table
        UPDATE disaster_supply_database.task
        SET task_completion_date = NOW(),
            task_status = 'Complete'
        WHERE task_id = in_task_id;

        -- Delete the row from accepts table
        DELETE FROM disaster_supply_database.accepts
        WHERE acc_vol_id = in_volunteer_id AND acc_task_id = in_task_id;
    ELSE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Task not found in accepts table.';
    END IF;
END$$
DELIMITER ;


DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `load_from_base`(IN `in_quantity` INT(1), IN `in_veh_id` INT(1), IN `in_pr_id` INT(5))
BEGIN

    SELECT 'HERE';

    IF in_quantity <= 0 THEN

        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid quantity';

    END IF;



    SELECT pr_quantity INTO @pr_quantity FROM base_load WHERE pr_id = in_pr_id;

    IF @pr_quantity < in_quantity OR @pr_quantity IS NULL THEN

        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Not enough items';

    ELSEIF @pr_quantity = in_quantity THEN

        DELETE FROM base_load WHERE pr_id = in_pr_id;

    ELSE

        UPDATE base_load SET pr_quantity = @pr_quantity - in_quantity WHERE pr_id = in_pr_id;

    END IF;



    IF EXISTS (SELECT * FROM veh_load WHERE veh_load_prod = in_pr_id AND veh_load_id = in_veh_id) THEN

    	SELECT CONCAT('The value of x is ', in_quantity);

        UPDATE veh_load SET pr_quantity = pr_quantity + in_quantity WHERE veh_load_prod = in_pr_id AND veh_load_id = in_veh_id;

    ELSE

        INSERT INTO veh_load (veh_load_id, veh_load_prod, pr_quantity) VALUES (in_veh_id, in_pr_id, in_quantity);

    END IF;
END$$
DELIMITER ;


DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `load_to_base`(IN `in_veh_load_id` INT)
BEGIN

    DECLARE done INT DEFAULT FALSE;

    DECLARE v_prod_id INT;

    DECLARE v_quantity INT;

    DECLARE cur CURSOR FOR SELECT veh_load_prod, pr_quantity FROM disaster_supply_database.veh_load WHERE veh_load_id = in_veh_load_id;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    

    OPEN cur;

    

    read_loop: LOOP

        FETCH cur INTO v_prod_id, v_quantity;

        IF done THEN

            LEAVE read_loop;

        END IF;

        SELECT CONCAT('The value of quantity is ', v_quantity);

        DELETE FROM veh_load WHERE veh_load_id = in_veh_load_id AND veh_load_prod = v_prod_id;

        IF EXISTS (SELECT * FROM base_load WHERE pr_id = v_prod_id) THEN

            UPDATE disaster_supply_database.base_load SET pr_quantity = pr_quantity + v_quantity WHERE pr_id = v_prod_id;

        ELSE

            INSERT INTO disaster_supply_database.base_load VALUES (NULL, 1, v_prod_id, v_quantity);

        END IF;

    END LOOP;

    

    CLOSE cur;
END$$
DELIMITER ;





DELIMITER $$
CREATE TRIGGER `update_task1` BEFORE INSERT ON `accepts` FOR EACH ROW UPDATE `task`

    SET `task`.`task_acceptance_date` = CURRENT_TIMESTAMP

    WHERE `task`.`task_id` = NEW.`acc_task_id`
$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER `update_veh1` BEFORE INSERT ON `accepts` FOR EACH ROW UPDATE `vehicle`
	
    SET `vehicle`.`veh_task_num` = `vehicle`.`veh_task_num`+1

    WHERE `vehicle`.`veh_vol_id` = NEW.`acc_vol_id`
$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER `update_veh2` BEFORE DELETE ON `accepts` FOR EACH ROW UPDATE `vehicle`

    SET `vehicle`.`veh_task_num` = `vehicle`.`veh_task_num`-1

    WHERE `vehicle`.`veh_vol_id` = OLD.`acc_vol_id`
$$
DELIMITER ;