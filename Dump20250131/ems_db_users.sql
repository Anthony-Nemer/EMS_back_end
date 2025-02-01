-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: ems_db
-- ------------------------------------------------------
-- Server version	9.1.0

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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fullname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `mobilenumber` varchar(15) NOT NULL,
  `password` varchar(255) NOT NULL,
  `isSupplier` tinyint(1) DEFAULT '0',
  `ishost` tinyint(1) DEFAULT '0',
  `ratings` decimal(3,2) DEFAULT NULL,
  `cuisineId` int DEFAULT NULL,
  `employee_pin` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_serviceId` (`cuisineId`),
  CONSTRAINT `fk_cuisineId` FOREIGN KEY (`cuisineId`) REFERENCES `cuisines` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (3,'John Doe','supplier@gmail.com','+96170000000','$2b$12$J/H49urnqixg4EK9FZoJpO7HhSkIg571goaFzwoqqs31r6kRLtani',1,0,NULL,1,NULL),(6,'Anthony hani Nemer','user@gmail.com','+96196181933092','$2b$12$sUTeJbguNInpHrUoTHqSQO8Bq0flgy5b6e5icaLhIKljMRL7Oj75q',0,0,NULL,NULL,NULL),(7,'Jenny Alpou','host@gmail.com','+96181933092','$2b$12$5ZBLQftH8SSodrmM45m0fO0AeJ4eDJdlJzRd9DOLygltIv3UVnaK2',0,1,NULL,NULL,22222),(8,'user','jennuser@gmail.com','+96179130353','$2b$12$QDcVWIRC4wRPYr9z6JCDZefSC/im6xZqH1xO/opjy3k00D1TJs0UW',0,0,NULL,NULL,NULL),(9,'host','jennhost@gmail.com','+96179130353','$2b$12$xaFu0xeB0sWXFiXFkOiw/.RzdWOXa5I.qZSRnGU7tMelGB4gjEIsm',0,1,NULL,NULL,123),(10,'supplier','jennsupplier@gmail.com','+96179130353','$2b$12$6h6EYhcVP5I3qKE4K9.IPefjkIokpxknDlqzNow6uH0rOWcqu1kNC',1,0,NULL,1,NULL),(27,'test2','test2@gmail.com','+9613000000','$2b$12$jRhCJBPEUTdJ1I0Y9UhqVuzzRZGzQQ3Dz0MNdhAsr/c9RFCB1JiQK',1,0,NULL,3,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-01 22:08:22
