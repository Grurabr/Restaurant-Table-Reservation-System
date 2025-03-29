-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: restaurant2-table-reservation.mysql.database.azure.com    Database: table_reservation
-- ------------------------------------------------------
-- Server version	8.0.40-azure

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `additional_services`
--

DROP TABLE IF EXISTS `additional_services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `additional_services` (
  `id_additional_services` int NOT NULL AUTO_INCREMENT,
  `id_restaurant` int DEFAULT NULL,
  `service_name` varchar(255) NOT NULL,
  `description` text,
  `Price` double DEFAULT NULL,
  PRIMARY KEY (`id_additional_services`),
  KEY `id_restaurant` (`id_restaurant`),
  CONSTRAINT `additional_services_ibfk_1` FOREIGN KEY (`id_restaurant`) REFERENCES `restaurants` (`id_restaurant`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `additional_services`
--

LOCK TABLES `additional_services` WRITE;
/*!40000 ALTER TABLE `additional_services` DISABLE KEYS */;
INSERT INTO `additional_services` VALUES (1,1,'Custom Cake Order','Personalized cake made to order with custom flavors and decorations.',50),(2,1,'Special Menu (Vegan, Gluten-Free, Halal)','Customized dishes for dietary preferences and restrictions.',20),(3,1,'Restaurant Transfer (Taxi / Limousine)','Private car transfer to and from the restaurant.',30),(4,1,'Kids Room with Animator','Dedicated children’s play area with professional supervision.',25),(5,1,'Personal Chef for the Evening','Exclusive dining experience with a private chef at your table.',150),(6,1,'Romantic Dinner on a Yacht','Luxury yacht dining with a custom gourmet meal.',250);
/*!40000 ALTER TABLE `additional_services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `elements`
--

DROP TABLE IF EXISTS `elements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `elements` (
  `id_element` int NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  `role` varchar(45) NOT NULL DEFAULT 'table',
  `width` int NOT NULL DEFAULT '150',
  `height` int NOT NULL DEFAULT '150',
  PRIMARY KEY (`id_element`),
  UNIQUE KEY `id_element_UNIQUE` (`id_element`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `elements`
--

LOCK TABLES `elements` WRITE;
/*!40000 ALTER TABLE `elements` DISABLE KEYS */;
INSERT INTO `elements` VALUES (1,'round_table_4',4,'table',200,200),(2,'round_table_6',6,'table',200,200),(3,'rect_table_sofas',6,'table',250,300),(4,'rect_table_4',4,'table',250,300),(5,'rect_table_6',6,'table',250,350),(6,'round_table_2',2,'table',200,200),(7,'rect_table_2',2,'table',250,200),(8,'rect_table_8',8,'table',250,150);
/*!40000 ALTER TABLE `elements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice`
--

DROP TABLE IF EXISTS `invoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice` (
  `id_invoice` int NOT NULL AUTO_INCREMENT,
  `id_reservation` int DEFAULT NULL,
  `Price` double DEFAULT NULL,
  `VAT` double DEFAULT NULL,
  PRIMARY KEY (`id_invoice`),
  KEY `id_reservation` (`id_reservation`),
  CONSTRAINT `invoice_ibfk_1` FOREIGN KEY (`id_reservation`) REFERENCES `reservation` (`id_reservation`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice`
--

LOCK TABLES `invoice` WRITE;
/*!40000 ALTER TABLE `invoice` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservation`
--

DROP TABLE IF EXISTS `reservation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservation` (
  `id_reservation` int NOT NULL AUTO_INCREMENT,
  `id_restaurant` int DEFAULT NULL,
  `id_table` int DEFAULT NULL,
  `id_user` int DEFAULT NULL,
  `booked` datetime DEFAULT CURRENT_TIMESTAMP,
  `booking_start` datetime DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `confirmation` tinyint DEFAULT NULL,
  `number_of_guests` int DEFAULT '1',
  `additional_services` varchar(45) DEFAULT NULL,
  `reminder_sent` tinyint DEFAULT '0',
  PRIMARY KEY (`id_reservation`),
  KEY `id_restaurant` (`id_restaurant`),
  KEY `id_table` (`id_table`),
  KEY `id_user` (`id_user`),
  CONSTRAINT `reservation_ibfk_1` FOREIGN KEY (`id_restaurant`) REFERENCES `restaurants` (`id_restaurant`),
  CONSTRAINT `reservation_ibfk_2` FOREIGN KEY (`id_table`) REFERENCES `tables` (`id_table`),
  CONSTRAINT `reservation_ibfk_3` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=223 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `restaurant_hours`
--

DROP TABLE IF EXISTS `restaurant_hours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant_hours` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_restaurant` int NOT NULL,
  `day` varchar(20) NOT NULL,
  `open_time` time NOT NULL,
  `close_time` time NOT NULL,
  `is_closed` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_restaurant` (`id_restaurant`,`day`),
  CONSTRAINT `restaurant_hours_ibfk_1` FOREIGN KEY (`id_restaurant`) REFERENCES `restaurants` (`id_restaurant`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=204 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant_hours`
--

LOCK TABLES `restaurant_hours` WRITE;
/*!40000 ALTER TABLE `restaurant_hours` DISABLE KEYS */;
INSERT INTO `restaurant_hours` VALUES (1,1,'Monday','08:00:00','21:00:00',1),(2,1,'Tuesday','14:00:00','22:00:00',0),(3,1,'Wednesday','10:00:00','22:00:00',0),(4,1,'Thursday','10:00:00','16:00:00',0),(5,1,'Friday','09:00:00','23:00:00',0),(6,1,'Saturday','09:00:00','23:00:00',0),(7,1,'Sunday','09:00:00','21:00:00',0);
/*!40000 ALTER TABLE `restaurant_hours` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurant_layout`
--

DROP TABLE IF EXISTS `restaurant_layout`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant_layout` (
  `number` int NOT NULL AUTO_INCREMENT,
  `id_room` int NOT NULL DEFAULT '1',
  `id_element` int NOT NULL,
  `id_table` int DEFAULT NULL,
  `coor_x` int NOT NULL DEFAULT '0',
  `coor_y` int NOT NULL DEFAULT '0',
  `rotation` int NOT NULL DEFAULT '0',
  `width` int DEFAULT NULL,
  `height` int DEFAULT NULL,
  PRIMARY KEY (`number`),
  UNIQUE KEY `number_UNIQUE` (`number`),
  UNIQUE KEY `id_table_UNIQUE` (`id_table`),
  KEY `elementId_idx` (`id_element`),
  KEY `roomId_idx` (`id_room`),
  CONSTRAINT `elementId` FOREIGN KEY (`id_element`) REFERENCES `elements` (`id_element`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `roomId` FOREIGN KEY (`id_room`) REFERENCES `rooms` (`id_room`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tableId` FOREIGN KEY (`id_table`) REFERENCES `tables` (`id_table`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2126 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant_layout`
--

LOCK TABLES `restaurant_layout` WRITE;
/*!40000 ALTER TABLE `restaurant_layout` DISABLE KEYS */;
INSERT INTO `restaurant_layout` VALUES (2095,1,4,4,2107,2517,0,150,150),(2096,1,4,5,2105,2367,0,150,150),(2097,1,1,6,2586,2322,45,150,150),(2098,1,1,7,2315,2324,45,150,150),(2099,1,1,8,2454,2417,0,150,150),(2100,1,3,9,2337,2710,0,150,150),(2101,1,3,10,2488,2710,0,150,150),(2102,1,8,11,2156,2650,-90,150,150),(2103,1,8,12,2819,2650,-90,150,150),(2104,1,3,13,2639,2710,0,150,150),(2105,1,6,14,2681,2229,0,150,150),(2106,1,1,15,2318,2500,45,150,150),(2107,1,1,16,2595,2501,45,150,150),(2108,1,6,1,2103,2230,0,150,150),(2109,1,2,25,2801,2355,0,150,150),(2110,1,5,34,2808,2538,0,150,150),(2111,1,6,2,2298,2229,0,150,150),(2112,1,6,3,2496,2228,0,150,150),(2113,1,2,40,3042,2309,0,150,150),(2114,2,2,17,2242,2250,0,150,150),(2115,2,2,18,2244,2482,0,150,150),(2116,2,1,19,2727,2726,0,150,150),(2117,2,2,20,2518,2254,0,150,150),(2118,2,2,21,2519,2483,0,150,150),(2119,2,4,22,2734,2317,0,150,150),(2120,2,4,23,2736,2478,0,150,150),(2121,2,6,24,2738,2592,0,150,150),(2122,2,1,26,2232,2716,0,150,150),(2123,2,8,28,2472,2683,-90,150,150),(2124,2,2,27,2379,2373,0,150,150),(2125,6,2,41,2020,2310,0,150,150);
/*!40000 ALTER TABLE `restaurant_layout` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurant_special_days`
--

DROP TABLE IF EXISTS `restaurant_special_days`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant_special_days` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_restaurant` int NOT NULL DEFAULT '1',
  `day` date NOT NULL,
  `is_closed` tinyint NOT NULL DEFAULT '0',
  `open_time` time DEFAULT NULL,
  `close_time` time DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `day_UNIQUE` (`day`),
  KEY `restaurantId_fk_1_idx` (`id_restaurant`),
  CONSTRAINT `restaurantId_fk_1` FOREIGN KEY (`id_restaurant`) REFERENCES `restaurants` (`id_restaurant`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant_special_days`
--

LOCK TABLES `restaurant_special_days` WRITE;
/*!40000 ALTER TABLE `restaurant_special_days` DISABLE KEYS */;
INSERT INTO `restaurant_special_days` VALUES (1,1,'2025-01-09',1,NULL,NULL),(2,1,'2025-01-16',0,'14:00:00','23:00:00'),(5,1,'2025-01-17',0,'08:00:00','23:00:00'),(13,1,'2025-03-16',0,'12:00:00','20:00:00'),(14,1,'2025-08-15',1,'09:00:00','23:00:00'),(15,1,'2025-08-16',1,'09:00:00','23:00:00'),(16,1,'2025-08-17',1,'09:00:00','23:00:00'),(17,1,'2025-08-18',1,'09:00:00','23:00:00'),(18,1,'2025-03-14',0,'13:00:00','16:00:00');
/*!40000 ALTER TABLE `restaurant_special_days` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurants`
--

DROP TABLE IF EXISTS `restaurants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurants` (
  `id_restaurant` int NOT NULL AUTO_INCREMENT,
  `name` text,
  `address` text,
  `phone` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`id_restaurant`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurants`
--

LOCK TABLES `restaurants` WRITE;
/*!40000 ALTER TABLE `restaurants` DISABLE KEYS */;
INSERT INTO `restaurants` VALUES (1,'My restaurant','Kuopio, Kauppakatu 2','0450454455');
/*!40000 ALTER TABLE `restaurants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms` (
  `id_room` int NOT NULL AUTO_INCREMENT,
  `floor` int NOT NULL,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id_room`),
  UNIQUE KEY `id_room_UNIQUE` (`id_room`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (1,1,'Main room'),(2,2,'Second room'),(6,1,'ulkotila');
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tables`
--

DROP TABLE IF EXISTS `tables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tables` (
  `id_table` int NOT NULL AUTO_INCREMENT,
  `id_restaurant` int DEFAULT '1',
  `number` varchar(10) NOT NULL DEFAULT '1',
  `capacity` int DEFAULT NULL,
  `neighboring_tables` int DEFAULT NULL,
  `is_deleted` tinyint DEFAULT '0',
  PRIMARY KEY (`id_table`),
  KEY `id_restaurant` (`id_restaurant`),
  CONSTRAINT `tables_ibfk_1` FOREIGN KEY (`id_restaurant`) REFERENCES `restaurants` (`id_restaurant`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tables`
--

LOCK TABLES `tables` WRITE;
/*!40000 ALTER TABLE `tables` DISABLE KEYS */;
INSERT INTO `tables` VALUES (1,1,'1',2,NULL,0),(2,1,'2',2,NULL,0),(3,1,'3',2,NULL,0),(4,1,'4',2,NULL,0),(5,1,'5',4,NULL,0),(6,1,'6',4,NULL,0),(7,1,'7',4,NULL,0),(8,1,'8',4,NULL,0),(9,1,'9',6,NULL,0),(10,1,'10',6,NULL,0),(11,1,'11',8,NULL,0),(12,1,'12',8,NULL,0),(13,1,'13',6,NULL,0),(14,1,'14',2,NULL,0),(15,1,'15',4,NULL,0),(16,1,'16',4,NULL,0),(17,1,'17',6,NULL,0),(18,1,'18',6,NULL,0),(19,1,'19',4,NULL,0),(20,1,'20',6,NULL,0),(21,1,'21',6,NULL,0),(22,1,'22',4,NULL,0),(23,1,'23',4,NULL,0),(24,1,'24',2,NULL,0),(25,1,'25',6,NULL,0),(26,1,'26',4,NULL,0),(27,1,'27',6,NULL,0),(28,1,'28',8,NULL,0),(29,1,'del_29',2,NULL,1),(30,1,'30',6,NULL,0),(31,1,'31',6,NULL,0),(32,1,'32',2,NULL,0),(34,1,'34',6,NULL,0),(35,1,'35',6,NULL,0),(37,1,'del_27',4,NULL,1),(38,1,'66',4,NULL,0),(39,1,'del_39',8,NULL,1),(40,1,'40',6,NULL,0),(41,1,'41',6,NULL,0);
/*!40000 ALTER TABLE `tables` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `unusedtables`
--

DROP TABLE IF EXISTS `unusedtables`;
/*!50001 DROP VIEW IF EXISTS `unusedtables`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `unusedtables` AS SELECT 
 1 AS `id_table`,
 1 AS `number`,
 1 AS `id_restaurant`,
 1 AS `capacity`,
 1 AS `neighboring_tables`,
 1 AS `is_deleted`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id_user` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(200) DEFAULT NULL,
  `last_name` varchar(200) DEFAULT NULL,
  `phone` varchar(200) DEFAULT NULL,
  `email` varchar(200) NOT NULL,
  `role` enum('admin','client') NOT NULL DEFAULT 'client',
  `is_registered` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Final view structure for view `unusedtables`
--

/*!50001 DROP VIEW IF EXISTS `unusedtables`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`restaurant`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `unusedtables` AS select `t`.`id_table` AS `id_table`,`t`.`number` AS `number`,`t`.`id_restaurant` AS `id_restaurant`,`t`.`capacity` AS `capacity`,`t`.`neighboring_tables` AS `neighboring_tables`,`t`.`is_deleted` AS `is_deleted` from `tables` `t` where `t`.`id_table` in (select `rl`.`id_table` from `restaurant_layout` `rl` where (`rl`.`id_table` is not null)) is false */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-29 18:22:50
