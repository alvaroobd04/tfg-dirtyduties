-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: dirtyduties_db
-- ------------------------------------------------------
-- Server version	8.4.2

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
-- Table structure for table `intercambios`
--

DROP TABLE IF EXISTS `intercambios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `intercambios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `casa_id` int NOT NULL,
  `solicitante_id` int NOT NULL,
  `ejecucion_solicitante_id` int NOT NULL,
  `destinatario_id` int NOT NULL,
  `ejecucion_destinatario_id` int NOT NULL,
  `estado` enum('pendiente','aceptado','rechazado','cancelado') NOT NULL DEFAULT 'pendiente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `casa_id` (`casa_id`),
  KEY `solicitante_id` (`solicitante_id`),
  KEY `destinatario_id` (`destinatario_id`),
  KEY `ejecucion_solicitante_id` (`ejecucion_solicitante_id`),
  KEY `ejecucion_destinatario_id` (`ejecucion_destinatario_id`),
  CONSTRAINT `intercambios_ibfk_1` FOREIGN KEY (`casa_id`) REFERENCES `casa` (`id`) ON DELETE CASCADE,
  CONSTRAINT `intercambios_ibfk_2` FOREIGN KEY (`solicitante_id`) REFERENCES `usuarios` (`user_id`),
  CONSTRAINT `intercambios_ibfk_3` FOREIGN KEY (`destinatario_id`) REFERENCES `usuarios` (`user_id`),
  CONSTRAINT `intercambios_ibfk_4` FOREIGN KEY (`ejecucion_solicitante_id`) REFERENCES `ejecucion` (`id`),
  CONSTRAINT `intercambios_ibfk_5` FOREIGN KEY (`ejecucion_destinatario_id`) REFERENCES `ejecucion` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `intercambios`
--

LOCK TABLES `intercambios` WRITE;
/*!40000 ALTER TABLE `intercambios` DISABLE KEYS */;
INSERT INTO `intercambios` VALUES (1,22,12,4041,8,4042,'pendiente','2026-04-26 15:14:24','2026-04-26 15:14:24'),(2,22,12,4041,8,4042,'pendiente','2026-04-26 15:16:20','2026-04-26 15:16:20'),(3,22,12,4041,8,4042,'pendiente','2026-04-26 15:16:38','2026-04-26 15:16:38'),(4,22,12,4041,8,4042,'pendiente','2026-04-26 15:17:06','2026-04-26 15:17:06'),(5,22,12,4041,8,4042,'aceptado','2026-04-26 15:17:44','2026-04-26 15:17:55'),(6,22,8,4040,12,4042,'aceptado','2026-04-26 15:21:45','2026-04-26 15:22:08');
/*!40000 ALTER TABLE `intercambios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-29 22:53:18
