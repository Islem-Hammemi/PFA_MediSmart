CREATE DATABASE  IF NOT EXISTS `medismart` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `medismart`;
-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: medismart
-- ------------------------------------------------------
-- Server version	8.0.44

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
-- Table structure for table `creneaux`
--

DROP TABLE IF EXISTS `creneaux`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `creneaux` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `medecin_id` int unsigned NOT NULL,
  `date_heure_debut` datetime NOT NULL,
  `date_heure_fin` datetime NOT NULL,
  `disponible` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_creneaux_medecin` (`medecin_id`),
  KEY `idx_creneaux_disponible` (`disponible`),
  KEY `idx_creneaux_debut` (`date_heure_debut`),
  CONSTRAINT `fk_creneaux_medecin` FOREIGN KEY (`medecin_id`) REFERENCES `medecins` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_creneaux_dates` CHECK ((`date_heure_fin` > `date_heure_debut`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `creneaux`
--

LOCK TABLES `creneaux` WRITE;
/*!40000 ALTER TABLE `creneaux` DISABLE KEYS */;
/*!40000 ALTER TABLE `creneaux` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dossiers_medicaux`
--

DROP TABLE IF EXISTS `dossiers_medicaux`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dossiers_medicaux` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `patient_id` int unsigned NOT NULL,
  `medecin_id` int unsigned NOT NULL,
  `date_consultation` date NOT NULL,
  `diagnostic` text COLLATE utf8mb4_unicode_ci,
  `traitement` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `duration` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_dossiers_patient` (`patient_id`),
  KEY `idx_dossiers_medecin` (`medecin_id`),
  KEY `idx_dossiers_date` (`date_consultation`),
  CONSTRAINT `fk_dossiers_medecin` FOREIGN KEY (`medecin_id`) REFERENCES `medecins` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_dossiers_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dossiers_medicaux`
--

LOCK TABLES `dossiers_medicaux` WRITE;
/*!40000 ALTER TABLE `dossiers_medicaux` DISABLE KEYS */;
/*!40000 ALTER TABLE `dossiers_medicaux` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evaluations`
--

DROP TABLE IF EXISTS `evaluations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evaluations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `patient_id` int unsigned NOT NULL,
  `medecin_id` int unsigned NOT NULL,
  `rendez_vous_id` int unsigned DEFAULT NULL,
  `note` tinyint unsigned NOT NULL,
  `commentaire` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ticket_id` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_evaluations_rdv` (`rendez_vous_id`),
  KEY `fk_evaluations_patient` (`patient_id`),
  KEY `idx_evaluations_medecin` (`medecin_id`),
  KEY `fk_evaluations_ticket` (`ticket_id`),
  CONSTRAINT `fk_evaluations_medecin` FOREIGN KEY (`medecin_id`) REFERENCES `medecins` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_evaluations_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_evaluations_rdv` FOREIGN KEY (`rendez_vous_id`) REFERENCES `rendez_vous` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_evaluations_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_evaluations_note` CHECK ((`note` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluations`
--

LOCK TABLES `evaluations` WRITE;
/*!40000 ALTER TABLE `evaluations` DISABLE KEYS */;
/*!40000 ALTER TABLE `evaluations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hopital`
--

DROP TABLE IF EXISTS `hopital`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hopital` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `adresse` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `urgences` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `horaires` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hopital`
--

LOCK TABLES `hopital` WRITE;
/*!40000 ALTER TABLE `hopital` DISABLE KEYS */;
/*!40000 ALTER TABLE `hopital` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medecins`
--

DROP TABLE IF EXISTS `medecins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medecins` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `specialite` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero_ordre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `statut` enum('disponible','absent','en_consultation') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'absent',
  `photo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note_moyenne` decimal(3,2) DEFAULT '0.00',
  `nb_evaluations` int unsigned DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_medecins_user` (`user_id`),
  UNIQUE KEY `uk_medecins_ordre` (`numero_ordre`),
  CONSTRAINT `fk_medecins_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medecins`
--

LOCK TABLES `medecins` WRITE;
/*!40000 ALTER TABLE `medecins` DISABLE KEYS */;
INSERT INTO `medecins` VALUES (1,1,'Dermatologie','ORD-2024-001','disponible',NULL,3.30,10),(2,2,'Gynécologie','ORD-2024-002','disponible',NULL,0.00,0),(3,3,'Cardiologie','ORD-2024-003','absent',NULL,0.00,0),(4,4,'Neurologie','ORD-2024-004','absent',NULL,0.00,0),(5,5,'Cardiologie','ORD-2024-005','disponible',NULL,0.00,0),(6,6,'Cardiologie','ORD-2024-006','disponible',NULL,0.00,0),(7,7,'Pédiatrie','ORD-2024-007','disponible',NULL,0.00,0),(8,8,'Orthopédie','ORD-2024-008','absent',NULL,0.00,0),(9,9,'Cardiologie','ORD-2024-009','en_consultation',NULL,0.00,0),(10,10,'Ophtalmologie','ORD-2024-010','disponible',NULL,3.00,4),(11,11,'Psychiatrie','ORD-2024-011','disponible',NULL,0.00,0),(12,12,'Endocrinologie','ORD-2024-012','en_consultation',NULL,3.25,4),(13,13,'Rhumatologie','ORD-2024-013','disponible',NULL,0.00,0),(14,14,'Gastro-enterologie','ORD-2024-014','absent',NULL,0.00,0),(15,15,'Urologie','ORD-2024-015','disponible',NULL,0.00,0),(16,16,'Pneumologie','ORD-2024-016','disponible',NULL,0.00,0),(17,17,'ORL','ORD-2024-017','en_consultation',NULL,0.00,0),(18,18,'Radiologie','ORD-2024-018','disponible',NULL,0.00,0),(19,19,'Anesthesiologie','ORD-2024-019','absent',NULL,0.00,0),(20,20,'Medecine generale','ORD-2024-020','disponible',NULL,0.00,0);
/*!40000 ALTER TABLE `medecins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patients` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `date_naissance` date DEFAULT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_patients_user` (`user_id`),
  CONSTRAINT `fk_patients_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
/*!40000 ALTER TABLE `patients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rendez_vous`
--

DROP TABLE IF EXISTS `rendez_vous`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rendez_vous` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `patient_id` int unsigned NOT NULL,
  `medecin_id` int unsigned NOT NULL,
  `date_heure` datetime NOT NULL,
  `statut` enum('planifie','confirme','annule','termine') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'planifie',
  `motif` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `evaluation_demandee` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_medecin_date` (`medecin_id`,`date_heure`),
  KEY `idx_rdv_patient` (`patient_id`),
  KEY `idx_rdv_medecin` (`medecin_id`),
  KEY `idx_rdv_date_heure` (`date_heure`),
  KEY `idx_rdv_statut` (`statut`),
  CONSTRAINT `fk_rdv_medecin` FOREIGN KEY (`medecin_id`) REFERENCES `medecins` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_rdv_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rendez_vous`
--

LOCK TABLES `rendez_vous` WRITE;
/*!40000 ALTER TABLE `rendez_vous` DISABLE KEYS */;
/*!40000 ALTER TABLE `rendez_vous` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sessions_token` (`token`),
  KEY `fk_sessions_user` (`user_id`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickets` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `patient_id` int unsigned NOT NULL,
  `medecin_id` int unsigned NOT NULL,
  `numero` int unsigned NOT NULL,
  `position` int unsigned NOT NULL DEFAULT '0',
  `statut` enum('en_attente','en_cours','termine','annule') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en_attente',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tickets_patient` (`patient_id`),
  KEY `idx_tickets_medecin` (`medecin_id`),
  KEY `idx_tickets_statut` (`statut`),
  CONSTRAINT `fk_tickets_medecin` FOREIGN KEY (`medecin_id`) REFERENCES `medecins` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_tickets_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('patient','medecin') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'ahmed.belhaj@medismart.tn','$2b$10$j6Jv5gZrVSlNLDbGaKAeteQmww7UqhlNbJTDB7D3RjQZc0ZuthMv6','Belhaj','Ahmed','medecin','2026-03-30 16:06:07','2026-03-30 16:06:07'),(2,'nour.gharbi@medismart.tn','$2b$10$j6Jv5gZrVSlNLDbGaKAeteQmww7UqhlNbJTDB7D3RjQZc0ZuthMv6','Gharbi','Nour','medecin','2026-03-30 16:06:07','2026-03-30 16:06:07'),(3,'islem.hammami@medismart.tn','$2b$10$j6Jv5gZrVSlNLDbGaKAeteQmww7UqhlNbJTDB7D3RjQZc0ZuthMv6','Hammami','Islem','medecin','2026-03-30 16:06:07','2026-03-30 16:06:07'),(4,'syrine.lassoued@medismart.tn','$2b$10$j6Jv5gZrVSlNLDbGaKAeteQmww7UqhlNbJTDB7D3RjQZc0ZuthMv6','Lassoued','Syrine','medecin','2026-03-30 16:06:07','2026-03-30 16:06:07'),(5,'rania.mrad@medismart.tn','$2b$10$j6Jv5gZrVSlNLDbGaKAeteQmww7UqhlNbJTDB7D3RjQZc0ZuthMv6','Mrad','Rania','medecin','2026-03-30 16:06:07','2026-03-30 16:06:07'),(6,'sarra.othmani@medismart.tn','$2b$10$j6Jv5gZrVSlNLDbGaKAeteQmww7UqhlNbJTDB7D3RjQZc0ZuthMv6','Othmani','Sarra','medecin','2026-03-30 16:06:07','2026-03-30 16:06:07'),(7,'shaima.quarteni@medismart.tn','$2b$10$j6Jv5gZrVSlNLDbGaKAeteQmww7UqhlNbJTDB7D3RjQZc0ZuthMv6','Quarteni','Shaima','medecin','2026-03-30 16:06:07','2026-03-30 16:06:07'),(8,'karim.zouari@medismart.tn','$2b$10$j6Jv5gZrVSlNLDbGaKAeteQmww7UqhlNbJTDB7D3RjQZc0ZuthMv6','Zouari','Karim','medecin','2026-03-30 16:06:07','2026-03-30 16:06:07'),(9,'oussema.ayedi@medismart.tn','$2b$10$j6Jv5gZrVSlNLDbGaKAeteQmww7UqhlNbJTDB7D3RjQZc0ZuthMv6','Ayedi','Oussema','medecin','2026-03-30 16:06:07','2026-03-30 16:06:07'),(10,'leila.benali@medismart.tn','$2b$10$j6Jv5gZrVSlNLDbGaKAeteQmww7UqhlNbJTDB7D3RjQZc0ZuthMv6','Ben Ali','Leila','medecin','2026-03-30 16:06:07','2026-03-30 16:06:07'),(11,'mehdi.trabelsi@medismart.tn','$2b$10$j6Jv5gZrVSlNLDbGaKAeteQmww7UqhlNbJTDB7D3RjQZc0ZuthMv6','Trabelsi','Mehdi','medecin','2026-03-30 16:06:07','2026-03-30 16:06:07'),(12,'amira.chaari@medismart.tn','$2b$10$j6Jv5gZrVSlNLDbGaKAeteQmww7UqhlNbJTDB7D3RjQZc0ZuthMv6','Chaari','Amira','medecin','2026-03-30 16:06:07','2026-03-30 16:06:07'),(13,'youssef.sellami@medismart.tn','$2b$10$j6Jv5gZrVSlNLDbGaKAeteQmww7UqhlNbJTDB7D3RjQZc0ZuthMv6','Sellami','Youssef','medecin','2026-03-30 16:06:07','2026-03-30 16:06:07'),(14,'ines.jebali@medismart.tn','$2b$10$j6Jv5gZrVSlNLDbGaKAeteQmww7UqhlNbJTDB7D3RjQZc0ZuthMv6','Jebali','Ines','medecin','2026-03-30 16:06:07','2026-03-30 16:06:07'),(15,'bilel.mahjoub@medismart.tn','$2b$10$j6Jv5gZrVSlNLDbGaKAeteQmww7UqhlNbJTDB7D3RjQZc0ZuthMv6','Mahjoub','Bilel','medecin','2026-03-30 16:06:07','2026-03-30 16:06:07'),(16,'rim.boughanmi@medismart.tn','$2b$10$j6Jv5gZrVSlNLDbGaKAeteQmww7UqhlNbJTDB7D3RjQZc0ZuthMv6','Boughanmi','Rim','medecin','2026-03-30 16:06:07','2026-03-30 16:06:07'),(17,'tarek.ferchichi@medismart.tn','$2b$10$j6Jv5gZrVSlNLDbGaKAeteQmww7UqhlNbJTDB7D3RjQZc0ZuthMv6','Ferchichi','Tarek','medecin','2026-03-30 16:06:07','2026-03-30 16:06:07'),(18,'salma.najar@medismart.tn','$2b$10$j6Jv5gZrVSlNLDbGaKAeteQmww7UqhlNbJTDB7D3RjQZc0ZuthMv6','Najar','Salma','medecin','2026-03-30 16:06:07','2026-03-30 16:06:07'),(19,'omar.riahi@medismart.tn','$2b$10$j6Jv5gZrVSlNLDbGaKAeteQmww7UqhlNbJTDB7D3RjQZc0ZuthMv6','Riahi','Omar','medecin','2026-03-30 16:06:07','2026-03-30 16:06:07'),(20,'fatma.bouaziz@medismart.tn','$2b$10$j6Jv5gZrVSlNLDbGaKAeteQmww7UqhlNbJTDB7D3RjQZc0ZuthMv6','Bouaziz','Fatma','medecin','2026-03-30 16:06:07','2026-03-30 16:06:07'),(21,'farhatkhalifa@gmail.com','$2b$10$ICCNQ6MvojAEn6l8UX.z3.ND6CvtKZOySgOdjTFzOOvkV9Z3I40Ou','khalifa','Farhat','patient','2026-03-30 16:10:12','2026-03-30 16:10:12'),(22,'mohamedamin@gmail.com','$2b$10$GUS7728Pi7AfpuC0dIvnIu.aOC0xyfd.FeoBd4drc78b5LS2yPl2G','hammami','mhamed amin','patient','2026-03-31 22:22:25','2026-03-31 22:22:25'),(23,'test@gmail.com','$2b$10$gX2ou/dpIs5j5BicuRUmBuFaH9y64auKpGKal0T89tS12u0vRMu6u','tasti','test','patient','2026-04-11 22:10:38','2026-04-11 22:10:38'),(24,'hihi@gmail.com','$2b$10$lIztpmS/Rr.XhpQMx3pM3uBvIJYnphErIYPbXolIOzQGcZQZU0r3.','Hammami','islem','patient','2026-04-11 22:51:13','2026-04-11 22:51:13'),(25,'hammami@gmail.com','$2b$10$fbV5ceVZgQAoP7dIbP.kyutThIgD1PxVemYD1BM4bUiLOZJOfhx0O','Hammami','İslem','patient','2026-04-13 20:39:50','2026-04-13 20:39:50'),(26,'hello@gmail.com','$2b$10$JgFdQXOVb7cDKI8JsCiAqeMAKqEIPpWRFFqQg9.8ntm2YzVk36zB.','tasta','test22','patient','2026-04-14 00:16:34','2026-04-14 00:16:34'),(27,'toto@gmail.com','$2b$10$Dojd649BnyGh9LhQFeuUNuOzJNu8LW6EJ0iFyF2P3G49pPXwQsZWm','takouta','ticket','patient','2026-04-18 14:48:40','2026-04-18 14:48:40'),(28,'sisi@gmail.com','$2b$10$hA6D/Kt8FtZSeGR8EHXMyO0XRsWjdtzAOetloBbJdQ.LoaxTvrfza','so','sousou','patient','2026-04-18 14:56:36','2026-04-18 14:56:36'),(29,'mimi@gmail.com','$2b$10$2/94dsAbKguYDZ5EQEF70u6GyPMATdItbvWrBvtAtYJpVtyaYg43m','mi','louma','patient','2026-04-18 14:57:55','2026-04-18 14:57:55'),(30,'op@gmail.com','$2b$10$gtvfNwK.RhNWtFHaMhzRA.6mYqvwLg1Dw8K5YlwYn7z4F5lBKJXI6','halahopa','opa','patient','2026-04-18 15:33:27','2026-04-18 15:33:27'),(31,'islem@gmail.com','$2b$10$nFvo1qHhb.wcEb8B/PDBZuAWn5elru/G.VnP0qIT1KDjEGHEb278S','ouerteni','islzm','patient','2026-04-18 16:35:05','2026-04-18 16:35:05'),(32,'sarra@gmail.com','$2b$10$IPtgNMDteK9huiPa0u1Fx.8EGJ/QVffUf6ccSa/aITrqbeobGnLXa','othmeni','sarra','patient','2026-04-18 16:38:13','2026-04-18 16:38:13'),(34,'syrine@gail.com','$2b$10$jydReX1.wDQzoTfbPjn/SuD/3CzHnOVIRbuOwj86ukrgeqvD26nwq','lassoued','syrine','patient','2026-04-18 16:39:23','2026-04-18 16:39:23');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `vw_file_attente`
--

DROP TABLE IF EXISTS `vw_file_attente`;
/*!50001 DROP VIEW IF EXISTS `vw_file_attente`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_file_attente` AS SELECT 
 1 AS `ticket_id`,
 1 AS `numero`,
 1 AS `position`,
 1 AS `statut`,
 1 AS `nom_patient`,
 1 AS `nom_medecin`,
 1 AS `specialite`,
 1 AS `created_at`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_medecin_semaine`
--

DROP TABLE IF EXISTS `vw_medecin_semaine`;
/*!50001 DROP VIEW IF EXISTS `vw_medecin_semaine`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_medecin_semaine` AS SELECT 
 1 AS `medecin_id`,
 1 AS `nom`,
 1 AS `prenom`,
 1 AS `specialite`,
 1 AS `photo`,
 1 AS `note_moyenne`,
 1 AS `nb_evaluations`,
 1 AS `nb_patients_semaine`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_note_medecin`
--

DROP TABLE IF EXISTS `vw_note_medecin`;
/*!50001 DROP VIEW IF EXISTS `vw_note_medecin`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_note_medecin` AS SELECT 
 1 AS `medecin_id`,
 1 AS `nom`,
 1 AS `prenom`,
 1 AS `specialite`,
 1 AS `photo`,
 1 AS `statut`,
 1 AS `note_moyenne`,
 1 AS `nb_evaluations`*/;
SET character_set_client = @saved_cs_client;

--
-- Dumping events for database 'medismart'
--

--
-- Dumping routines for database 'medismart'
--

--
-- Final view structure for view `vw_file_attente`
--

/*!50001 DROP VIEW IF EXISTS `vw_file_attente`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_file_attente` AS select `t`.`id` AS `ticket_id`,`t`.`numero` AS `numero`,`t`.`position` AS `position`,`t`.`statut` AS `statut`,concat(`up`.`prenom`,' ',`up`.`nom`) AS `nom_patient`,concat(`um`.`prenom`,' ',`um`.`nom`) AS `nom_medecin`,`m`.`specialite` AS `specialite`,`t`.`created_at` AS `created_at` from ((((`tickets` `t` join `patients` `pa` on((`pa`.`id` = `t`.`patient_id`))) join `users` `up` on((`up`.`id` = `pa`.`user_id`))) join `medecins` `m` on((`m`.`id` = `t`.`medecin_id`))) join `users` `um` on((`um`.`id` = `m`.`user_id`))) where (`t`.`statut` <> 'termine') order by `t`.`medecin_id`,`t`.`position` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_medecin_semaine`
--

/*!50001 DROP VIEW IF EXISTS `vw_medecin_semaine`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_medecin_semaine` AS select `m`.`id` AS `medecin_id`,`u`.`nom` AS `nom`,`u`.`prenom` AS `prenom`,`m`.`specialite` AS `specialite`,`m`.`photo` AS `photo`,round(avg(`e`.`note`),2) AS `note_moyenne`,count(distinct `e`.`id`) AS `nb_evaluations`,count(distinct `t`.`id`) AS `nb_patients_semaine` from (((`medecins` `m` join `users` `u` on((`u`.`id` = `m`.`user_id`))) left join `evaluations` `e` on((`e`.`medecin_id` = `m`.`id`))) left join `tickets` `t` on(((`t`.`medecin_id` = `m`.`id`) and (`t`.`created_at` >= (now() - interval 7 day))))) group by `m`.`id`,`u`.`nom`,`u`.`prenom`,`m`.`specialite`,`m`.`photo` order by `note_moyenne` desc,`nb_patients_semaine` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_note_medecin`
--

/*!50001 DROP VIEW IF EXISTS `vw_note_medecin`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_note_medecin` AS select `m`.`id` AS `medecin_id`,`u`.`nom` AS `nom`,`u`.`prenom` AS `prenom`,`m`.`specialite` AS `specialite`,`m`.`photo` AS `photo`,`m`.`statut` AS `statut`,round(avg(`e`.`note`),2) AS `note_moyenne`,count(`e`.`id`) AS `nb_evaluations` from ((`medecins` `m` join `users` `u` on((`u`.`id` = `m`.`user_id`))) left join `evaluations` `e` on((`e`.`medecin_id` = `m`.`id`))) group by `m`.`id`,`u`.`nom`,`u`.`prenom`,`m`.`specialite`,`m`.`photo`,`m`.`statut` */;
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

-- Dump completed on 2026-04-18 18:13:28
