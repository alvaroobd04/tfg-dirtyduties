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
-- Table structure for table `casa`
--

DROP TABLE IF EXISTS `casa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `casa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `user_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `casa_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `casa`
--

LOCK TABLES `casa` WRITE;
/*!40000 ALTER TABLE `casa` DISABLE KEYS */;
INSERT INTO `casa` VALUES (1,'Piso Salamanca',8,'2026-02-19 16:50:07');
/*!40000 ALTER TABLE `casa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ejecucion`
--

DROP TABLE IF EXISTS `ejecucion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ejecucion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `casa_id` int NOT NULL,
  `tarea_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `fecha` date NOT NULL,
  `estado` enum('pendiente','completada') NOT NULL DEFAULT 'pendiente',
  PRIMARY KEY (`id`),
  KEY `casa_id` (`casa_id`),
  KEY `tarea_id` (`tarea_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `ejecucion_ibfk_1` FOREIGN KEY (`casa_id`) REFERENCES `casa` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ejecucion_ibfk_2` FOREIGN KEY (`tarea_id`) REFERENCES `tarea` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ejecucion_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ejecucion`
--

LOCK TABLES `ejecucion` WRITE;
/*!40000 ALTER TABLE `ejecucion` DISABLE KEYS */;
/*!40000 ALTER TABLE `ejecucion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `house_users`
--

DROP TABLE IF EXISTS `house_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `house_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `house_id` int NOT NULL,
  `user_id` int NOT NULL,
  `joined_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `house_id` (`house_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `house_users_ibfk_1` FOREIGN KEY (`house_id`) REFERENCES `casa` (`id`) ON DELETE CASCADE,
  CONSTRAINT `house_users_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `house_users`
--

LOCK TABLES `house_users` WRITE;
/*!40000 ALTER TABLE `house_users` DISABLE KEYS */;
/*!40000 ALTER TABLE `house_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invitacion`
--

DROP TABLE IF EXISTS `invitacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invitacion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `casa_id` int NOT NULL,
  `token` varchar(255) NOT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_expiracion` datetime NOT NULL,
  `usada` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `casa_id` (`casa_id`),
  CONSTRAINT `invitacion_ibfk_1` FOREIGN KEY (`casa_id`) REFERENCES `casa` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invitacion`
--

LOCK TABLES `invitacion` WRITE;
/*!40000 ALTER TABLE `invitacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `invitacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` varchar(36) NOT NULL,
  `user_id` int NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires` datetime NOT NULL,
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES ('1c7a118b-01c4-4f87-a81c-8fd75d3b402d',8,'$2b$10$Ab/mMpRv/beAWq8ofXYoRuJZfxj6LRMXLrixLbwmwIO02OldLy7b.','2026-02-26 12:05:55','2026-02-19 12:05:54'),('56aeb905-eabc-409a-93db-d66fbe772bff',8,'$2b$10$29SFlH1LIlTV9RSP1YRuxeXAofJVQhnyeKUzLEz3zDD1SMkx61wvC','2026-02-26 12:05:06','2026-02-19 12:05:05'),('8717bdff-a667-419e-9939-d3e4cbdde6f4',8,'$2b$10$gzRiA0FlihJb6SrhnqP6m.Lq6D.0gU8kPoRw0cor2lLtPuDwS20eq','2026-02-26 12:23:56','2026-02-19 12:23:56'),('b1cc0a3d-c19f-4c1a-af13-20ce69517256',8,'$2b$10$sSQ9bSKrfSWVsjOQyyZrJOQ5gbP4FeWoC4Da5ZIla8t/9NsIiLKp6','2026-02-26 11:43:08','2026-02-19 11:43:08'),('c3c36c1e-47aa-4019-8621-712eb91f3a20',8,'$2b$10$RXHBi7J713m1sbmDWg24euM1SQw76FFbO3HMLuAQWfXOz/2GgRpAa','2026-02-26 16:29:31','2026-02-19 16:29:31'),('cc38ce40-d829-4999-9d4b-f0f2cdd4bebb',8,'$2b$10$njRZpBtgMTCQf6yptEPzR./56Tesc7IQXZdk2TwRHsUEJZZ5UMJBa','2026-02-26 12:04:54','2026-02-19 12:04:54'),('d5dc2f01-e077-47f5-b75d-8acdc2b94630',8,'$2b$10$gzKDO.Tkpn1QMPEVWDKSQuhHgiNiNgyHfopTFPcgdwH3rJb4omMIq','2026-02-26 16:45:33','2026-02-19 16:45:32'),('ddcb3149-5eb2-42be-9763-9e36be141df1',8,'$2b$10$EjNliWbzwWFSQWdMxMVNIOhoXsPOhkz1IhXdKS69EmitOjZjSpAEu','2026-02-26 11:45:05','2026-02-19 11:45:04');
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tarea`
--

DROP TABLE IF EXISTS `tarea`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tarea` (
  `id` int NOT NULL AUTO_INCREMENT,
  `casa_id` int NOT NULL,
  `dificultad` int NOT NULL,
  `periodicidad` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `casa_id` (`casa_id`),
  CONSTRAINT `tarea_ibfk_1` FOREIGN KEY (`casa_id`) REFERENCES `casa` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tarea_chk_1` CHECK ((`dificultad` between 1 and 5)),
  CONSTRAINT `tarea_chk_2` CHECK ((`periodicidad` between 1 and 7))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tarea`
--

LOCK TABLES `tarea` WRITE;
/*!40000 ALTER TABLE `tarea` DISABLE KEYS */;
/*!40000 ALTER TABLE `tarea` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `user_apodo` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `apellidos` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_apodo` (`user_apodo`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-20  9:16:48
