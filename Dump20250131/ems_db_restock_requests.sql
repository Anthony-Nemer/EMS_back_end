-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: ems_db
-- ------------------------------------------------------
-- Server version	8.0.39

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
-- Table structure for table `restock_requests`
--

DROP TABLE IF EXISTS `restock_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restock_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `host_id` int DEFAULT NULL,
  `supplier_id` int DEFAULT NULL,
  `cuisine_id` int DEFAULT NULL,
  `item_name` varchar(255) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `status` enum('pending','approved','denied','accepted') DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `host_id` (`host_id`),
  KEY `supplier_id` (`supplier_id`),
  KEY `cuisine_id` (`cuisine_id`),
  CONSTRAINT `restock_requests_ibfk_1` FOREIGN KEY (`host_id`) REFERENCES `users` (`id`),
  CONSTRAINT `restock_requests_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `users` (`id`),
  CONSTRAINT `restock_requests_ibfk_3` FOREIGN KEY (`cuisine_id`) REFERENCES `cuisines` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restock_requests`
--

LOCK TABLES `restock_requests` WRITE;
/*!40000 ALTER TABLE `restock_requests` DISABLE KEYS */;
INSERT INTO `restock_requests` VALUES (1,9,NULL,3,'rice',50,'pending'),(2,7,3,1,'Baguette',6,'accepted'),(12,7,NULL,1,'test 1',3,'pending'),(14,7,NULL,1,'test 2',3,'pending'),(16,7,NULL,1,'test 3',3,'pending'),(18,7,NULL,1,'test 4',3,'pending'),(20,7,NULL,1,'test 5',3,'pending'),(22,7,NULL,1,'test 6',3,'pending'),(24,7,NULL,1,'test 7',3,'pending'),(26,7,NULL,1,'test 8',3,'pending'),(28,7,NULL,1,'test 9',3,'pending'),(30,7,NULL,1,'test 11',3,'pending'),(31,7,NULL,1,'test 12',1,'pending'),(34,7,NULL,1,'test 13',3,'pending'),(35,7,NULL,1,'test 13',3,'pending');
/*!40000 ALTER TABLE `restock_requests` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-07  0:32:07
