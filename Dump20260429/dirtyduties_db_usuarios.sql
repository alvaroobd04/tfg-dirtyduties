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
  `must_change_password` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_apodo` (`user_apodo`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'alvaro03','alvaro@gmail.com','alvaro','0balzqez','2343434',0),(2,'alvaro123','alvaro1@gmail.com','Alvaro','Garcia','$2b$10$Gx.SmnzbPAiJDM113koHNenLNTQqsr9q9z4OEEALSaoV2umZcRlfS',0),(3,'pedro','alvaro12323@gmail.com','PEDRO','Garcia','$2b$10$4iApXW0GzEoMcmwAqKFkJOYkrRTYAyQ/JcpDjhRsNYyIA.iMKk41y',0),(4,'alvaro123434','alvaro1232343@gmail.com','Al','Garcia','$2b$10$qzDQVSHtDiZAC8XZQdbyx.42L.cS7bgfF2KMkYoKSXB/pC6WElEWu',0),(5,'alvaro123433334','alvaro1232343333@gmail.com','Al','233','$2b$10$HSYCID6A8K2OMXe5Y3Gy3OR7L7jiesi2mNTKIs/ZsU.zDMoXv/42u',0),(6,'alvaro1223233433334','3@gmail.com','Al','233','$2b$10$0ipzJO3OdanygQ3I5x0V2O3XlYTFt.IfmQsKE0vs7K3XzejRGY9AO',0),(7,'alvaroobd','alvarobd76@gmail.com','Al','233','$2b$10$..t6Tb/Tf1MhpwUAus4TzuxaSI58l9r8r3dlV347eW1XU0pZGRbE2',0),(8,'pepe','pepe23@gmail.com','pepe','233','$2b$10$sUMe0l.PuzafFFl6gfRh/OB2.ZB6pgQW/rNz3A..IcyeEKxIqaR7y',0),(9,'hola','hola@gmail.com','oasdfsd','sdrfsdf','$2b$10$GRBYYSOw6ILN1tZ5sNaQvuBlkiFaQwpAbmbpFs1Lmzph/fELD//9C',0),(10,'pedro23','pedro@gmail.com','pedro','picapiedra','$2b$10$oNirm78DY7U5E3//kS12Q.HRFveHeA.rOj/uJfe4wGoXXuYC4PXZe',0),(11,'pedrito','pedro12@gmail.com','pedro','picapiedra','$2b$10$z71ZMkDYgdjCg.jP0PbxdONe21tJTHYO2u0r8EdFySOmgGbEHO6w.',0),(12,'prueba1','alvarobd76@usal.es','prueba','pruebas','$2b$10$ArE8AQsWq..h2HqRgNE75.7xw.wQvONv10jiropq9jh3mCpQLW1cW',0);
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

-- Dump completed on 2026-04-29 22:53:19
