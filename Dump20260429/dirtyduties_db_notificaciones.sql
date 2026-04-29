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
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `ejecucion_id` int DEFAULT NULL,
  `tipo` enum('castigo','recordatorio','intercambio_propuesta','intercambio_aceptado','intercambio_rechazado','vacaciones') NOT NULL,
  `mensaje` varchar(255) NOT NULL,
  `leida` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `intercambio_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_notif_usuario` (`usuario_id`),
  KEY `fk_notif_ejecucion` (`ejecucion_id`),
  KEY `fk_notif_intercambio` (`intercambio_id`),
  CONSTRAINT `fk_notif_ejecucion` FOREIGN KEY (`ejecucion_id`) REFERENCES `ejecucion` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_notif_intercambio` FOREIGN KEY (`intercambio_id`) REFERENCES `intercambios` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_notif_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
INSERT INTO `notificaciones` VALUES (1,2,3803,'recordatorio','Recuerda: mañana tienes que hacer \"hola q tal\"',0,'2026-04-26 12:53:40',NULL),(2,8,3804,'recordatorio','Recuerda: mañana tienes que hacer \"aaaaaaaaa\"',1,'2026-04-26 12:53:40',NULL),(3,8,3958,'recordatorio','Recuerda: mañana tienes que hacer \"limpiar cocina\"',1,'2026-04-26 12:53:40',NULL),(4,8,3959,'recordatorio','Recuerda: mañana tienes que hacer \"limpiar baño\"',1,'2026-04-26 12:53:40',NULL),(5,8,3960,'recordatorio','Recuerda: mañana tienes que hacer \"ordenar habitacion\"',1,'2026-04-26 12:53:40',NULL),(6,2,4019,'recordatorio','Recuerda: mañana tienes que hacer \"Limpiar baño\"',0,'2026-04-26 12:53:40',NULL),(7,3,4020,'recordatorio','Recuerda: mañana tienes que hacer \"Limpiar cocina\"',0,'2026-04-26 12:53:40',NULL),(8,2,3803,'recordatorio','Recuerda: mañana tienes que hacer \"hola q tal\"',0,'2026-04-26 12:55:57',NULL),(9,8,3804,'recordatorio','Recuerda: mañana tienes que hacer \"aaaaaaaaa\"',1,'2026-04-26 12:55:57',NULL),(10,8,3958,'recordatorio','Recuerda: mañana tienes que hacer \"limpiar cocina\"',1,'2026-04-26 12:55:57',NULL),(11,8,3959,'recordatorio','Recuerda: mañana tienes que hacer \"limpiar baño\"',1,'2026-04-26 12:55:57',NULL),(12,8,3960,'recordatorio','Recuerda: mañana tienes que hacer \"ordenar habitacion\"',1,'2026-04-26 12:55:57',NULL),(13,2,4019,'recordatorio','Recuerda: mañana tienes que hacer \"Limpiar baño\"',0,'2026-04-26 12:55:57',NULL),(14,3,4020,'recordatorio','Recuerda: mañana tienes que hacer \"Limpiar cocina\"',0,'2026-04-26 12:55:57',NULL),(15,2,3803,'recordatorio','Alvaro, mañana tienes que hacer \"hola q tal\"',0,'2026-04-26 13:01:49',NULL),(16,8,3804,'recordatorio','pepe, mañana tienes que hacer \"aaaaaaaaa\"',1,'2026-04-26 13:01:49',NULL),(17,8,3958,'recordatorio','pepe, mañana tienes que hacer \"limpiar cocina\"',1,'2026-04-26 13:01:49',NULL),(18,8,3959,'recordatorio','pepe, mañana tienes que hacer \"limpiar baño\"',1,'2026-04-26 13:01:50',NULL),(19,8,3960,'recordatorio','pepe, mañana tienes que hacer \"ordenar habitacion\"',1,'2026-04-26 13:01:50',NULL),(20,2,4019,'recordatorio','Alvaro, mañana tienes que hacer \"Limpiar baño\"',0,'2026-04-26 13:01:50',NULL),(21,3,4020,'recordatorio','PEDRO, mañana tienes que hacer \"Limpiar cocina\"',0,'2026-04-26 13:01:50',NULL),(22,2,3803,'recordatorio','Alvaro, mañana tienes que hacer \"hola q tal\"',0,'2026-04-26 13:08:47',NULL),(23,8,3804,'recordatorio','pepe, mañana tienes que hacer \"aaaaaaaaa\"',1,'2026-04-26 13:08:47',NULL),(24,8,3958,'recordatorio','pepe, mañana tienes que hacer \"limpiar cocina\"',1,'2026-04-26 13:08:47',NULL),(25,8,3959,'recordatorio','pepe, mañana tienes que hacer \"limpiar baño\"',1,'2026-04-26 13:08:47',NULL),(26,8,3960,'recordatorio','pepe, mañana tienes que hacer \"ordenar habitacion\"',1,'2026-04-26 13:08:47',NULL),(27,2,4019,'recordatorio','Alvaro, mañana tienes que hacer \"Limpiar baño\"',0,'2026-04-26 13:08:47',NULL),(28,3,4020,'recordatorio','PEDRO, mañana tienes que hacer \"Limpiar cocina\"',0,'2026-04-26 13:08:47',NULL),(29,2,3803,'recordatorio','Alvaro, mañana tienes que hacer \"hola q tal\"',0,'2026-04-26 13:16:45',NULL),(30,8,3804,'recordatorio','pepe, mañana tienes que hacer \"aaaaaaaaa\"',1,'2026-04-26 13:16:45',NULL),(31,8,3958,'recordatorio','pepe, mañana tienes que hacer \"limpiar cocina\"',1,'2026-04-26 13:16:45',NULL),(32,8,3959,'recordatorio','pepe, mañana tienes que hacer \"limpiar baño\"',1,'2026-04-26 13:16:45',NULL),(33,8,3960,'recordatorio','pepe, mañana tienes que hacer \"ordenar habitacion\"',1,'2026-04-26 13:16:45',NULL),(34,2,4019,'recordatorio','Alvaro, mañana tienes que hacer \"Limpiar baño\"',0,'2026-04-26 13:16:45',NULL),(35,3,4020,'recordatorio','PEDRO, mañana tienes que hacer \"Limpiar cocina\"',0,'2026-04-26 13:16:45',NULL),(36,2,3803,'recordatorio','Alvaro, mañana tienes que hacer \"hola q tal\"',0,'2026-04-26 13:19:22',NULL),(37,8,3804,'recordatorio','pepe, mañana tienes que hacer \"aaaaaaaaa\"',0,'2026-04-26 13:19:22',NULL),(38,8,3958,'recordatorio','pepe, mañana tienes que hacer \"limpiar cocina\"',1,'2026-04-26 13:19:22',NULL),(39,8,3959,'recordatorio','pepe, mañana tienes que hacer \"limpiar baño\"',1,'2026-04-26 13:19:22',NULL),(40,8,3960,'recordatorio','pepe, mañana tienes que hacer \"ordenar habitacion\"',1,'2026-04-26 13:19:22',NULL),(41,2,4019,'recordatorio','Alvaro, mañana tienes que hacer \"Limpiar baño\"',0,'2026-04-26 13:19:22',NULL),(42,3,4020,'recordatorio','PEDRO, mañana tienes que hacer \"Limpiar cocina\"',0,'2026-04-26 13:19:22',NULL),(43,2,3803,'recordatorio','Alvaro, mañana tienes que hacer \"hola q tal\"',0,'2026-04-26 13:23:12',NULL),(44,8,3804,'recordatorio','pepe, mañana tienes que hacer \"aaaaaaaaa\"',0,'2026-04-26 13:23:12',NULL),(45,8,3958,'recordatorio','pepe, mañana tienes que hacer \"limpiar cocina\"',1,'2026-04-26 13:23:12',NULL),(46,8,3959,'recordatorio','pepe, mañana tienes que hacer \"limpiar baño\"',1,'2026-04-26 13:23:12',NULL),(47,8,3960,'recordatorio','pepe, mañana tienes que hacer \"ordenar habitacion\"',1,'2026-04-26 13:23:12',NULL),(48,2,4019,'recordatorio','Alvaro, mañana tienes que hacer \"Limpiar baño\"',0,'2026-04-26 13:23:12',NULL),(49,3,4020,'recordatorio','PEDRO, mañana tienes que hacer \"Limpiar cocina\"',0,'2026-04-26 13:23:12',NULL),(50,8,NULL,'intercambio_propuesta','Tienes una propuesta de intercambio: \"limpiar baño\" (tuya) por \"limpiar baño\" (del solicitante)',1,'2026-04-26 17:17:44',5),(51,12,NULL,'intercambio_aceptado','Tu propuesta de intercambio ha sido aceptada ✅',1,'2026-04-26 17:17:55',5),(52,12,NULL,'intercambio_propuesta','pepe te propone un intercambio: te da su tarea \"limpiar cocina\" (lunes, 27 de abril) a cambio de tu tarea \"limpiar baño\" (martes, 28 de abril).',1,'2026-04-26 17:21:45',6),(53,8,NULL,'intercambio_aceptado','Tu propuesta de intercambio ha sido aceptada ✅',1,'2026-04-26 17:22:08',6),(54,8,NULL,'vacaciones','Has cancelado tus vacaciones. Tus tareas pendientes te han sido devueltas.',0,'2026-04-26 17:54:43',NULL),(55,8,NULL,'vacaciones','Has cancelado tus vacaciones. Tus tareas pendientes te han sido devueltas.',0,'2026-04-26 18:00:18',NULL),(56,8,NULL,'vacaciones','Has cancelado tus vacaciones. Tus tareas pendientes te han sido devueltas.',0,'2026-04-26 18:04:29',NULL),(57,8,NULL,'vacaciones','Has cancelado tus vacaciones. Tus tareas pendientes te han sido devueltas.',0,'2026-04-26 18:05:40',NULL),(58,8,NULL,'vacaciones','Tus vacaciones del 27 de abril al 7 de mayo han sido registradas. 2 tarea(s) reasignadas a tus compañeros.',0,'2026-04-26 18:05:56',NULL),(59,8,NULL,'vacaciones','Has cancelado tus vacaciones. Tus tareas pendientes te han sido devueltas.',1,'2026-04-26 18:13:31',NULL),(60,8,NULL,'vacaciones','Tus vacaciones del 27 de abril al 2 de mayo han sido registradas. 2 tarea(s) reasignadas a tus compañeros.',1,'2026-04-26 18:21:48',NULL),(61,8,NULL,'vacaciones','Has cancelado tus vacaciones. Tus tareas pendientes te han sido devueltas.',0,'2026-04-26 22:28:36',NULL);
/*!40000 ALTER TABLE `notificaciones` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-29 22:53:19
