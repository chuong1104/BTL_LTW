-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: janypet
-- ------------------------------------------------------
-- Server version	8.0.16

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
-- Table structure for table `booking`
--

DROP TABLE IF EXISTS `booking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `booking_date` date DEFAULT NULL,
  `end_time` time(6) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `start_time` time(6) DEFAULT NULL,
  `status` enum('CANCELLED','COMPLETED','CONFIRMED','PENDING') DEFAULT NULL,
  `staff_id` varchar(36) DEFAULT NULL,
  `pet_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKagw86t7hb216hgdfbr2kve2ve` (`staff_id`),
  KEY `FK562fcgmiwx2qoh3ir28tmuyk0` (`pet_id`),
  KEY `FK7udbel7q86k041591kj6lfmvw` (`user_id`),
  CONSTRAINT `FK562fcgmiwx2qoh3ir28tmuyk0` FOREIGN KEY (`pet_id`) REFERENCES `pet` (`id`),
  CONSTRAINT `FK7udbel7q86k041591kj6lfmvw` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKagw86t7hb216hgdfbr2kve2ve` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking`
--

LOCK TABLES `booking` WRITE;
/*!40000 ALTER TABLE `booking` DISABLE KEYS */;
INSERT INTO `booking` VALUES ('098445fa-5f93-4fa3-aea0-2105bc5f3c0b','2025-05-20 07:53:30.607069',_binary '','2025-05-20 07:54:12.467272','2025-05-30',NULL,'','14:00:00.000000','CONFIRMED',NULL,'62a6b943-dc05-4b0f-9e2a-5c576f87fd67','804e84f2-eb54-45bf-8d48-b8ca7a1eccaa'),('4f1c106d-ec83-479b-8dfd-2c069f3e7980','2025-05-20 01:41:16.314831',_binary '','2025-05-20 01:41:16.314831','2025-05-23',NULL,'','10:00:00.000000','PENDING',NULL,'317a8dbb-e5d4-459c-8dc7-9016bc29dc46','804e84f2-eb54-45bf-8d48-b8ca7a1eccaa'),('885c9788-03f7-40f2-a8c2-e196eefd64e0','2025-05-19 00:06:04.067034',_binary '','2025-05-19 17:12:41.859385','2025-05-31',NULL,'','09:00:00.000000','CONFIRMED',NULL,'317a8dbb-e5d4-459c-8dc7-9016bc29dc46','804e84f2-eb54-45bf-8d48-b8ca7a1eccaa'),('ad5fbd67-1a15-42b7-acaa-f50621834886','2025-05-20 01:41:30.859768',_binary '','2025-05-20 01:41:30.859768','2025-05-23',NULL,'','10:00:00.000000','PENDING',NULL,'317a8dbb-e5d4-459c-8dc7-9016bc29dc46','804e84f2-eb54-45bf-8d48-b8ca7a1eccaa');
/*!40000 ALTER TABLE `booking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_service`
--

DROP TABLE IF EXISTS `booking_service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_service` (
  `booking_id` varchar(36) NOT NULL,
  `service_id` varchar(36) NOT NULL,
  KEY `FK5q52wn8pd9cjgo0buxi3nwq4f` (`booking_id`),
  KEY `FK9yivjaxpwaxk79vf1fkdwai7i` (`service_id`),
  CONSTRAINT `FK5q52wn8pd9cjgo0buxi3nwq4f` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`id`),
  CONSTRAINT `FK9yivjaxpwaxk79vf1fkdwai7i` FOREIGN KEY (`service_id`) REFERENCES `service` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_service`
--

LOCK TABLES `booking_service` WRITE;
/*!40000 ALTER TABLE `booking_service` DISABLE KEYS */;
INSERT INTO `booking_service` VALUES ('885c9788-03f7-40f2-a8c2-e196eefd64e0','902a88d6-5876-4dee-aa98-7dd9af43e824'),('4f1c106d-ec83-479b-8dfd-2c069f3e7980','6d22af1f-859f-4ca3-b15b-b4773dc15512'),('4f1c106d-ec83-479b-8dfd-2c069f3e7980','902a88d6-5876-4dee-aa98-7dd9af43e824'),('ad5fbd67-1a15-42b7-acaa-f50621834886','6d22af1f-859f-4ca3-b15b-b4773dc15512'),('ad5fbd67-1a15-42b7-acaa-f50621834886','902a88d6-5876-4dee-aa98-7dd9af43e824'),('098445fa-5f93-4fa3-aea0-2105bc5f3c0b','6d22af1f-859f-4ca3-b15b-b4773dc15512'),('098445fa-5f93-4fa3-aea0-2105bc5f3c0b','902a88d6-5876-4dee-aa98-7dd9af43e824');
/*!40000 ALTER TABLE `booking_service` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_details`
--

DROP TABLE IF EXISTS `cart_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_details` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `quantity` int(11) DEFAULT NULL,
  `unit_price` decimal(38,2) DEFAULT NULL,
  `product_id` varchar(36) DEFAULT NULL,
  `shopping_cart_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKngo5q1x6m7sudq0m8ylo5prrh` (`product_id`),
  KEY `FK505iou46ru3ujwek672ldd3o0` (`shopping_cart_id`),
  CONSTRAINT `FK505iou46ru3ujwek672ldd3o0` FOREIGN KEY (`shopping_cart_id`) REFERENCES `shopping_carts` (`id`),
  CONSTRAINT `FKngo5q1x6m7sudq0m8ylo5prrh` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_details`
--

LOCK TABLES `cart_details` WRITE;
/*!40000 ALTER TABLE `cart_details` DISABLE KEYS */;
INSERT INTO `cart_details` VALUES ('7184b240-c155-486f-8752-f4a60ac4698b','2025-04-29 09:45:58.752078',_binary '','2025-04-29 09:45:58.752078',5,2225.00,'090c8dfe-9d5c-4155-99b2-35925cbd2d7f','5e0f2996-38ce-4f3b-a67c-5eb4a7feef3d');
/*!40000 ALTER TABLE `cart_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `description` text,
  `name` varchar(100) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `type` enum('PRODUCT','SERVICE') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK46ccwnsi9409t36lurvtyljak` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES ('23a443a9-8a1d-4dc7-bc52-09e3dffa73aa','2025-05-10 12:36:54.229916',_binary '','2025-05-22 13:07:00.504884','Danh mục hoa cưới gồm các mẫu hoa dành cho lễ cưới như bó hoa cô dâu, hoa cài áo, hoa trang trí. Thiết kế thường mang phong cách lãng mạn, tinh tế, phù hợp với không gian và chủ đề tiệc cưới.','Hoa cưới',1,'PRODUCT'),('66dd52cb-4154-4f95-9333-f36d6b31e660','2025-05-12 17:11:05.387490',_binary '','2025-05-22 13:19:03.744711','Danh mục hoa chúc mừng bao gồm các mẫu hoa dành tặng trong dịp khai trương, sinh nhật, lễ kỷ niệm hoặc thành công. Thiết kế tươi sáng, trang trọng để gửi lời chúc tốt đẹp và may mắn.','Hoa chúc mừng',1,'PRODUCT'),('7d1741c5-2fc5-4436-843c-3f2c1c1060fd','2025-05-22 16:11:22.704182',_binary '\0','2025-05-22 16:11:55.072869','quả nho','hoa quả',1,'PRODUCT'),('847f7510-1764-468d-8c66-e42d24bfc40b','2025-05-22 13:09:34.601962',_binary '','2025-05-22 13:09:34.601962','Danh mục phụ liệu hoa bao gồm các vật dụng hỗ trợ cắm và trang trí hoa như giấy gói, ruy băng, xốp cắm hoa, giỏ, lọ và dây buộc. Đây là những phụ kiện không thể thiếu để hoàn thiện và làm nổi bật vẻ đẹp của bó hoa hay lẵng hoa.','Phụ liệu hoa',1,'PRODUCT'),('c0b0b5ac-236b-4002-a4d2-38a52413429c','2025-05-22 14:36:14.722266',_binary '\0','2025-05-22 14:36:19.556845','','hehe',1,'PRODUCT'),('d0d87a73-27ea-4910-b1fd-69d9c45305ff','2025-05-22 13:08:50.374679',_binary '','2025-05-22 13:08:50.374679','Danh mục \"Hoa xinh giá tốt\" bao gồm các mẫu hoa tươi được thiết kế đẹp mắt với mức giá hợp lý, phù hợp cho nhiều dịp như sinh nhật, cảm ơn hay tặng người thân.','Hoa xinh giá tốt',1,'PRODUCT'),('e7c30e43-784a-4393-b2cc-5f0c8d6e0002','2025-04-26 02:29:59.061628',_binary '','2025-05-22 13:08:14.750785','Danh mục hoa chia buồn gồm các mẫu hoa dùng để tiễn đưa và tưởng nhớ người đã khuất. Thiết kế trang nhã, màu sắc trầm nhằm thể hiện sự kính trọng và chia sẻ mất mát với gia quyến.','Hoa chia buồn',1,'PRODUCT');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cupon`
--

DROP TABLE IF EXISTS `cupon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cupon` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `code` varchar(255) NOT NULL,
  `discount_type` enum('FIXED','PERCENTAGE') DEFAULT NULL,
  `discount_value` decimal(38,2) DEFAULT NULL,
  `expiration_date` datetime(6) DEFAULT NULL,
  `max_order_amount` decimal(38,2) DEFAULT NULL,
  `min_order_amount` decimal(38,2) DEFAULT NULL,
  `usage_limit` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKfmq5yf2aw90hime9ns0dyg2mp` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cupon`
--

LOCK TABLES `cupon` WRITE;
/*!40000 ALTER TABLE `cupon` DISABLE KEYS */;
/*!40000 ALTER TABLE `cupon` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discount`
--

DROP TABLE IF EXISTS `discount`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `discount` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `discount_percent` decimal(38,2) DEFAULT NULL,
  `end_date` datetime(6) DEFAULT NULL,
  `start_date` datetime(6) DEFAULT NULL,
  `product_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK9qcsopl406ufumbitfi9u7jop` (`product_id`),
  CONSTRAINT `FK9qcsopl406ufumbitfi9u7jop` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discount`
--

LOCK TABLES `discount` WRITE;
/*!40000 ALTER TABLE `discount` DISABLE KEYS */;
/*!40000 ALTER TABLE `discount` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_details`
--

DROP TABLE IF EXISTS `order_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_details` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `quantity` int(11) DEFAULT NULL,
  `unit_price` decimal(38,2) DEFAULT NULL,
  `order_id` varchar(36) DEFAULT NULL,
  `product_id` varchar(36) DEFAULT NULL,
  `product_color` varchar(255) DEFAULT NULL,
  `product_image` varchar(255) DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `product_size` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKjyu2qbqt8gnvno9oe9j2s2ldk` (`order_id`),
  KEY `FKinivj2k1370kw224lavkm3rqm` (`product_id`),
  CONSTRAINT `FKinivj2k1370kw224lavkm3rqm` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`),
  CONSTRAINT `FKjyu2qbqt8gnvno9oe9j2s2ldk` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_details`
--

LOCK TABLES `order_details` WRITE;
/*!40000 ALTER TABLE `order_details` DISABLE KEYS */;
INSERT INTO `order_details` VALUES ('17a6a6fd-1eba-47cc-8635-19a830b92bdb','2025-05-20 00:05:54.902868',_binary '','2025-05-20 00:05:54.902868',2,170000.00,'8503a552-b812-4b8d-b1a8-fba938b36b06','090c8dfe-9d5c-4155-99b2-35925cbd2d7f',NULL,'1747050726596_blog-lg3.jpg','Áo hoodie cho chó',NULL),('18aff2f0-f9d8-47eb-86a0-8aa8b5f148d3','2025-05-19 23:40:11.543749',_binary '','2025-05-19 23:40:11.543749',1,15000.00,'d41d6b87-4d7f-4d87-b49e-3dd1b635cd70','9eae2d26-55ee-4efe-bebc-b8af0f15db81',NULL,'1747048430053_insta2.jpg','áo',NULL),('2adeea10-74f1-4387-ae18-2fef828a8a6d','2025-05-19 23:56:44.119115',_binary '','2025-05-19 23:56:44.119115',2,170000.00,'99cfbad6-5746-4b8e-ae7a-7af295a7a053','090c8dfe-9d5c-4155-99b2-35925cbd2d7f',NULL,'1747050726596_blog-lg3.jpg','Áo hoodie cho chó',NULL),('2bff54b2-94c6-4583-97ed-76b9dc6e9158','2025-05-20 01:07:20.847765',_binary '','2025-05-20 01:07:20.847765',1,15000.00,'e88a96ae-747f-4de6-a1ae-a7b842a289e1','9eae2d26-55ee-4efe-bebc-b8af0f15db81',NULL,'1747048430053_insta2.jpg','áo',NULL),('3a64eeec-f512-4f68-984c-a64570dcf608','2025-05-19 23:43:05.408229',_binary '','2025-05-19 23:43:05.408229',1,15000.00,'1a5b5261-75d1-4e00-9ebb-53a99800fb04','9eae2d26-55ee-4efe-bebc-b8af0f15db81',NULL,'1747048430053_insta2.jpg','áo',NULL),('3a96cd71-28bd-4f2d-af83-317f8af5af1d','2025-05-14 14:09:12.968472',_binary '','2025-05-14 14:09:12.968472',3,35000.00,'5f8e22c0-7717-4e7f-a076-bb7cfc480b36','090c8dfe-9d5c-4155-99b2-35925cbd2d7f','Vị Cá Hồi','1747050726596_blog-lg3.jpg','Áo hoodie cho chó',NULL),('3d31fd8c-1e39-4bbc-aaad-9787ee85d36c','2025-05-14 14:06:53.720493',_binary '','2025-05-14 14:06:53.720493',2,250000.00,'35b48a46-7941-4413-a83a-4a032e3b592a','090c8dfe-9d5c-4155-99b2-35925cbd2d7f','','1747050726596_blog-lg3.jpg','Áo hoodie cho chó',NULL),('3d6be1eb-d199-42e8-a3db-f322a338dbc4','2025-05-19 23:53:32.886298',_binary '','2025-05-19 23:53:32.886298',2,170000.00,'c610f3aa-d87d-46bb-bc84-fda410d7e110','090c8dfe-9d5c-4155-99b2-35925cbd2d7f',NULL,'1747050726596_blog-lg3.jpg','Áo hoodie cho chó',NULL),('55cc9225-15f1-424a-b0ee-67805be9a791','2025-05-20 03:00:42.573422',_binary '','2025-05-20 03:00:42.573422',1,120000.00,'cd53e508-52fb-421d-89f2-7f4691cb816a','a0649bb3-dd07-49c6-a2a4-51d54af06b6b',NULL,'1747681529813_item9.jpg','Thức ăn hạt cho mèo',NULL),('56363ca3-cb3c-4064-adf1-042ce06b81dd','2025-05-19 23:22:58.162698',_binary '','2025-05-19 23:22:58.162698',2,15000.00,'4de86e61-7dd7-4c94-aa79-9403699a6cc8','9eae2d26-55ee-4efe-bebc-b8af0f15db81',NULL,'1747048430053_insta2.jpg','áo',NULL),('594314c3-991c-4e43-9dc6-35a77cb57908','2025-05-14 13:57:35.455908',_binary '','2025-05-14 13:57:35.455908',1,15000.00,'9be805ed-4540-4287-ae28-53cf9274f30a','9eae2d26-55ee-4efe-bebc-b8af0f15db81','','1747048430053_insta2.jpg','áo',NULL),('5d3600d1-6933-4a88-a7e4-a8c6c90f6a78','2025-05-14 13:52:25.708780',_binary '','2025-05-14 13:52:25.708780',1,170000.00,'da8bdc9c-7bff-4209-9425-870cb664122a','090c8dfe-9d5c-4155-99b2-35925cbd2d7f','Size L, Red','1747050726596_blog-lg3.jpg','Áo hoodie cho chó',NULL),('5eede50f-cb99-418f-ac42-9aadf4c3a6a3','2025-05-20 07:55:24.056166',_binary '','2025-05-20 07:55:24.056166',1,120000.00,'cf71332a-00c9-4ec9-90ee-674b521f21ce','a0649bb3-dd07-49c6-a2a4-51d54af06b6b',NULL,'1747681529813_item9.jpg','Thức ăn hạt cho mèo',NULL),('605ef2d8-b6c9-4d1b-bb09-2c3baab3a7c3','2025-05-23 04:52:50.813493',_binary '','2025-05-23 04:52:50.813493',2,450000.00,'ce6eaff9-8324-46fb-8628-180e3df1ef28','5db1cb54-1cae-4a29-9c7a-196bec1a115e',NULL,'1747903664305_Hoaxinhgiare01.jpg','Bó Hoa Giọt Nắng Tinh Khôi 608',NULL),('79f0a0ab-3b29-4591-98f2-6eeced398ca5','2025-05-14 14:10:04.827834',_binary '','2025-05-14 14:10:04.828424',1,15000.00,'6d061816-c754-4d8a-81cf-b9c7e1ef17a5','9eae2d26-55ee-4efe-bebc-b8af0f15db81','','1747048430053_insta2.jpg','áo',NULL),('890761a4-490f-4d0f-9a30-668101bd9e45','2025-05-19 23:09:07.094802',_binary '','2025-05-19 23:09:07.094802',2,15000.00,'bc8fb726-d524-49b4-b964-390105b0c54b','9eae2d26-55ee-4efe-bebc-b8af0f15db81',NULL,'1747048430053_insta2.jpg','áo',NULL),('9782e068-ace1-44f6-af17-e148a3f2dfab','2025-05-20 01:10:58.060411',_binary '','2025-05-20 01:10:58.060411',1,170000.00,'8e777ff6-4ef2-4935-b094-3e0fbc251c9f','090c8dfe-9d5c-4155-99b2-35925cbd2d7f',NULL,'1747050726596_blog-lg3.jpg','Áo hoodie cho chó',NULL),('9e17c570-6eb2-429f-9e02-57bcac176ee6','2025-05-14 13:52:25.721923',_binary '','2025-05-14 13:52:25.721923',2,250000.00,'da8bdc9c-7bff-4209-9425-870cb664122a','090c8dfe-9d5c-4155-99b2-35925cbd2d7f','','1747050726596_blog-lg3.jpg','Áo hoodie cho chó',NULL),('a1bc034b-2f7f-4da6-81f7-458355ea75df','2025-05-14 14:09:13.029932',_binary '','2025-05-14 14:09:13.030509',1,120000.00,'5f8e22c0-7717-4e7f-a076-bb7cfc480b36','090c8dfe-9d5c-4155-99b2-35925cbd2d7f','10L, Hương Lavender','1747050726596_blog-lg3.jpg','Áo hoodie cho chó',NULL),('c44de8e5-a737-4190-aeb2-403c3063fdf9','2025-05-19 23:51:35.972959',_binary '','2025-05-19 23:51:35.972959',2,170000.00,'fc4f224f-19b8-4391-bafc-19f2875e02bf','090c8dfe-9d5c-4155-99b2-35925cbd2d7f',NULL,'1747050726596_blog-lg3.jpg','Áo hoodie cho chó',NULL),('d7220990-4bc4-42b1-ba4d-aebe91e46caf','2025-05-14 14:10:04.837130',_binary '','2025-05-14 14:10:04.837130',1,170000.00,'6d061816-c754-4d8a-81cf-b9c7e1ef17a5','090c8dfe-9d5c-4155-99b2-35925cbd2d7f','','1747050726596_blog-lg3.jpg','Áo hoodie cho chó',NULL),('d8432d09-23f9-4965-8e19-978414fe6d8f','2025-05-19 22:20:24.595091',_binary '','2025-05-19 22:20:24.595091',1,15000.00,'5d586b9a-eb72-4669-ad21-44424a4c0132','9eae2d26-55ee-4efe-bebc-b8af0f15db81','','1747048430053_insta2.jpg','áo',NULL),('dd643537-afb1-4d92-a327-3f5205c0ea12','2025-05-20 00:35:23.043683',_binary '','2025-05-20 00:35:23.043683',1,170000.00,'abe9f3e5-206e-465b-a78f-045eb8f5ca50','090c8dfe-9d5c-4155-99b2-35925cbd2d7f',NULL,'1747050726596_blog-lg3.jpg','Áo hoodie cho chó',NULL),('e3b98cbe-60b1-4bd3-bbd4-84674462e978','2025-05-15 14:44:35.071807',_binary '','2025-05-15 14:44:35.071807',1,170000.00,'2d949171-1037-4d4b-858c-dd491d0836eb','090c8dfe-9d5c-4155-99b2-35925cbd2d7f','','1747050726596_blog-lg3.jpg','Áo hoodie cho chó',NULL),('f9948784-6777-4191-a449-ba52674c9ac5','2025-05-23 02:12:18.958418',_binary '','2025-05-23 02:12:18.958418',1,1900000.00,'2434bb9f-04fd-415a-9d0f-cdca965a9479','060fbe0c-da15-4f07-80bf-dfc723eddec5',NULL,'1747903290352_anhchiabuon.jpg','Kệ Hoa Chia Buồn Chốn Bình Yên 035',NULL),('fd542c4d-e4d5-4f55-b6ce-7c51408e6ccf','2025-05-15 11:48:29.476002',_binary '','2025-05-15 11:48:29.476002',1,170000.00,'df49903b-4a3b-49e6-a23c-8a88b236159a','090c8dfe-9d5c-4155-99b2-35925cbd2d7f','','1747050726596_blog-lg3.jpg','Áo hoodie cho chó',NULL),('fdb2a623-8a75-41c3-ba94-f0988c3b3fb4','2025-05-22 19:23:09.842219',_binary '','2025-05-22 19:23:09.842219',1,1900000.00,'26c53e52-6457-449f-9647-820733ca0172','060fbe0c-da15-4f07-80bf-dfc723eddec5',NULL,'1747903290352_anhchiabuon.jpg','Kệ Hoa Chia Buồn Chốn Bình Yên 035',NULL),('ff7edaa3-35fe-40e6-838e-b7c7fb95e088','2025-05-14 14:06:53.695383',_binary '','2025-05-14 14:06:53.695383',1,170000.00,'35b48a46-7941-4413-a83a-4a032e3b592a','090c8dfe-9d5c-4155-99b2-35925cbd2d7f','Size L, Red','1747050726596_blog-lg3.jpg','Áo hoodie cho chó',NULL);
/*!40000 ALTER TABLE `order_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `order_date` datetime(6) DEFAULT NULL,
  `status` enum('CANCELLED','COMPLETED','FAILED','PAID','PENDING','PROCESSING') DEFAULT NULL,
  `total_amount` decimal(38,2) DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `coupon_code` varchar(255) DEFAULT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `customer_first_name` varchar(255) DEFAULT NULL,
  `customer_last_name` varchar(255) DEFAULT NULL,
  `customer_phone` varchar(255) DEFAULT NULL,
  `discount_amount` decimal(38,2) DEFAULT NULL,
  `estimated_delivery_date` datetime(6) DEFAULT NULL,
  `order_notes` varchar(500) DEFAULT NULL,
  `payment_method` enum('BANK_TRANSFER','COD','CREDIT_CARD','MOMO','VNPAY') DEFAULT NULL,
  `shipping_address` varchar(255) DEFAULT NULL,
  `shipping_city` varchar(255) DEFAULT NULL,
  `shipping_district` varchar(255) DEFAULT NULL,
  `shipping_fee` decimal(38,2) DEFAULT NULL,
  `shipping_method` enum('FAST','SAME_DAY','STANDARD') DEFAULT NULL,
  `shipping_ward` varchar(255) DEFAULT NULL,
  `subtotal_amount` decimal(38,2) DEFAULT NULL,
  `order_code` varchar(255) DEFAULT NULL,
  `vnp_bank_code` varchar(255) DEFAULT NULL,
  `vnp_card_type` varchar(255) DEFAULT NULL,
  `vnp_transaction_no` varchar(255) DEFAULT NULL,
  `vnp_txn_ref` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK32ql8ubntj5uh44ph9659tiih` (`user_id`),
  CONSTRAINT `FK32ql8ubntj5uh44ph9659tiih` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES ('1a5b5261-75d1-4e00-9ebb-53a99800fb04','2025-05-19 23:43:05.376912',_binary '','2025-05-19 23:43:05.376912','2025-05-19 23:43:05.352029','PROCESSING',45000.00,NULL,'','dochichuong2811@gmail.com','cutii','quaa','0398467230',0.00,'2025-05-24 23:43:05.352029','','COD','Hanoi VietNam','Hà Nội','Ba Đình',30000.00,'STANDARD','Ngọc Khánh',15000.00,'17476729853529166',NULL,NULL,NULL,NULL),('2434bb9f-04fd-415a-9d0f-cdca965a9479','2025-05-23 02:12:18.861384',_binary '','2025-05-23 02:12:18.861384','2025-05-23 02:12:18.739954','PENDING',1900000.00,NULL,'','dochichuong2811@gmail.com','cutii','quaa','0398467230',0.00,'2025-05-28 02:12:18.739954','','VNPAY','Hanoi VietNam','Hà Nội','Hai Bà Trưng',0.00,'STANDARD','Minh Khai',1900000.00,'17479411387399761',NULL,NULL,NULL,NULL),('26c53e52-6457-449f-9647-820733ca0172','2025-05-22 19:23:09.786015',_binary '','2025-05-22 19:23:09.786015','2025-05-22 19:23:09.671141','PROCESSING',1900000.00,NULL,'','dochichuong2811@gmail.com','cutii','quaa','0398467230',0.00,'2025-05-27 19:23:09.671141','','COD','Hanoi VietNam','Hà Nội','Hoàn Kiếm',0.00,'STANDARD','Chương Dương',1900000.00,'17479165896715711',NULL,NULL,NULL,NULL),('2d949171-1037-4d4b-858c-dd491d0836eb','2025-05-15 14:44:35.004553',_binary '','2025-05-15 14:44:35.004553','2025-05-15 14:44:34.904945','PENDING',220000.00,NULL,'FREESHIP','dochichuong2811@gmail.com','NGUYEN','VAN A','0398467230',0.00,'2025-05-17 14:44:34.904945',NULL,'VNPAY','Hanoi VietNam','Hà Nội','Ba Đình',50000.00,'FAST','Kim Mã',170000.00,'1747295074904637',NULL,NULL,NULL,NULL),('35b48a46-7941-4413-a83a-4a032e3b592a','2025-05-14 14:06:53.598033',_binary '','2025-05-14 14:06:53.598033','2025-05-14 14:06:53.458034','PENDING',720000.00,NULL,'',NULL,NULL,NULL,NULL,0.00,'2025-05-16 14:06:53.458034',NULL,'VNPAY',NULL,NULL,NULL,50000.00,'FAST',NULL,670000.00,'17472064134581761',NULL,NULL,NULL,NULL),('4de86e61-7dd7-4c94-aa79-9403699a6cc8','2025-05-19 23:22:58.083154',_binary '','2025-05-19 23:22:58.083154','2025-05-19 23:22:57.987924','PROCESSING',80000.00,NULL,'','dochuong2811@gmail.com','B22DCKH015- Đỗ Chí Chương','Chương','0398467230',0.00,'2025-05-21 23:22:57.987924','','COD','Hanoi VietNam','Hà Nội','Ba Đình',50000.00,'FAST','Vĩnh Phúc',30000.00,'17476717779875912',NULL,NULL,NULL,NULL),('5d586b9a-eb72-4669-ad21-44424a4c0132','2025-05-19 22:20:24.410355',_binary '','2025-05-19 22:20:24.411361','2025-05-19 22:20:24.093148','PENDING',45000.00,NULL,'','dochuong281100@gmail.com','Đỗ Chí','Chương','0398467230',0.00,'2025-05-26 22:20:24.093148','hahaha','VNPAY','Hanoi VietNam','Hà Nội','Ba Đình',30000.00,'SAME_DAY','Trúc Bạch',15000.00,'17476680240936377',NULL,NULL,NULL,NULL),('5f8e22c0-7717-4e7f-a076-bb7cfc480b36','2025-05-14 14:09:12.894658',_binary '','2025-05-14 14:09:12.894658','2025-05-14 14:09:12.761241','PROCESSING',255000.00,NULL,'WELCOME10','buoithi@example.com','Thị','Bưởi','0901234568',0.00,'2025-05-19 14:09:12.761241',NULL,'COD','456 Đường XYZ','TP. Hồ Chí Minh','Quận 1',30000.00,'STANDARD','Bến Nghé',225000.00,'1747206552761407',NULL,NULL,NULL,NULL),('6d061816-c754-4d8a-81cf-b9c7e1ef17a5','2025-05-14 14:10:04.814511',_binary '','2025-05-14 14:10:04.814511','2025-05-14 14:10:04.790597','PENDING',235000.00,NULL,'','dochichuong2811@gmail.com','cutii','quaa','0398467230',0.00,'2025-05-16 14:10:04.790597',NULL,'VNPAY','Hanoi VietNam','Hà Nội','Ba Đình',50000.00,'FAST','Giảng Võ',185000.00,'17472066047909698',NULL,NULL,NULL,NULL),('8503a552-b812-4b8d-b1a8-fba938b36b06','2025-05-20 00:05:54.818368',_binary '','2025-05-20 00:05:54.818368','2025-05-20 00:05:54.686592','PENDING',340000.00,NULL,'','dochichuong2811@gmail.com','cutii','quaa','0398467230',0.00,'2025-05-25 00:05:54.686592','','VNPAY','Hanoi VietNam','Hà Nội','Ba Đình',0.00,'STANDARD','Trúc Bạch',340000.00,'17476743546869377',NULL,NULL,NULL,NULL),('8e777ff6-4ef2-4935-b094-3e0fbc251c9f','2025-05-20 01:10:58.046614',_binary '','2025-05-20 01:10:58.046614','2025-05-20 01:10:58.025727','PENDING',200000.00,NULL,'','dochichuong2811@gmail.com','cutii','quaa','0398467230',0.00,'2025-05-22 01:10:58.025727','','VNPAY','Hanoi VietNam','Hà Nội','Ba Đình',30000.00,'FAST','Kim Mã',170000.00,'17476782580257258',NULL,NULL,NULL,NULL),('99cfbad6-5746-4b8e-ae7a-7af295a7a053','2025-05-19 23:56:44.091819',_binary '','2025-05-19 23:56:44.091819','2025-05-19 23:56:44.073896','PENDING',370000.00,NULL,'','dochichuong2811@gmail.com','cutii','quaa','0398467230',0.00,'2025-05-24 23:56:44.073896','','VNPAY','Hanoi VietNam','Hà Nội','Hoàn Kiếm',30000.00,'STANDARD','Hàng Mã',340000.00,'17476738040736400',NULL,NULL,NULL,NULL),('9be805ed-4540-4287-ae28-53cf9274f30a','2025-05-14 13:57:35.401444',_binary '','2025-05-14 14:01:58.315658','2025-05-14 13:57:35.330599','COMPLETED',65000.00,NULL,'',NULL,NULL,NULL,NULL,0.00,'2025-05-16 13:57:35.330599',NULL,'VNPAY',NULL,NULL,NULL,50000.00,'FAST',NULL,15000.00,'1747205855330510',NULL,NULL,NULL,NULL),('abe9f3e5-206e-465b-a78f-045eb8f5ca50','2025-05-20 00:35:22.966399',_binary '','2025-05-20 00:35:22.966399','2025-05-20 00:35:22.755813','PENDING',170000.00,NULL,'','dochichuong2811@gmail.com','cutii','quaa','0398467230',0.00,'2025-05-25 00:35:22.755813','','VNPAY','Hanoi VietNam','Hà Nội','Ba Đình',0.00,'STANDARD','Kim Mã',170000.00,'17476761227555448',NULL,NULL,NULL,NULL),('bc8fb726-d524-49b4-b964-390105b0c54b','2025-05-19 23:09:06.899581',_binary '','2025-05-19 23:09:06.900577','2025-05-19 23:09:06.629507','PENDING',80000.00,NULL,'','dochuong2811@gmail.com','B22DCKH015- Đỗ Chí Chương','Chương','0398467230',0.00,'2025-05-21 23:09:06.629507','','VNPAY','Hanoi VietNam','Hà Nội','Ba Đình',50000.00,'FAST','Kim Mã',30000.00,'17476709466297450',NULL,NULL,NULL,NULL),('c610f3aa-d87d-46bb-bc84-fda410d7e110','2025-05-19 23:53:32.877020',_binary '','2025-05-19 23:53:32.877020','2025-05-19 23:53:32.865698','PENDING',370000.00,NULL,'','dochichuong2811@gmail.com','cutii','quaa','0398467230',0.00,'2025-05-24 23:53:32.865698','','VNPAY','Hanoi VietNam','Hà Nội','Ba Đình',30000.00,'STANDARD','Kim Mã',340000.00,'17476736128654056',NULL,NULL,NULL,NULL),('cd53e508-52fb-421d-89f2-7f4691cb816a','2025-05-20 03:00:42.517285',_binary '','2025-05-20 03:00:42.517285','2025-05-20 03:00:42.477397','PENDING',120000.00,NULL,'','dochichuong2811@gmail.com','cutii','quaa','0398467230',0.00,'2025-05-25 03:00:42.477397','','VNPAY','Hanoi VietNam','Hà Nội','Hoàn Kiếm',0.00,'STANDARD','Cửa Đông',120000.00,'17476848424774091',NULL,NULL,NULL,NULL),('ce6eaff9-8324-46fb-8628-180e3df1ef28','2025-05-23 04:52:50.726614',_binary '','2025-05-23 04:52:50.726614','2025-05-23 04:52:50.479846','PENDING',900000.00,NULL,'','dochichuong2811@gmail.com','cutii','quaa','0398467230',0.00,'2025-05-28 04:52:50.479846','','VNPAY','Hanoi VietNam','Hà Nội','Hoàn Kiếm',0.00,'STANDARD','Cửa Đông',900000.00,'17479507704803496',NULL,NULL,NULL,NULL),('cf71332a-00c9-4ec9-90ee-674b521f21ce','2025-05-20 07:55:24.037889',_binary '','2025-05-20 07:55:24.037889','2025-05-20 07:55:23.994004','PENDING',150000.00,NULL,'','dochichuong2811@gmail.com','cutii','quaa','0398467230',0.00,'2025-05-22 07:55:23.994004','','VNPAY','Hanoi VietNam','Hà Nội','Hai Bà Trưng',30000.00,'FAST','Đồng Tâm',120000.00,'17477025239943236',NULL,NULL,NULL,NULL),('d41d6b87-4d7f-4d87-b49e-3dd1b635cd70','2025-05-19 23:40:11.516479',_binary '','2025-05-19 23:40:11.516479','2025-05-19 23:40:11.446790','PENDING',45000.00,NULL,'','dochichuong2811@gmail.com','cutii','quaa','0398467230',0.00,'2025-05-24 23:40:11.446790','','VNPAY','Hanoi VietNam','Hà Nội','Ba Đình',30000.00,'STANDARD','Giảng Võ',15000.00,'17476728114464631',NULL,NULL,NULL,NULL),('da8bdc9c-7bff-4209-9425-870cb664122a','2025-05-14 13:52:25.598947',_binary '','2025-05-14 13:52:25.598947','2025-05-14 13:52:25.450561','PENDING',720000.00,NULL,'',NULL,NULL,NULL,NULL,0.00,'2025-05-16 13:52:25.450561',NULL,'VNPAY',NULL,NULL,NULL,50000.00,'FAST',NULL,670000.00,'17472055454507137',NULL,NULL,NULL,NULL),('df49903b-4a3b-49e6-a23c-8a88b236159a','2025-05-15 11:48:29.375650',_binary '','2025-05-15 11:48:29.375650','2025-05-15 11:48:29.216641','PENDING',200000.00,NULL,'','dochichuong2811@gmail.com','NGUYEN','VAN A','0398467230',0.00,'2025-05-22 11:48:29.216641',NULL,'VNPAY','Hanoi VietNam','Hà Nội','Ba Đình',30000.00,'SAME_DAY','Giảng Võ',170000.00,'17472845092169649',NULL,NULL,NULL,NULL),('e88a96ae-747f-4de6-a1ae-a7b842a289e1','2025-05-20 01:07:20.810126',_binary '','2025-05-20 01:07:20.810126','2025-05-20 01:07:20.776423','PROCESSING',15000.00,NULL,'','dochichuong2811@gmail.com','cutii','quaa','0398467230',0.00,'2025-05-25 01:07:20.776423','','COD','Hanoi VietNam','Hà Nội','Hoàn Kiếm',0.00,'STANDARD','Hàng Trống',15000.00,'17476780407769299',NULL,NULL,NULL,NULL),('fc4f224f-19b8-4391-bafc-19f2875e02bf','2025-05-19 23:51:35.922387',_binary '','2025-05-19 23:51:35.922387','2025-05-19 23:51:35.834425','PENDING',370000.00,NULL,'','dochichuong2811@gmail.com','cutii','quaa','0398467230',0.00,'2025-05-24 23:51:35.834425','','VNPAY','Hanoi VietNam','Hà Nội','Ba Đình',30000.00,'STANDARD','Trúc Bạch',340000.00,'17476734958342751',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `amount` decimal(38,2) DEFAULT NULL,
  `bank_code` varchar(255) DEFAULT NULL,
  `payment_date` datetime(6) DEFAULT NULL,
  `payment_info` varchar(255) DEFAULT NULL,
  `payment_method` varchar(255) DEFAULT NULL,
  `response_code` varchar(255) DEFAULT NULL,
  `status` enum('FAILD','PAID','PENDING','REFUNDED') DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `order_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK8vo36cen604as7etdfwmyjsxt` (`order_id`),
  CONSTRAINT `FK81gagumt0r8y3rmudcgpbk42l` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pet`
--

DROP TABLE IF EXISTS `pet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pet` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `birth_date` date DEFAULT NULL,
  `breed` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `health_notes` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `species` varchar(255) NOT NULL,
  `vaccinated` bit(1) DEFAULT NULL,
  `weight` double DEFAULT NULL,
  `owner_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK18ujlvblqmcku8ydgo5wvvgmo` (`owner_id`),
  CONSTRAINT `FK18ujlvblqmcku8ydgo5wvvgmo` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pet`
--

LOCK TABLES `pet` WRITE;
/*!40000 ALTER TABLE `pet` DISABLE KEYS */;
INSERT INTO `pet` VALUES ('261672a4-fe04-4010-a60c-5d0665d6d97d','2025-04-27 22:39:25.627976',_binary '','2025-04-27 22:39:25.627976','2022-08-15','British Shorthair','Female','No known allergies','Luna','Cat',_binary '',4.2,'48697de1-d081-4684-817e-d436f7ea3647'),('317a8dbb-e5d4-459c-8dc7-9016bc29dc46','2025-05-19 00:04:27.405325',_binary '','2025-05-19 00:04:27.405325','2024-10-16','mèo anh','','','Em Chítttt0','CAT',_binary '\0',300,'804e84f2-eb54-45bf-8d48-b8ca7a1eccaa'),('57713ced-92e1-45ef-b3eb-10cf42366116','2025-05-16 16:32:02.887222',_binary '','2025-05-16 16:32:02.887222','2024-10-16','mèo anh','FEMALE','','Em Chítttt','BIRD',_binary '',300,'8a86bfb2-1e9d-11f0-8fdf-0242ac110002'),('62a6b943-dc05-4b0f-9e2a-5c576f87fd67','2025-05-20 01:45:35.212676',_binary '','2025-05-20 01:45:35.212676','2021-02-18','Chó Pháp','FEMALE','Dị ứng với đồ ăn','Chó Corgi','DOG',_binary '',3.5,'804e84f2-eb54-45bf-8d48-b8ca7a1eccaa'),('73294850-fe26-44e0-a5c7-97b1005e00ba','2025-05-20 07:52:43.014401',_binary '','2025-05-20 07:52:43.014401','2021-02-18','Chó Pháp','MALE','','Chó Corgi','DOG',_binary '\0',3.5,'804e84f2-eb54-45bf-8d48-b8ca7a1eccaa'),('acff360e-28c0-4f30-a52b-2b6f7c20afff','2025-04-22 07:44:00.075450',_binary '','2025-04-22 07:44:00.075450','2022-08-15','British Shorthair','Female','No known allergies','Luna','Cat',_binary '',4.2,'2418ec44-5b6a-4f38-943b-377437ff7570'),('bee47a5a-ad29-4c6e-9426-0c181c2e9d70','2025-04-21 10:07:57.733631',_binary '','2025-04-21 10:07:57.733631','2022-08-15','British Shorthair','Female','No known allergies','Luna','Cat',_binary '',4.2,'2418ec44-5b6a-4f38-943b-377437ff7570'),('ca969b24-38b5-446b-99e1-999133380aa8','2025-05-16 16:24:42.752455',_binary '','2025-05-16 16:24:42.752455','2024-10-16','mèo anh','FEMALE','','Em Chítt','CAT',_binary '',2,'8a86bfb2-1e9d-11f0-8fdf-0242ac110002');
/*!40000 ALTER TABLE `pet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `description` text,
  `image` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(38,2) NOT NULL,
  `stock` int(11) NOT NULL,
  `category_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK1mtsbur82frn64de7balymq9s` (`category_id`),
  CONSTRAINT `FK1mtsbur82frn64de7balymq9s` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES ('060fbe0c-da15-4f07-80bf-dfc723eddec5','2025-05-22 15:41:30.431604',_binary '','2025-05-22 15:41:30.432605','<h1>Kệ Hoa Chia Buồn Chốn Bình Yên 035</h1><p class=\"ql-align-justify\">Trải qua thời khắc đau buồn, tiếc thương khi phải đối mặt với sự ra đi hoặc khi nghe tin về một người quen thân vừa qua đời, đó luôn là một khoảnh khắc đau lòng và là điều mà không ai mong muốn phải trải qua trong đời. Trong thời điểm đau buồn ấy, hoa chia buồn là cách để chúng ta gửi đi những lời chia sẻ từ trái tim, là biểu tượng của kính trọng, lời chia buồn và tình cảm chân thành. Từng bông hoa, mỗi cành lá đều mang theo những ý nghĩa sâu sắc, chứa đựng những thông điệp không thể nói thành lời, thể hiện những nỗi niềm tiếc thương của người ở lại. Bộ sưu tập&nbsp;<a href=\"https://shop.dalathasfarm.com/c/hoa-chia-buon/\" target=\"_blank\" style=\"color: rgb(245, 136, 49); background-color: transparent;\"><strong>Hoa Chia Buồn</strong></a>&nbsp;là những sản phẩm được Dalat Hasfarm chuẩn bị tỉ mỉ, kết hợp hài hòa nhiều loại hoa tươi đẹp thay bạn chia sẻ nỗi đau đồng thời hy vọng mang đến một chút an ủi trong những thời điểm khó khăn. Những sản phẩm Hoa Chia Buồn luôn luôn được chuẩn bị cẩn thận, tỉ mỉ, chỉn chu nhất cũng là cách Dalat Hasfarm thể hiện sự tôn trọng, giúp người gửi và người nhận cảm nhận được sự chân thành và đồng cảm.</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/APMI/APMIXUS035/1718262819_666a9c237c0a5.jpg\" alt=\"Kệ Hoa Chia Buồn Chốn Bình Yên 035 Dalat Hasfarm\"></p><p class=\"ql-align-center\">Kệ Hoa Chia Buồn Chốn Bình Yên 035</p><p class=\"ql-align-justify\"><strong>Kệ Hoa Chia Buồn Chốn Bình Yên 035&nbsp;</strong>sử dụng hoa tươi được lựa chọn cẩn thận, đảm bảo độ bền, vẻ đẹp của hoa cùng với thiết trang trọng, tinh tế giúp bạn truyền tải những thông điệp đầy ý nghĩa và lòng kính trọng trong những giây phút trang nghiêm nhất. Hoa tươi được kết hợp cùng với cành lá, phụ kiện... tạo điểm nhấn, làm nổi bật hơn vẻ đẹp, sự trang trọng cho kệ hoa và phù hợp với không khí chia buồn.&nbsp;<strong>Kệ Hoa Chia Buồn Chốn Bình Yên 035</strong>&nbsp;được chọn tông màu trắng - xanh lá mang đến sự thanh lịch, trang nhã, tôn kính, thay bạn thể hiện lòng tôn trọng và tưởng nhớ đối với người đã khuất.</p><p class=\"ql-align-center\">&nbsp;</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/APMI/APMIXUS035/1718262909_666a9c7d9df8e.jpg\" alt=\"Kệ Hoa Chia Buồn Chốn Bình Yên 035 Dalat Hasfarm\"></p><p class=\"ql-align-center\">Kệ Hoa Chia Buồn Chốn Bình Yên 035</p><p><br></p>','1747903290352_anhchiabuon.jpg','Kệ Hoa Chia Buồn Chốn Bình Yên 035',1900000.00,30,'e7c30e43-784a-4393-b2cc-5f0c8d6e0002'),('090c8dfe-9d5c-4155-99b2-35925cbd2d7f','2025-04-29 09:08:43.836301',_binary '','2025-05-23 01:08:13.489622','<h1>Bó Hoa Cưới 039</h1><p class=\"ql-align-justify\">Từng loại hoa mang những ý nghĩa đặc biệt riêng, Dalat Hasfarm gửi bạn yêu hoa nhiều lựa chọn Hoa cưới&nbsp;tuyệt vời cùng những đóa hoa thơm xinh, rực rỡ để bạn dễ dàng chọn được bó hoa phù hợp nhất dành cho ngày đặc biệt. Những cánh hoa rạng rỡ tươi xinh và ẩn chứa nhiều ý nghĩa sẽ là lựa chọn hoàn hảo nhất để gửi trọn những thông điệp trong ngày hạnh phúc.</p><p class=\"ql-align-center\"><br></p><p class=\"ql-align-center\"><br></p><p><br></p>','1747894342169_hoacuoi039.jpg','Bó Hoa Cưới 039',1300000.00,15,'23a443a9-8a1d-4dc7-bc52-09e3dffa73aa'),('0919a0c0-56a0-41b1-b54c-ac8a9256c6c1','2025-05-22 15:32:45.061351',_binary '','2025-05-22 15:35:29.529851','<h1>Kệ Hoa Chúc Mừng Mini 049</h1><p class=\"ql-align-justify\">Hoa tươi là món quà chúc mừng tuyệt vời nhất để gửi đến người thân yêu, bạn bè, đối tác… hướng đến sự phát triển thuận lợi, một chặng đường mới với nhiều điều tốt lành, may mắn đồng thời mang đến sự cổ vũ, động viên trong những dịp đặc biệt của cuộc sống. Những sản phẩm trong Bộ sưu tập&nbsp;<a href=\"https://shop.dalathasfarm.com/c/hoa-chuc-mung/\" target=\"_blank\" style=\"color: rgb(245, 136, 49); background-color: transparent;\"><strong>Hoa Chúc Mừng</strong></a>&nbsp;từ Dalat Hasfarm là món quà hoàn hảo để dành tặng những dịp trọng đại như khai trương, ngày lễ, kỷ niệm lớn… Gửi tặng hoa tươi đến bạn bè, đối tác hay đồng nghiệp trong ngày trọng đại không chỉ là một hành động tử tế mà còn là cách để cùng đồng hành, chia sẻ niềm vui và thành công trong cuộc sống. Những bông hoa rực rỡ mang lại màu sắc tươi mới, thay bạn gửi đi lời chúc mừng, quan tâm, đồng cảm, thể hiện lòng biết ơn và tôn trọng đối với những mối quan hệ quan trọng xung quanh. Hoa tươi từ Dalat Hasfarm với chất lượng tuyệt vời, phong cách thiết kế độc đáo, sáng tạo, phù hợp với mọi dịp khác nhau là một lựa chọn tuyệt vời để thể hiện tình cảm và lời chúc chân thành, tốt đẹp nhất đến những người thân yêu của bạn.</p><p class=\"ql-align-justify\"><strong>Kệ Hoa Chúc Mừng Mini 043</strong>&nbsp;được thiết kế với kích thước nhỏ hơn những loại kệ hoa chúc mừng thông thường, với thiết kế đặc biệt này sẽ thích hợp với những không gian nhỏ, đặt trên bàn... cũng như phù hợp để làm món quà chúc mừng tinh tế, nhẹ nhàng hơn.&nbsp;</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/APMI/APMIXUS043/1725511509_66d93755e19e4.jpg\"></p><p class=\"ql-align-center\">Kệ Hoa Chúc Mừng Mini 043</p><p class=\"ql-align-justify\"><strong>Kệ Hoa Chúc Mừng Mini 043&nbsp;</strong>được Dalat Hasfarm lựa chọn từng cành hoa, lá xinh tươi, rực rỡ mang nhiều ý nghĩa tốt lành cùng với thiết kế tỉ mỉ, ấn tượng chắc chắn sẽ truyền tải đủ đầy thông điệp chúc mừng, may mắn, và thành công đến người nhận. Gửi tặng Kệ Hoa Chúc Mừng Mini 043 vừa biểu đạt sự chúc mừng, thể hiện ý nghĩa tinh thần to lớn, tình cảm chân thành vừa làm đẹp không gian, tạo cảm giác trang trọng, tươi mới và sống động cho buổi lễ hoặc sự kiện.&nbsp;Trong văn hóa phương Đông, màu đỏ&nbsp;là biểu tượng của sự may mắn và thịnh vượng,&nbsp;mang lại cảm giác nhiệt huyết, hân hoan vì thế màu đỏ trở thành một lựa chọn phổ biến và ý nghĩa trong nhiều dịp đặc biệt.&nbsp;<strong>Kệ Hoa Chúc Mừng Mini 043</strong>&nbsp;từ Dalat Hasfarm chắc chắn sẽ món quà chúc mừng tuyệt vời nhất, hướng đến sự phát triển thuận lợi, mở ra chặng đường mới với nhiều điều tốt lành.&nbsp;</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/APMI/APMIXUS043/1725511514_66d9375abf6fc.jpg\"></p><p class=\"ql-align-center\">Kệ Hoa Chúc Mừng Mini 043</p><p class=\"ql-align-justify\"><strong>Lý do bạn nên chọn mua hoa tươi Dalat Hasfarm?</strong></p><p class=\"ql-align-justify\">Với quy trình sản xuất khép kín và hệ thống trang trại nhà kính công nghệ cao, sản phẩm hoa tươi từ Dalat Hasfarm luôn được trồng và chăm sóc hoa theo định hướng bền vững, cũng như luôn đảm bảo chất lượng cao từ khâu quản lý sản xuất, thu hoạch, bảo quản cho đến phân phối.&nbsp;Bên cạnh đó, hoa tươi còn được ứng dụng công nghệ trồng hoa sạch, áp dụng biện pháp thiên địch sinh học Bio-Pro trong quá trình ươm trồng và chăm sóc hoa, mang đến cho khách hàng những bông hoa không chỉ&nbsp;<strong>bền, đẹp</strong>&nbsp;mà còn&nbsp;<strong>sạch, tươi, mới</strong>&nbsp;và đặc biệt&nbsp;<strong>an toàn cho sức khỏe</strong>.</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/APMI/APMIXUS043/1725511512_66d93758145aa.jpg\"></p><p class=\"ql-align-center\">Kệ Hoa Chúc Mừng Mini 043</p><p>Ngoài ra, khi đặt mua&nbsp;<strong>Kệ&nbsp;Hoa Chúc Mừng Mini 043</strong>&nbsp;tại Dalat Hasfarm bạn còn nhận được lợi ích đi kèm như:</p><p class=\"ql-align-justify\"><em>1. Hoa tươi, sạch, chất lượng, an toàn.</em></p><p class=\"ql-align-justify\"><em>2. Giao hàng nhanh chóng.</em></p><p class=\"ql-align-justify\"><em>3. Tặng banner cho đơn hàng bất kỳ.</em></p><p class=\"ql-align-justify\"><em>4. Cam kết hoa tươi, đẹp.</em></p><p class=\"ql-align-justify\"><em>5. Xuất hóa đơn VAT, chứng từ đầy đủ.</em></p><p><br></p>','1747902929396_hoachucmung049.jpg','Kệ Hoa Chúc Mừng Mini 049',1300000.00,6,'66dd52cb-4154-4f95-9333-f36d6b31e660'),('3e398a15-e86e-4ac7-ab49-dfc01a09604b','2025-05-22 15:42:18.811710',_binary '','2025-05-22 15:44:35.548082','<h1>Kệ Hoa Chia Buồn Chốn Bình Yên 036</h1><p class=\"ql-align-justify\">Trải qua thời khắc đau buồn, tiếc thương khi phải đối mặt với sự ra đi hoặc khi nghe tin về một người quen thân vừa qua đời, đó luôn là một khoảnh khắc đau lòng và là điều mà không ai mong muốn phải trải qua trong đời. Trong thời điểm đau buồn ấy, hoa chia buồn là cách để chúng ta gửi đi những lời chia sẻ từ trái tim, là biểu tượng của kính trọng, lời chia buồn và tình cảm chân thành. Từng bông hoa, mỗi cành lá đều mang theo những ý nghĩa sâu sắc, chứa đựng những thông điệp không thể nói thành lời, thể hiện những nỗi niềm tiếc thương của người ở lại. Bộ sưu tập&nbsp;<a href=\"https://shop.dalathasfarm.com/c/hoa-chia-buon/\" target=\"_blank\" style=\"color: rgb(245, 136, 49); background-color: transparent;\"><strong>Hoa Chia Buồn</strong></a>&nbsp;là những sản phẩm được Dalat Hasfarm chuẩn bị tỉ mỉ, kết hợp hài hòa nhiều loại hoa tươi đẹp thay bạn chia sẻ nỗi đau đồng thời hy vọng mang đến một chút an ủi trong những thời điểm khó khăn. Những sản phẩm Hoa Chia Buồn luôn luôn được chuẩn bị cẩn thận, tỉ mỉ, chỉn chu nhất cũng là cách Dalat Hasfarm thể hiện sự tôn trọng, giúp người gửi và người nhận cảm nhận được sự chân thành và đồng cảm.</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/APMI/APMIXUS036/1718268652_666ab2ec8d2be.jpg\" alt=\"Kệ Hoa Chia Buồn Chốn Bình Yên 036 Dalat Hasfarm\"></p><p class=\"ql-align-center\">Kệ Hoa Chia Buồn Chốn Bình Yên 036</p><p class=\"ql-align-justify\"><strong>Kệ Hoa Chia Buồn Chốn Bình Yên 036&nbsp;</strong>sử dụng hoa tươi được lựa chọn cẩn thận, đảm bảo độ bền, vẻ đẹp của hoa cùng với thiết trang trọng, tinh tế giúp bạn truyền tải những thông điệp đầy ý nghĩa và lòng kính trọng trong những giây phút trang nghiêm nhất. Hoa tươi được kết hợp cùng với cành lá, phụ kiện... tạo điểm nhấn, làm nổi bật hơn vẻ đẹp, sự trang trọng cho kệ hoa và phù hợp với không khí chia buồn.&nbsp;<strong>Kệ Hoa Chia Buồn Chốn Bình Yên 036</strong>&nbsp;được chọn tông màu trắng - xanh lá mang đến sự thanh lịch, trang nhã, tôn kính, thay bạn thể hiện lòng tôn trọng và tưởng nhớ đối với người đã khuất.</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/APMI/APMIXUS036/1718268653_666ab2ed36625.jpg\" alt=\"Kệ Hoa Chia Buồn Chốn Bình Yên 036 Dalat Hasfarm\"></p><p class=\"ql-align-center\">Kệ Hoa Chia Buồn Chốn Bình Yên 036</p><p><br></p>','1747903475417_hoachiabuon036.jpg','Kệ Hoa Chia Buồn Chốn Bình Yên 036',1950000.00,15,'e7c30e43-784a-4393-b2cc-5f0c8d6e0002'),('567cd581-7805-407c-b883-1ce1e944225a','2025-05-22 15:59:40.898653',_binary '','2025-05-22 15:59:40.898653','<h1>Power 4 Plant - Dinh Dưỡng Cho Cây</h1><p>Cùng với xu hướng sống xanh đang lan tỏa mạnh mẽ, việc trồng cây trong nhà được rất nhiều gia đình quan tâm, chú trọng tạo mảng xanh ngay trong không gian sống và làm việc của mình. Rất nhiều nghiên cứu đã chứng minh Cây Xanh mang đến lợi ích trong việc làm sạch không khí, hút bụi, hấp thụ những chất độc hại, giảm căng thẳng và mỏi mắt, tăng sự thư giãn. </p><p>&nbsp;</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/DGP1/DGP14UD016/DSC_5027-Edit123_800x800.jpg\"></p><p class=\"ql-align-center\">&nbsp;</p><p>Cây xanh mang đến sự tươi mát, giúp con người gần gũi hơn với thiên nhiên và làm cho ngôi nhà trở nên sinh động hơn. Bên cạnh đó, màu xanh của cây sẽ giúp con người cảm thấy thoải mái, thư giãn hơn.&nbsp;Cũng như trong tự nhiên, khi bạn làm việc trong môi trường được trang trí xung quanh là thực vật giúp cải thiện sự tập trung, nâng cao trí nhớ và năng suất làm việc.</p><p>&nbsp;</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/TFER/TFER01-AA01/z4236265249804_2a04a9a924558bf7cc071229b4809359_800x800.jpg\"></p><p class=\"ql-align-center\">&nbsp;</p><p>Để cây trong nhà phát triển bền vững, khỏe mạnh, cần thường xuyên bổ sung chất dinh dưỡng cho cây. Vì vậy, Dalat Hasfarm cung cấp Túi Dinh Dưỡng Power 4 Plant để bổ sung dưỡng chất cho dòng Cây Xanh, giúp khách hàng có thể tự chăm bón cây tại nhà một cách dễ dàng và nhanh chóng.</p><p>&nbsp;</p><p>Việc sử dụng Power 4 Plant vô cùng đơn giản: mỗi lần sử dụng bạn cho 1/2 túi - cho chậu cây xanh size đường kính 12cm và mỗi lần cách nhau 1.5 tháng.</p><ul><li>Bước 1: Cắt túi giấy đựng các viên dinh dưỡng Power 4 Plant.</li><li>Bước 2: Rải đều khắp mặt đất trên chậu cây.</li><li>Bước 3: Tưới ẩm đều để viên dinh dưỡng tan dần.</li></ul><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/TFER/TFER01-AA01/z4236265268698_ba6f317acc27ab530d2b7c06fc007090_800x800.jpg\"></p><p><img src=\"https://shop.dalathasfarm.com/blog/wp-content/uploads/2021/06/Artboard-1-copy-2.png\"></p>','1747904380849_power4plant.jpeg','Power 4 Plant - Dinh Dưỡng Cho Cây',70000.00,15,'847f7510-1764-468d-8c66-e42d24bfc40b'),('5db1cb54-1cae-4a29-9c7a-196bec1a115e','2025-05-22 15:47:44.535712',_binary '','2025-05-22 15:47:44.536715','<p class=\"ql-align-justify\"><strong>Hoa Baby (Gypsophila)&nbsp;</strong>có nguồn gốc Địa Trung Hải và Đông Âu, tên gọi Baby xuất phát từ tên “Baby’s breath” nghĩa là hơi thở trẻ thơ vì vẻ đẹp thuần khiết và mong manh. Hoa Baby thường được chọn cho bó hoa cưới và các loại hoa truyền thống khác, chẳng hạn như hoa cài áo, hoa cài áo và trang trí đám cưới. Ngoài ra, Hoa Baby cũng thích hợp làm điểm nhấn cho những loài hoa rực rỡ hơn như Hoa Hồng, Cúc Mẫu Đơn, Mẫu Đơn, Hướng Dương, Lily, Tulip... Hoa Baby phù hợp để chúc mừng những dịp đặc biệt như chào đón em bé mới chào đời, sinh nhật, các dịp kỷ niệm và ngày lễ tình nhân. Với hình dáng tinh tế, nhẹ nhàng tượng trưng cho sự chân thành, thuần khiết, tình yêu thương, ngây thơ... hoa Baby trở thành một lựa chọn hoàn hảo cho nhiều dịp khác nhau.</p><p class=\"ql-align-justify\"><strong>Bó Hoa Giọt Nắng Tinh Khôi 608</strong>&nbsp;sử dụng Baby được sắp xếp cẩn thận, gói giấy, thắt nơ tinh tế sẽ tăng thêm sự sang trọng và ý nghĩa của món quà. Mỗi bông hoa Baby như những tia sáng nhỏ, tạo nên một món quà đặc biệt và ý nghĩa, thể hiện sự quan tâm, tri ân đặc biệt dành cho người nhận. Bằng cách này, bó hoa không chỉ đơn giản là một món quà mà còn là một cách để thể hiện tình cảm và gắn kết giữa các trái tim, mang lại cảm giác ấm áp và hạnh phúc cho người nhận. Dù bó hoa đơn giản nhưng vẫn đặc biệt bởi Hoa Baby với cánh hoa trắng mềm tinh khôi, nhẹ nhàng nhưng vẫn toả sáng theo cách riêng, là sứ giả gắn kết những trái tim.&nbsp;Từng bông hoa được Dalat Hasfarm cẩn thận lựa chọn, tỉ mỉ sắp xếp để tất cả hòa quyện thành một tác phẩm nghệ thuật từ thiên nhiên xinh đẹp, tinh tế tạo nên một món quà tuyệt vời gửi trao cảm xúc chân thành nhất đến người nhận.</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/AFFM/AFFMIXD608/1727141834_66f217caccab7.jpg\" alt=\"Bó Hoa Giọt Nắng Tinh Khôi 608 Hoa Baby Gypsophila Baby’s breath Dalat Hasfarm\"></p><p class=\"ql-align-center\">Bó Hoa Giọt Nắng Tinh Khôi 608</p><p class=\"ql-align-justify\"><strong>Bó Hoa Giọt Nắng Tinh Khôi 608</strong>&nbsp;không chỉ là món quà tặng đơn thuần mà có thể để trang trí không gian sống và làm việc, mang đến sự tươi mới, đầy sức sống và niềm vui mỗi khi ngắm nhìn bởi bạn hoàn toàn yên tâm về chất lượng sạch và an toàn của từng cành hoa từ Dalat Hasfarm. Bạn nên đặt hoa ở nhiệt độ mát, tránh để hoa tiếp xúc với nguồn nhiệt cao (ánh nắng mặt trời chiếu trực tiếp hoặc gần các thiết bị phát nhiệt), quạt gió trực tiếp và cạnh hoa quả chín (khí ethylene từ hoa quả có thể ảnh hưởng đến độ bền của hoa) đồng thời nên bổ sung nước để giữ cho hoa tươi lâu hơn.</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/AFFM/AFFMIXD608/1727141832_66f217c8133e2.jpg\" alt=\"Bó Hoa Giọt Nắng Tinh Khôi 608 Hoa Baby Gypsophila Baby’s breath Dalat Hasfarm\"></p><p class=\"ql-align-center\">Bó Hoa Giọt Nắng Tinh Khôi 608</p><p class=\"ql-align-justify\"><strong>Vì sao nên tặng hoa tươi cho người mình thương?</strong></p><p class=\"ql-align-justify\">Một nghiên cứu của trường đại học Rutgers đã chỉ ra rằng những người nhận được món quà là hoa tươi sẽ có cảm xúc tích cực và vui vẻ trong nhiều ngày liền (Haviland-Jones, 2005). Điều đó đã chứng minh rằng hoa tươi là một trong những món quà tuyệt vời nhất để tạo dấu ấn và mang lại những giây phút hạnh phúc cho một ngày đặc biệt.</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/AFFM/AFFMIXD608/1727141839_66f217cf07c61.jpg\" alt=\"Bó Hoa Giọt Nắng Tinh Khôi 608 Hoa Baby Gypsophila Baby’s breath Dalat Hasfarm\"></p><p class=\"ql-align-center\">Bó Hoa Giọt Nắng Tinh Khôi 608</p><p class=\"ql-align-justify\"><strong>Lý do bạn nên chọn mua hoa tươi Dalat Hasfarm?</strong></p><p class=\"ql-align-justify\">Với quy trình sản xuất khép kín và hệ thống trang trại nhà kính công nghệ cao, sản phẩm hoa tươi từ Dalat Hasfarm luôn được trồng và chăm sóc hoa theo định hướng bền vững, cũng như luôn đảm bảo chất lượng cao từ khâu quản lý sản xuất, thu hoạch, bảo quản cho đến phân phối.&nbsp;Bên cạnh đó, hoa tươi còn được ứng dụng công nghệ trồng hoa sạch, áp dụng biện pháp thiên địch sinh học Bio-Pro trong quá trình ươm trồng và chăm sóc hoa, mang đến cho khách hàng những bông hoa không chỉ&nbsp;<strong>bền, đẹp</strong>&nbsp;mà còn&nbsp;<strong>sạch, tươi, mới</strong>&nbsp;và đặc biệt&nbsp;<strong>an toàn cho sức khỏe</strong>.</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/AFFM/AFFMIXD608/1727141841_66f217d1aa28f.jpg\" alt=\"Bó Hoa Giọt Nắng Tinh Khôi 608 Hoa Baby Gypsophila Baby’s breath Dalat Hasfarm\"></p><p><br></p>','1747903664305_Hoaxinhgiare01.jpg','Bó Hoa Giọt Nắng Tinh Khôi 608',450000.00,25,'d0d87a73-27ea-4910-b1fd-69d9c45305ff'),('6edad369-7aca-4a87-8696-78d0e6706d9a','2025-05-22 15:32:45.225690',_binary '','2025-05-22 15:32:45.225690','<h1>Kệ Hoa Chúc Mừng Mini 043</h1><p class=\"ql-align-justify\">Hoa tươi là món quà chúc mừng tuyệt vời nhất để gửi đến người thân yêu, bạn bè, đối tác… hướng đến sự phát triển thuận lợi, một chặng đường mới với nhiều điều tốt lành, may mắn đồng thời mang đến sự cổ vũ, động viên trong những dịp đặc biệt của cuộc sống. Những sản phẩm trong Bộ sưu tập&nbsp;<a href=\"https://shop.dalathasfarm.com/c/hoa-chuc-mung/\" target=\"_blank\" style=\"color: rgb(245, 136, 49); background-color: transparent;\"><strong>Hoa Chúc Mừng</strong></a>&nbsp;từ Dalat Hasfarm là món quà hoàn hảo để dành tặng những dịp trọng đại như khai trương, ngày lễ, kỷ niệm lớn… Gửi tặng hoa tươi đến bạn bè, đối tác hay đồng nghiệp trong ngày trọng đại không chỉ là một hành động tử tế mà còn là cách để cùng đồng hành, chia sẻ niềm vui và thành công trong cuộc sống. Những bông hoa rực rỡ mang lại màu sắc tươi mới, thay bạn gửi đi lời chúc mừng, quan tâm, đồng cảm, thể hiện lòng biết ơn và tôn trọng đối với những mối quan hệ quan trọng xung quanh. Hoa tươi từ Dalat Hasfarm với chất lượng tuyệt vời, phong cách thiết kế độc đáo, sáng tạo, phù hợp với mọi dịp khác nhau là một lựa chọn tuyệt vời để thể hiện tình cảm và lời chúc chân thành, tốt đẹp nhất đến những người thân yêu của bạn.</p><p class=\"ql-align-justify\"><strong>Kệ Hoa Chúc Mừng Mini 043</strong>&nbsp;được thiết kế với kích thước nhỏ hơn những loại kệ hoa chúc mừng thông thường, với thiết kế đặc biệt này sẽ thích hợp với những không gian nhỏ, đặt trên bàn... cũng như phù hợp để làm món quà chúc mừng tinh tế, nhẹ nhàng hơn.&nbsp;</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/APMI/APMIXUS043/1725511509_66d93755e19e4.jpg\"></p><p class=\"ql-align-center\">Kệ Hoa Chúc Mừng Mini 043</p><p class=\"ql-align-justify\"><strong>Kệ Hoa Chúc Mừng Mini 043&nbsp;</strong>được Dalat Hasfarm lựa chọn từng cành hoa, lá xinh tươi, rực rỡ mang nhiều ý nghĩa tốt lành cùng với thiết kế tỉ mỉ, ấn tượng chắc chắn sẽ truyền tải đủ đầy thông điệp chúc mừng, may mắn, và thành công đến người nhận. Gửi tặng Kệ Hoa Chúc Mừng Mini 043 vừa biểu đạt sự chúc mừng, thể hiện ý nghĩa tinh thần to lớn, tình cảm chân thành vừa làm đẹp không gian, tạo cảm giác trang trọng, tươi mới và sống động cho buổi lễ hoặc sự kiện.&nbsp;Trong văn hóa phương Đông, màu đỏ&nbsp;là biểu tượng của sự may mắn và thịnh vượng,&nbsp;mang lại cảm giác nhiệt huyết, hân hoan vì thế màu đỏ trở thành một lựa chọn phổ biến và ý nghĩa trong nhiều dịp đặc biệt.&nbsp;<strong>Kệ Hoa Chúc Mừng Mini 043</strong>&nbsp;từ Dalat Hasfarm chắc chắn sẽ món quà chúc mừng tuyệt vời nhất, hướng đến sự phát triển thuận lợi, mở ra chặng đường mới với nhiều điều tốt lành.&nbsp;</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/APMI/APMIXUS043/1725511514_66d9375abf6fc.jpg\"></p><p class=\"ql-align-center\">Kệ Hoa Chúc Mừng Mini 043</p><p class=\"ql-align-justify\"><strong>Lý do bạn nên chọn mua hoa tươi Dalat Hasfarm?</strong></p><p class=\"ql-align-justify\">Với quy trình sản xuất khép kín và hệ thống trang trại nhà kính công nghệ cao, sản phẩm hoa tươi từ Dalat Hasfarm luôn được trồng và chăm sóc hoa theo định hướng bền vững, cũng như luôn đảm bảo chất lượng cao từ khâu quản lý sản xuất, thu hoạch, bảo quản cho đến phân phối.&nbsp;Bên cạnh đó, hoa tươi còn được ứng dụng công nghệ trồng hoa sạch, áp dụng biện pháp thiên địch sinh học Bio-Pro trong quá trình ươm trồng và chăm sóc hoa, mang đến cho khách hàng những bông hoa không chỉ&nbsp;<strong>bền, đẹp</strong>&nbsp;mà còn&nbsp;<strong>sạch, tươi, mới</strong>&nbsp;và đặc biệt&nbsp;<strong>an toàn cho sức khỏe</strong>.</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/APMI/APMIXUS043/1725511512_66d93758145aa.jpg\"></p><p class=\"ql-align-center\">Kệ Hoa Chúc Mừng Mini 043</p><p>Ngoài ra, khi đặt mua&nbsp;<strong>Kệ&nbsp;Hoa Chúc Mừng Mini 043</strong>&nbsp;tại Dalat Hasfarm bạn còn nhận được lợi ích đi kèm như:</p><p class=\"ql-align-justify\"><em>1. Hoa tươi, sạch, chất lượng, an toàn.</em></p><p class=\"ql-align-justify\"><em>2. Giao hàng nhanh chóng.</em></p><p class=\"ql-align-justify\"><em>3. Tặng banner cho đơn hàng bất kỳ.</em></p><p class=\"ql-align-justify\"><em>4. Cam kết hoa tươi, đẹp.</em></p><p class=\"ql-align-justify\"><em>5. Xuất hóa đơn VAT, chứng từ đầy đủ.</em></p><p><br></p>','1747902765184_hoachucmung043.jpg','Kệ Hoa Chúc Mừng Mini 043',1300000.00,6,'66dd52cb-4154-4f95-9333-f36d6b31e660'),('787132ab-16b8-4133-a3fb-7d48491228fe','2025-05-22 12:12:54.986084',_binary '','2025-05-22 15:22:35.378089','<h1>Chậu Hoa Lavender Hạnh Phúc 204</h1><p class=\"ql-align-justify\"><span style=\"background-color: transparent;\">Mỗi ngày đều là một ngày đặc biệt để bạn thể hiện sự quan tâm, chăm sóc đến những người bạn yêu thương không chỉ bằng những lời chúc ấm áp mà còn bằng những đóa hoa khoe sắc rạng ngời. Hãy để những bông hoa rực rỡ nhất của Dalat Hasfarm được đồng hành cùng bạn trong từng khoảnh khắc đặc biệt, thú vị và đáng quý. Từng loại hoa sẽ mang những ý nghĩa đặc biệt khác nhau,&nbsp;</span><a href=\"https://shop.dalathasfarm.com/c/hoa-chau-thiet-ke/\" target=\"_blank\" style=\"background-color: transparent; color: rgb(255, 140, 0);\">BST Hoa Chậu Thiết Kế</a><span style=\"background-color: transparent; color: rgb(67, 67, 67);\">&nbsp;</span><span style=\"background-color: transparent;\">với nhiều loại hoa độc đáo, ưu điểm nổi bật là độ bền cao, dễ chăm sóc, những sản phẩm hoa trong chậu được các bạn florist của Dalat Hasfarm thiết kế xinh xắn là một món quà hoàn hảo nhất dành tặng người đặc biệt.&nbsp;</span><span style=\"color: rgb(67, 67, 67);\">Hoa tươi không đơn thuần chỉ là một món quà tặng mà từ lâu còn được xem là một vị “sứ giả tinh thần” giúp gửi trao những cảm xúc yêu thương. Những cánh hoa rạng rỡ tươi xinh và ẩn chứa nhiều ý nghĩa được chăm chút tỉ mỉ bởi Dalat Hasfarm sẽ là lựa chọn hoàn hảo nhất để gửi trao những thông điệp hạnh phúc.</span></p><p class=\"ql-align-justify\"><strong>Hoa Oải Hương (Lavender - Lavandula)&nbsp;</strong>có nguồn gốc từ khu vực Địa Trung Hải bao gồm miền Nam châu Âu, châu Á và Đông Bắc Phi. Oải Hương (Lavender) nổi tiếng với hương thơm dịu dàng trong hình dáng những bông hoa tím biếc mọc thành chùm trên những nhánh cây mảnh mai, tạo nên vẻ đẹp xinh xắn mộc mạc có phần hoang dại.&nbsp;Provence - Pháp là vùng đất nổi tiếng khắp thế giới với những cánh đồng Hoa Oải Hương rộng lớn và đẹp như tranh vẽ, khiến Hoa Oải Hương trở thành một trong những biểu tượng tiêu biểu nhất của vùng này.&nbsp;</p><p class=\"ql-align-justify\">Hoa Oải Hương (Lavender) thường gắn liền với sự tinh khiết, tĩnh lặng, tận tụy, thận trọng, thanh thản, duyên dáng và bình tĩnh. Hoa Oải Hương (Lavender) là loài hoa mang bản chất yên bình, nhẹ nhàng cả về màu sắc từ tím hồng, tím, xanh tím và hương thơm tự nhiên tinh tế. Từ xưa, Hoa Oải Hương (Lavender) đã nổi tiếng nhờ những lợi ích khi không chỉ là biểu tượng tinh tế trong trang trí không gian sống mà còn mang lại nhiều lợi ích sức khỏe bất ngờ. Với hương thơm nhẹ nhàng, thư giãn Lavender có tác dụng giảm căng thẳng, lo âu, giúp thư giãn tinh thần đồng thời có thể giúp cải thiện chất lượng giấc ngủ.&nbsp;</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/DDP7/DDP78AK204/1712367234_6610a68239600.jpg\" alt=\"Chậu Hoa Lavender Hạnh Phúc 204 Dalat Hasfarm\"></p><p class=\"ql-align-center\">Chậu Hoa Lavender Hạnh Phúc 204 - Hoa Oải Hương (Lavender) tươi&nbsp;</p><p class=\"ql-align-justify\"><strong>Hoa Oải Hương (Lavender)&nbsp;</strong>là một món quà tuyệt vời cho nhiều dịp khác nhau khi mang nhiều ý nghĩa tốt đẹp: tinh khiết, bình yên, tĩnh lặng và hạnh phúc. Với vẻ đẹp quyến rũ và hương thơm thư giãn, Hoa Oải Hương (Lavender) là một cách hoàn hảo để thể hiện sự quan tâm, tình yêu và sự chu đáo đến người nhận. Hoa Oải Hương (Lavender)&nbsp;được xem là biểu tượng của sự lãng mạn trong tình yêu và là \"thảo mộc tình yêu\" với sắc tím thơ mộng cùng hương thơm mang lại sự thư giãn và gắn kết.&nbsp;Hoa Oải Hương (Lavender) thích hợp cho những sự kiện đặc biệt như Ngày của Mẹ, Ngày của Cha, Ngày Lễ Tình Nhân, Ngày Quốc Tế Phụ Nữ hoặc những buổi tiệc chúc mừng, sinh nhật, tân gia, thăng chức... Ngoài ra, Hoa Lavender thể hiện lời cảm ơn, niềm tự hào và lời chúc tốt đẹp nhất cho một hành trình bình yên phía trước vì thế hoa cũng thích hợp cho những buổi lễ tốt nghiệp, tiệc chia tay...</p><p class=\"ql-align-justify\"><em>Tips: Sau khi Hoa Oải Hương (Lavender) tàn, bạn có thể tận dụng những nhánh hoa bằng cách&nbsp;cắt nhánh và phơi khô, hương thơm của hoa vẫn còn lưu lại và có những lợi ích gần như tương đương với cây khi còn trồng trong chậu.&nbsp;</em></p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/DDP7/DDP78AK204/1712367237_6610a685d258d.jpg\" alt=\"Chậu Hoa Lavender Hạnh Phúc 204 hoa oải hương dalat hasfarm\"></p><p class=\"ql-align-center\">Chậu Hoa Lavender Hạnh Phúc 204 - Hoa Oải Hương (Lavender) tươi&nbsp;</p><p class=\"ql-align-justify\">Mang nhiều thông điệp ý nghĩa,<strong>&nbsp;Chậu Hoa Lavender Hạnh Phúc 204</strong>&nbsp;không chỉ dùng để trang trí không gian sống mà còn là món quà hoàn hảo giúp bạn gửi những tình cảm tốt đẹp đến người thân. Cũng như những loại hoa trang trí khác, cây không thích hợp với nguồn nhiệt, quạt gió trực tiếp vì cây sẽ nhanh bị mất nước. Vì vậy, bạn cần cung cấp nước tưới thường xuyên, khuyến khích tưới ẩm 2-3 lần/tuần khi đặt trong nhà (nơi có ánh sáng). Bạn cần kiểm tra thường xuyên bề mặt giá thể/ đất trồng để kiểm soát lượng nước trong giá thể, tránh tình trạng quá khô hoặc quá ẩm/đọng nước sẽ ảnh hưởng đến độ bền của cây.</p><p><br></p>','1747890774575_1712367232_hoa.jpg','Chậu Hoa Lavender Hạnh Phúc 204',800000.00,10,'d0d87a73-27ea-4910-b1fd-69d9c45305ff'),('8859678f-0cfa-4e9a-a112-80d6cfc6ee85','2025-05-22 15:37:22.457457',_binary '','2025-05-22 15:37:22.463460','<p class=\"ql-align-justify\">Điểm nổi bật trong thiết kế của&nbsp;<strong>Kệ Hoa Chúc Mừng 048</strong>&nbsp;là khi sự kiện kết thúc, người nhận hoa có thể tháo rời phần giỏ hoa đã được cố định trên kệ gỗ xuống để tận dụng trang trí một không gian khác. Điều này làm cho món quà trở nên ý nghĩa hơn, lưu giữ được vẻ đẹp tươi tắn của những bông hoa ở điều kiện tốt hơn trong thời gian dài hơn.&nbsp;Nhờ vào thiết kế thông minh này,&nbsp;<strong>Kệ Hoa Chúc Mừng 048&nbsp;</strong>không chỉ là một món quà chúc mừng tinh tế mà còn mang lại sự tiện lợi và giá trị sử dụng lâu dài.</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/APMI/APMIXUS048/1725522184_66d96108ee6a4.jpg\"></p><p class=\"ql-align-center\">Kệ Hoa Chúc Mừng 048</p><p class=\"ql-align-justify\"><strong>Kệ Hoa Chúc Mừng 048&nbsp;</strong>được Dalat Hasfarm lựa chọn từng cành hoa, lá xinh tươi, rực rỡ mang nhiều ý nghĩa tốt lành cùng với thiết kế tỉ mỉ, ấn tượng chắc chắn sẽ truyền tải đủ đầy thông điệp chúc mừng, may mắn, và thành công đến người nhận. Gửi tặng Kệ Hoa Chúc Mừng 048 vừa biểu đạt sự chúc mừng, thể hiện ý nghĩa tinh thần to lớn, tình cảm chân thành vừa làm đẹp không gian, tạo cảm giác trang trọng, tươi mới và sống động cho buổi lễ hoặc sự kiện.&nbsp;Màu xanh dương thường được biết đến với ý nghĩa hi vọng, lạc quan, đổi mới và sáng tạo, vì thế màu xanh dương thường được lựa chọn trong những dịp đặc biệt. Những kệ hoa màu tone sáng như vàng - xanh dương luôn xuất hiện như một yếu tố chủ đạo trong các sự kiện đặc biệt như cưới hỏi, tiệc chúc mừng, lễ khởi công hay khai trương...&nbsp;<strong>Kệ Hoa Chúc Mừng 048</strong>&nbsp;với sự kết hợp tinh tế giữa tone vàng - xanh dương từ Dalat Hasfarm chắc chắn sẽ món quà chúc mừng tuyệt vời nhất, hướng đến sự phát triển thuận lợi, mở ra chặng đường mới với nhiều điều tốt lành.&nbsp;</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/APMI/APMIXUS048/1725522186_66d9610a96ae8.jpg\"></p><p class=\"ql-align-center\">Kệ Hoa Chúc Mừng 048</p><p class=\"ql-align-justify\"><strong>Lý do bạn nên chọn mua hoa tươi Dalat Hasfarm?</strong></p><p class=\"ql-align-justify\">Với quy trình sản xuất khép kín và hệ thống trang trại nhà kính công nghệ cao, sản phẩm hoa tươi từ Dalat Hasfarm luôn được trồng và chăm sóc hoa theo định hướng bền vững, cũng như luôn đảm bảo chất lượng cao từ khâu quản lý sản xuất, thu hoạch, bảo quản cho đến phân phối.&nbsp;Bên cạnh đó, hoa tươi còn được ứng dụng công nghệ trồng hoa sạch, áp dụng biện pháp thiên địch sinh học Bio-Pro trong quá trình ươm trồng và chăm sóc hoa, mang đến cho khách hàng những bông hoa không chỉ&nbsp;<strong>bền, đẹp</strong>&nbsp;mà còn&nbsp;<strong>sạch, tươi, mới</strong>&nbsp;và đặc biệt&nbsp;<strong>an toàn cho sức khỏe</strong>.</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/APMI/APMIXUS048/1725522215_66d9612740406.jpg\"></p><p class=\"ql-align-center\">Kệ Hoa Chúc Mừng 048</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/APMI/APMIXUS048/1725522213_66d961256d64b.jpg\"></p><p class=\"ql-align-center\">Kệ Hoa Chúc Mừng 048</p><p><br></p>','1747903042172_hoachucmung048.jpg','Kệ Hoa Chúc Mừng 048',2700000.00,20,'66dd52cb-4154-4f95-9333-f36d6b31e660'),('8bafaa22-d7f6-4299-87b0-9fe99c13a610','2025-05-22 15:43:26.745272',_binary '','2025-05-22 15:43:26.745908','<h1>Kệ Hoa Chia Buồn Chốn Bình Yên 011</h1><p class=\"ql-align-justify\">Trải qua thời khắc đau buồn, tiếc thương khi phải đối mặt với sự ra đi hoặc khi nghe tin về một người quen thân vừa qua đời, đó luôn là một khoảnh khắc đau lòng và là điều mà không ai mong muốn phải trải qua trong đời. Trong thời điểm đau buồn ấy, hoa chia buồn là cách để chúng ta gửi đi những lời chia sẻ từ trái tim, là biểu tượng của kính trọng, lời chia buồn và tình cảm chân thành. Từng bông hoa, mỗi cành lá đều mang theo những ý nghĩa sâu sắc, chứa đựng những thông điệp không thể nói thành lời, thể hiện những nỗi niềm tiếc thương của người ở lại. Bộ sưu tập&nbsp;<a href=\"https://shop.dalathasfarm.com/c/hoa-chia-buon/\" target=\"_blank\" style=\"color: rgb(245, 136, 49); background-color: transparent;\"><strong>Hoa Chia Buồn</strong></a>&nbsp;là những sản phẩm được Dalat Hasfarm chuẩn bị tỉ mỉ, kết hợp hài hòa nhiều loại hoa tươi đẹp thay bạn chia sẻ nỗi đau đồng thời hy vọng mang đến một chút an ủi trong những thời điểm khó khăn. Những sản phẩm Hoa Chia Buồn luôn luôn được chuẩn bị cẩn thận, tỉ mỉ, chỉn chu nhất cũng là cách Dalat Hasfarm thể hiện sự tôn trọng, giúp người gửi và người nhận cảm nhận được sự chân thành và đồng cảm.</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/WSPA/WSPAR0006/1718098642_66681ad2e7ade.jpg\" alt=\"Kệ Hoa Chia Buồn Chốn Bình Yên 011\"></p><p class=\"ql-align-center\">Kệ Hoa Chia Buồn Chốn Bình Yên 011</p><p class=\"ql-align-justify\"><strong>Kệ Hoa Chia Buồn Chốn Bình Yên 011&nbsp;</strong>sử dụng hoa tươi được lựa chọn cẩn thận, đảm bảo độ bền, vẻ đẹp của hoa cùng với thiết trang trọng, tinh tế giúp bạn truyền tải những thông điệp đầy ý nghĩa và lòng kính trọng trong những giây phút trang nghiêm nhất. Hoa tươi được kết hợp cùng với cành lá, phụ kiện... tạo điểm nhấn, làm nổi bật hơn vẻ đẹp, sự trang trọng cho kệ hoa và phù hợp với không khí chia buồn.&nbsp;<strong>Kệ Hoa Chia Buồn Chốn Bình Yên 011</strong>&nbsp;được chọn tông màu trắng mang đến sự thanh lịch, trang nhã, tôn kính, thay bạn thể hiện lòng tôn trọng và tưởng nhớ đối với người đã khuất.</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/WSPA/WSPAR0006/hoa-chia-buon-chon-binh-yen_2_800x800.jpg\" alt=\"Kệ Hoa Chia Buồn Chốn Bình Yên 011\"></p><p class=\"ql-align-center\">Kệ Hoa Chia Buồn Chốn Bình Yên 011</p><p><br></p>','1747903406598_hoachiabuon011.jpg','Kệ Hoa Chia Buồn Chốn Bình Yên 011',1850000.00,33,'e7c30e43-784a-4393-b2cc-5f0c8d6e0002'),('8cd595b8-27d0-45c7-9237-e0d2ed2f19e8','2025-05-22 15:39:43.174649',_binary '','2025-05-22 15:39:43.177649','<h1>Kệ Hoa Chúc Mừng 046</h1><p class=\"ql-align-justify\">Hoa tươi là món quà chúc mừng tuyệt vời nhất để gửi đến người thân yêu, bạn bè, đối tác… hướng đến sự phát triển thuận lợi, một chặng đường mới với nhiều điều tốt lành, may mắn đồng thời mang đến sự cổ vũ, động viên trong những dịp đặc biệt của cuộc sống. Những sản phẩm trong Bộ sưu tập&nbsp;<a href=\"https://shop.dalathasfarm.com/c/hoa-chuc-mung/\" target=\"_blank\" style=\"color: rgb(245, 136, 49); background-color: transparent;\"><strong>Hoa Chúc Mừng</strong></a>&nbsp;từ Dalat Hasfarm là món quà hoàn hảo để dành tặng những dịp trọng đại như khai trương, ngày lễ, kỷ niệm lớn… Gửi tặng hoa tươi đến bạn bè, đối tác hay đồng nghiệp trong ngày trọng đại không chỉ là một hành động tử tế mà còn là cách để cùng đồng hành, chia sẻ niềm vui và thành công trong cuộc sống. Những bông hoa rực rỡ mang lại màu sắc tươi mới, thay bạn gửi đi lời chúc mừng, quan tâm, đồng cảm, thể hiện lòng biết ơn và tôn trọng đối với những mối quan hệ quan trọng xung quanh. Hoa tươi từ Dalat Hasfarm với chất lượng tuyệt vời, phong cách thiết kế độc đáo, sáng tạo, phù hợp với mọi dịp khác nhau là một lựa chọn tuyệt vời để thể hiện tình cảm và lời chúc chân thành, tốt đẹp nhất đến những người thân yêu của bạn.</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/APMI/APMIXUS046/1725520948_66d95c34c5749.jpg\"></p><p class=\"ql-align-center\">Kệ Hoa Chúc Mừng 046</p><p class=\"ql-align-justify\"><strong>Kệ Hoa Chúc Mừng 046&nbsp;</strong>được Dalat Hasfarm lựa chọn từng cành hoa, lá xinh tươi, rực rỡ mang nhiều ý nghĩa tốt lành cùng với thiết kế tỉ mỉ, ấn tượng chắc chắn sẽ truyền tải đủ đầy thông điệp chúc mừng, may mắn, và thành công đến người nhận. Gửi tặng Kệ Hoa Chúc Mừng 046 vừa biểu đạt sự chúc mừng, thể hiện ý nghĩa tinh thần to lớn, tình cảm chân thành vừa làm đẹp không gian, tạo cảm giác trang trọng, tươi mới và sống động cho buổi lễ hoặc sự kiện.&nbsp;Trong văn hóa của người châu Á, màu vàng được xem là màu sắc của sự may mắn, ấm áp và tràn đầy năng lượng. Những kệ hoa màu tone vàng luôn xuất hiện như một yếu tố chủ đạo trong các sự kiện đặc biệt như cưới hỏi, tiệc chúc mừng, lễ khởi công hay khai trương...&nbsp;<strong>Kệ Hoa Chúc Mừng 046</strong>&nbsp;với sự kết hợp tinh tế giữa tone vàng - xanh lá từ Dalat Hasfarm chắc chắn sẽ món quà chúc mừng tuyệt vời nhất, hướng đến sự phát triển thuận lợi, mở ra chặng đường mới với nhiều điều tốt lành.&nbsp;</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/APMI/APMIXUS046/1725520950_66d95c368bb55.jpg\"></p><p class=\"ql-align-center\">Kệ Hoa Chúc Mừng 046</p><p class=\"ql-align-justify\"><strong>Lý do bạn nên chọn mua hoa tươi Dalat Hasfarm?</strong></p><p class=\"ql-align-justify\">Với quy trình sản xuất khép kín và hệ thống trang trại nhà kính công nghệ cao, sản phẩm hoa tươi từ Dalat Hasfarm luôn được trồng và chăm sóc hoa theo định hướng bền vững, cũng như luôn đảm bảo chất lượng cao từ khâu quản lý sản xuất, thu hoạch, bảo quản cho đến phân phối.&nbsp;Bên cạnh đó, hoa tươi còn được ứng dụng công nghệ trồng hoa sạch, áp dụng biện pháp thiên địch sinh học Bio-Pro trong quá trình ươm trồng và chăm sóc hoa, mang đến cho khách hàng những bông hoa không chỉ&nbsp;<strong>bền, đẹp</strong>&nbsp;mà còn&nbsp;<strong>sạch, tươi, mới</strong>&nbsp;và đặc biệt&nbsp;<strong>an toàn cho sức khỏe</strong>.</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/APMI/APMIXUS046/1725520952_66d95c38e6e79.jpg\"></p><p class=\"ql-align-center\">Kệ Hoa Chúc Mừng 046</p><p><br></p>','1747903182806_hoachucmung.jpg','Kệ Hoa Chúc Mừng 046',2000000.00,35,'66dd52cb-4154-4f95-9333-f36d6b31e660'),('99179144-a237-40ec-81a2-7c16e0d1be73','2025-05-22 16:00:36.565809',_binary '','2025-05-22 16:00:36.565809','<h1>Đất Hữu Cơ - Potting Soil Dalat Hasfarm 5dm3</h1><p>Đối với những ai đam mê việc tạo ra một mảnh vườn xanh nho nhỏ tại nhà, ngoài những chậu hoa xinh yêu của Dalat Hasfarm, bạn đừng quên sử dụng đất sạch hữu cơ (Potting Soil) của <a href=\"https://www.facebook.com/biopro.hasfarm?__cft__[0]=AZVyt2R2sgK1aFJIwJsdlrcfTFWzV2c48HwjyOTBjrUu6K2GvrWl58DQHdV_zVVOSZ1Q3VHETEMwEnr8AlRWeu-lAdqxtIF4JW-0xTYcGu2gml--n40QBaL9C2tDWGTMle4&amp;__tn__=-]K-R\" target=\"_blank\" style=\"color: rgb(51, 51, 51); background-color: transparent;\">Bio Pro by Dalat Hasfarm</a> để bảo đảm an toàn cũng như cung cấp đủ dưỡng chất cho cây hoa và cả rau xanh.</p><p>Đất sạch hữu cơ Bio Pro của Dalat Hasfarm được tái chế bằng 100% rác thải hữu cơ từ các trang trại, kết hợp hàng trăm loại vi sinh có lợi giúp hoa và cây trồng phát triển toàn diện.</p><p class=\"ql-align-justify\">Potting soil là hỗn hợp giá thể hữu cơ sử dụng để trồng cây, rau, hoa trong các chậu hoặc các thùng xốp, khay nhựa.</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/HBIO/HBIO17-S0001/Potting_Soil_5dm2_800x800.jpg\"></p><p class=\"ql-align-justify\"><strong>Thành phần:</strong></p><ul><li class=\"ql-align-justify\">- Chất hữu cơ giàu dinh dưỡng.</li><li class=\"ql-align-justify\">- Vi sinh vật có ích.</li><li class=\"ql-align-justify\">- Khoáng chất đa, trung, vi lượng.</li></ul><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\"><strong>Công dụng:</strong></p><ul><li class=\"ql-align-justify\">- Cung cấp mùn, nguồn hữu cơ, dinh dưỡng cho cây trồng.</li><li class=\"ql-align-justify\">- Hỗ trợ kiểm soát các loại nấm bệnh, tuyến trùng gây hại.</li><li class=\"ql-align-justify\">- Tăng cường sức đề kháng, giúp cây phát triển toàn diện.</li><li class=\"ql-align-justify\">- Tạo độ tơi xốp cho cây trồng dễ dàng hút các chất dinh dưỡng.</li><li class=\"ql-align-justify\">- Thích hợp trồng các loại rau, hoa trên ban công, sân thượng.</li></ul><p class=\"ql-align-justify\">&nbsp;</p><p class=\"ql-align-justify\"><strong>Cách sử dụng:</strong></p><ul><li class=\"ql-align-justify\">- Dùng hỗn hợp Potting Soil giàu dinh dưỡng để trồng cây rau, hoa trong chậu, hố, thùng xốp, bồn trồng cây trong vườn, với số lượng không hạn chế. Khi trồng cây chỉ cần nén nhẹ đất quanh gốc và tưới nước đủ ẩm.</li><li class=\"ql-align-justify\">- Thay thế đất cũ bạc màu trong những chậu đã trồng cây lâu năm với số lượng vừa đủ.</li><li class=\"ql-align-justify\">- Sử dụng với độ dày từ 3 - 5cm làm đất nền cho việc gieo cấy tất cả các loại rau sạch hoặc phục vụ cho việc gieo ươm cây con.</li><li class=\"ql-align-justify\">- Không cần bổ sung thêm phân bón, tưới nước với lượng vừa đủ</li></ul><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/HBIO/HBIO17-S0001/324410138_1128671794313426_1829295280988595065_n_800x800.jpg\"></p><p><br></p>','1747904436540_dathuuco.jpg','Đất Hữu Cơ - Potting Soil Dalat Hasfarm 5dm3',35000.00,30,'847f7510-1764-468d-8c66-e42d24bfc40b'),('9eae2d26-55ee-4efe-bebc-b8af0f15db81','2025-05-12 17:52:33.875638',_binary '','2025-05-22 15:37:31.064279','<h1>Bó Hoa Cưới 043</h1><p class=\"ql-align-justify\">Từng loại hoa mang những ý nghĩa đặc biệt riêng, Dalat Hasfarm gửi bạn yêu hoa nhiều lựa chọn&nbsp;<a href=\"https://shop.dalathasfarm.com/c/hoa-cuoi/\" target=\"_blank\" style=\"color: rgb(245, 136, 49); background-color: transparent;\">Hoa Cưới</a>&nbsp;tuyệt vời cùng những đóa hoa thơm xinh, rực rỡ để bạn dễ dàng chọn được bó hoa phù hợp nhất dành cho ngày đặc biệt. Những cánh hoa rạng rỡ tươi xinh và ẩn chứa nhiều ý nghĩa sẽ là lựa chọn hoàn hảo nhất để gửi trọn những thông điệp trong ngày hạnh phúc.</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/AWDA/AWDAB043/1730799624_6729e808f3817.jpg\"></p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/AWDA/AWDAB043/1730799627_6729e80b18d2d.jpg\"></p><p><br></p>','1747894425029_hoacuoi043.jpg','Bó Hoa Cưới 043',1750000.00,15,'23a443a9-8a1d-4dc7-bc52-09e3dffa73aa'),('a0649bb3-dd07-49c6-a2a4-51d54af06b6b','2025-05-20 02:05:30.169567',_binary '','2025-05-22 13:15:11.954961','<h1>Bó Hoa Cưới 049</h1><p class=\"ql-align-justify\">Từng loại hoa mang những ý nghĩa đặc biệt riêng, Dalat Hasfarm gửi bạn yêu hoa nhiều lựa chọn&nbsp;<a href=\"https://shop.dalathasfarm.com/c/hoa-cuoi/\" target=\"_blank\" style=\"color: rgb(245, 136, 49); background-color: transparent;\">Hoa Cưới</a>&nbsp;tuyệt vời cùng những đóa hoa thơm xinh, rực rỡ để bạn dễ dàng chọn được bó hoa phù hợp nhất dành cho ngày đặc biệt. Những cánh hoa rạng rỡ tươi xinh và ẩn chứa nhiều ý nghĩa sẽ là lựa chọn hoàn hảo nhất để gửi trọn những thông điệp trong ngày hạnh phúc.</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/AWDL/AWDLB049/1731040423_672d94a7307c5.jpg\"></p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/AWDL/AWDLB049/1731040425_672d94a93d47b.jpg\"></p><p><br></p>','1747894511916_hoacuoi049.jpg','Bó Hoa Cưới 049',1900000.00,12,'23a443a9-8a1d-4dc7-bc52-09e3dffa73aa'),('a66b5424-5d81-4c22-9b5b-cd3e34d4ed56','2025-05-22 15:53:58.102862',_binary '','2025-05-22 15:53:58.104890','<p class=\"ql-align-justify\"><strong>Hoa Baby (Gypsophila)</strong>&nbsp;có nguồn gốc Địa Trung Hải và Đông Âu, tên gọi Baby xuất phát từ tên “Baby’s breath” nghĩa là hơi thở trẻ thơ vì vẻ đẹp thuần khiết và mong manh. Hoa Baby thường được chọn cho bó hoa cưới và các loại hoa truyền thống khác, chẳng hạn như hoa cài áo, hoa cài áo và trang trí đám cưới. Ngoài ra, Hoa Baby cũng thích hợp làm điểm nhấn cho những loài hoa rực rỡ hơn như Hoa Hồng, Cúc Mẫu Đơn, Mẫu Đơn, Hướng Dương, Lily, Tulip...&nbsp;Hoa Baby phù hợp để chúc mừng những dịp đặc biệt như chào đón em bé mới chào đời, sinh nhật, các dịp kỷ niệm và ngày lễ tình nhân. Với hình dáng tinh tế, nhẹ nhàng tượng trưng cho sự chân thành, thuần khiết, tình yêu thương, ngây thơ... hoa Baby&nbsp;trở thành một lựa chọn hoàn hảo cho nhiều dịp khác nhau.</p><p class=\"ql-align-justify\"><strong>Bó Hoa Tinh Khôi 223</strong>&nbsp;sử dụng Baby được sắp xếp cẩn thận, gói giấy, thắt nơ tinh tế sẽ tăng thêm sự sang trọng và ý nghĩa của món quà.&nbsp;Mỗi bông hoa Baby như những tia sáng nhỏ, tạo nên một món quà đặc biệt và ý nghĩa, thể hiện sự quan tâm, tri ân đặc biệt dành cho người nhận. Bằng cách này, bó hoa không chỉ đơn giản là một món quà mà còn là một cách để thể hiện tình cảm và gắn kết giữa các trái tim, mang lại cảm giác ấm áp và hạnh phúc cho người nhận.&nbsp;Dù bó hoa đơn giản nhưng vẫn đặc biệt bởi Hoa Baby với cánh hoa mềm mại, tinh khôi, nhẹ nhàng nhưng vẫn toả sáng theo cách riêng, là sứ giả gắn kết những trái tim.</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/ADT1/ADT16LB223/AA0_2785wm_800x800.jpg\" alt=\"Bó Hoa Baby Tinh Khôi 223 nhiều màu sắc\"></p><p class=\"ql-align-center\">Bó Hoa Tinh Khôi 223</p><p class=\"ql-align-justify\"><strong>Vì sao nên tặng hoa tươi cho người mình thương?</strong></p><p class=\"ql-align-justify\">Một nghiên cứu của trường đại học Rutgers đã chỉ ra rằng những người nhận được món quà là hoa tươi sẽ có cảm xúc tích cực và vui vẻ trong nhiều ngày liền (Haviland-Jones, 2005). Điều đó đã chứng minh rằng hoa tươi là một trong những món quà tuyệt vời nhất để tạo dấu ấn và mang lại những giây phút hạnh phúc cho một ngày đặc biệt.&nbsp;</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/ADT1/ADT16LB223/AA0_2713_800x800.jpg\" alt=\"Hoa Baby nhuộm nhiều màu sắc - Dalat Hasfarm\"></p><p class=\"ql-align-center\">Bó Hoa Tinh Khôi 223</p><p class=\"ql-align-justify\"><strong>Lý do bạn nên chọn mua hoa tươi Dalat Hasfarm?</strong></p><p class=\"ql-align-justify\">Với quy trình sản xuất khép kín và hệ thống trang trại nhà kính công nghệ cao, sản phẩm hoa tươi từ Dalat Hasfarm luôn được trồng và chăm sóc hoa theo định hướng bền vững, cũng như luôn đảm bảo chất lượng cao từ khâu quản lý sản xuất, thu hoạch, bảo quản cho đến phân phối.&nbsp;Bên cạnh đó, hoa tươi còn được ứng dụng công nghệ trồng hoa sạch, áp dụng biện pháp thiên địch sinh học Bio-Pro trong quá trình ươm trồng và chăm sóc hoa, mang đến cho khách hàng những bông hoa không chỉ&nbsp;<strong>bền, đẹp</strong>&nbsp;mà còn&nbsp;<strong>sạch, tươi, mới</strong>&nbsp;và đặc biệt&nbsp;<strong>an toàn cho sức khỏe</strong>.</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/ADT1/ADT16LB223/AA0_2635_800x800.jpg\" alt=\"Đặt mua bó hoa Baby đẹp, nhiều màu sắc tại Dalat Hasfarm\"></p><p class=\"ql-align-center\">Bó Hoa Tinh Khôi 223</p><p><br></p>','1747904037974_hoãinh03.jpg','Bó Hoa Tinh Khôi 223',500000.00,17,'d0d87a73-27ea-4910-b1fd-69d9c45305ff'),('aa667536-a209-43f4-912b-301765c4d7d4','2025-05-22 15:51:29.660102',_binary '','2025-05-22 15:51:29.660102','<p class=\"ql-align-justify\"><strong>Bó Hoa Hạnh Phúc 232</strong>&nbsp;sử dụng Hoa Cẩm Chướng được sắp xếp cẩn thận, gói giấy và thắt nơ tinh tế cũng đủ để tạo nên một món quà xinh xắn giúp bạn bày tỏ tình cảm yêu thương.&nbsp;Hoa Cẩm Chướng (Carnation)&nbsp;được coi là hoa quốc hoa của nhiều quốc gia như Tây Ban Nha, Montenegro và Slovenia, thể hiện tình yêu mãnh liệt và sự kiên nhẫn trong cuộc sống. Hoa Cẩm Chướng thường được yêu thích và lựa chọn sử dụng trong các dịp đặc biệt như Ngày Của Mẹ, Valentine, sinh nhật, khai trương, tân gia, hay các sự kiện chúc mừng khác. Với nhiều ý nghĩa tốt đẹp, hoa Cẩm Chướng là lựa chọn vô cùng thích hợp để làm món quà đặc biệt, ý nghĩa gửi đến những người trân quý.&nbsp;</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/APT0/APT04LB232/AA0_2815wm_800x800.jpg\"></p><p class=\"ql-align-center\">Bó Hoa Hạnh Phúc 232 - Hoa Cẩm Chướng (Carnation) được giao màu hoa ngẫu nhiên</p><p class=\"ql-align-justify\"><strong>Vì sao nên tặng hoa tươi cho người mình thương?</strong></p><p class=\"ql-align-justify\">Một nghiên cứu của trường đại học Rutgers đã chỉ ra rằng những người nhận được món quà là hoa tươi sẽ có cảm xúc tích cực và vui vẻ trong nhiều ngày liền (Haviland-Jones, 2005). Điều đó đã chứng minh rằng hoa tươi là một trong những món quà tuyệt vời nhất để tạo dấu ấn và mang lại những giây phút hạnh phúc cho một ngày đặc biệt.</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/APT0/APT04LB232/AA0_2718wm_800x800.jpg\"></p><p class=\"ql-align-center\">Hoa Cẩm Chướng (Carnation) được giao màu hoa ngẫu nhiên</p><p class=\"ql-align-justify\"><strong>Lý do bạn nên chọn mua hoa tươi Dalat Hasfarm?</strong></p><p class=\"ql-align-justify\">Với quy trình sản xuất khép kín và hệ thống trang trại nhà kính công nghệ cao, sản phẩm hoa tươi từ Dalat Hasfarm luôn được trồng và chăm sóc hoa theo định hướng bền vững, cũng như luôn đảm bảo chất lượng cao từ khâu quản lý sản xuất, thu hoạch, bảo quản cho đến phân phối.&nbsp;Bên cạnh đó, hoa tươi còn được ứng dụng công nghệ trồng hoa sạch, áp dụng biện pháp thiên địch sinh học Bio-Pro trong quá trình ươm trồng và chăm sóc hoa, mang đến cho khách hàng những bông hoa không chỉ&nbsp;<strong>bền, đẹp</strong>&nbsp;mà còn&nbsp;<strong>sạch, tươi, mới</strong>&nbsp;và đặc biệt&nbsp;<strong>an toàn cho sức khỏe</strong>.</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/APT0/APT04LB232/1719480164_667d2f64d6593.jpg\"></p><p class=\"ql-align-center\">Hoa Cẩm Chướng (Carnation) được giao màu hoa ngẫu nhiên</p><p><br></p>','1747903889603_hoaxinh02.jpg','Bó Hoa Hạnh Phúc 232',250000.00,35,'d0d87a73-27ea-4910-b1fd-69d9c45305ff'),('d6183a1b-4287-465b-9685-cb57ab33f0bc','2025-05-22 15:58:00.045688',_binary '','2025-05-22 15:58:00.045688','<h1>Chất dưỡng hoa Chrysal Clear Universal Sachets (10 gói/hộp)</h1><p class=\"ql-align-justify\"><strong>Chrysal Clear Universal</strong>&nbsp;là chất dưỡng hoa được Dalat Hasfarm nhập khẩu trực tiếp từ Hà Lan chứa các hoạt chất đặc biệt có tác dụng cung cấp dinh dưỡng cho hoa cắt cành, giúp hoa tươi lâu và màu sắc lên chuẩn hơn so với khi sử dụng nước thường. Chất dưỡng hoa Chrysal Clear Universal hòa tan dễ dàng trong nước, an toàn, không mùi, kích thích hấp thụ nước và cung cấp đủ dinh dưỡng cần thiết cho hoa, giảm độ PH trong nước cắm, không gây mùi khó chịu. Chất dưỡng hoa thích hợp với hầu hết các loại hoa cắt cành, vì thế với những người yêu thích trang trí, cắm hoa tươi thì đây chính là sản phẩm không thể thiếu trong nhà mình.</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/T870/T8700901-0000H/1712228063_660e86dfdea4b.jpg\"></p><p class=\"ql-align-justify\"><strong>Hướng dẫn sử dụng Chrysal Clear Universal:</strong></p><p class=\"ql-align-justify\">- Bước 1: Hòa tan 1 gói 5g chất dưỡng hoa Chrysal Clear vào 500ml nước sạch.</p><p class=\"ql-align-justify\">- Bước 2: Cắt tỉa cành hoa. Loại bỏ lá chân và cắt gốc cành hoa chéo 45 độ.</p><p class=\"ql-align-justify\">- Bước 3: Cắm hoa vào dung dịch nước đã pha Chrysal Clear.</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/T870/T8700901-0000H/1712228062_660e86ded5cf7.jpg\"></p><p class=\"ql-align-justify\"><strong>Công dụng:</strong></p><p class=\"ql-align-justify\">- Kéo dài độ bền của hoa lên đến 60% so với chỉ sử dụng nước thông thường.</p><p class=\"ql-align-justify\">- Giảm độ pH, tăng cường sự hấp thụ nước dưỡng chất.</p><p class=\"ql-align-justify\">- Tăng cường sự phát triển của nụ và hoa, giữ cho thân lá cứng và xanh.</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/T870/T8700901-0000H/1712228153_660e87399b571.jpg\"></p><p class=\"ql-align-justify\"><strong>Lưu ý:</strong></p><p class=\"ql-align-justify\">- Dùng 1 gói cho 500ml nước để có được kết quả tối ưu.</p><p class=\"ql-align-justify\">- Không pha trong bình kim loại thô chưa được tráng lớp bảo vệ , ví dụ: bình đồng, kẽm, sắt... hoặc bình pha lê (cổ)...</p><p class=\"ql-align-justify\">- Bảo quản nơi khô mát, tránh xa tầm tay trẻ em.</p><p><br></p>','1747904279931_Chất_dưỡng_hoa_Chrysal_Clear_Universal_Sachets_(10_góihộp).jpg','Chất dưỡng hoa Chrysal Clear Universal Sachets (10 gói/hộp)',30000.00,100,'847f7510-1764-468d-8c66-e42d24bfc40b'),('ee371b6b-5bb5-4613-905b-1a817ca79188','2025-05-22 15:55:37.298076',_binary '','2025-05-22 15:55:37.298076','<p class=\"ql-align-justify\"><strong>Bó Hoa Sứ Giả May Mắn 616</strong>&nbsp;sử dụng Hoa Thủy Tiên (Alstroemeria) được lựa chọn và sắp xếp cẩn thận kết hợp cùng chất liệu giấy kraft phối lưới tinh tế sẽ tăng thêm sự sang trọng và ý nghĩa của món quà. Đây không chỉ là một món quà đơn giản mà còn là một thông điệp chân thành từ trái tim bạn đến với người nhận, thể hiện lòng quan tâm và sự tri ân đối với họ.&nbsp;<strong>Hoa Thủy Tiên (Alstroemeria)</strong>&nbsp;hay còn gọi là hoa Lily Peru có nguồn gốc từ Nam Mỹ, trồng nguyên bản ở Peru nhưng nó cũng được tìm thấy ở vùng núi Chile và Brazil. Kể từ khi được phát hiện vào thế kỉ 18, hoa Alstroemeria đã trở thành một trong những loài hoa phổ biến ở Châu Âu và trên thế giới. Hoa Thủy Tiên (Alstroemeria) có rất nhiều màu sắc: hồng, đỏ, cam, trắng, vàng… và có độ bền khoảng 1 tuần trong điều kiện lý tưởng, thích hợp với nhiều không gian khác nhau vì vậy hoa ngày càng được yêu thích. Thủy Tiên (Alstroemeria) tượng trưng cho tình yêu lãng mạn, tình bạn gắn kết, may mắn, lời chúc sức khỏe, trường thọ, sự phát triển, sức mạnh và sự tận tâm… Mặc dù theo truyền thống, Thủy Tiên (Alstroemeria) được xem là biểu tượng của tình bạn nhưng gần đây hoa đã trở thành loài hoa lãng mạn và được sử dụng nhiều trong bó hoa cưới. Ý nghĩa đằng sau của hoa Thủy Tiên (Alstroemeria) bắt nguồn từ sáu cánh hoa xinh đẹp. Mỗi cánh hoa đại diện cho một đặc điểm khác nhau: hiểu biết, hài hước, kiên nhẫn, đồng cảm, cam kết và tôn trọng. Những chiếc lá xoắn của chúng còn là biểu tượng của sự gắn kết, ổn định và cùng nhau vượt qua khó khăn. Với nhiều ý nghĩa tốt đẹp, hoa Thủy Tiên (Alstroemeria) là lựa chọn cực kỳ thích hợp để làm quà tặng trong mọi dịp.&nbsp;Từng bông hoa được Dalat Hasfarm cẩn thận lựa chọn, tỉ mỉ sắp xếp để tất cả hòa quyện thành một tác phẩm nghệ thuật từ thiên nhiên xinh đẹp, tinh tế tạo nên một món quà tuyệt vời gửi trao cảm xúc chân thành nhất đến người nhận.</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/AFFM/AFFMIXD616/1727147709_66f22ebded2c7.jpg\" alt=\"Bó Hoa Sứ Giả May Mắn 616 Hoa Thủy Tiên Alstroemeria Lily Peru Dalat Hasfarm\"></p><p class=\"ql-align-center\">Bó Hoa Sứ Giả May Mắn 616 - Hoa Thủy Tiên (Alstroemeria/ Lily Peru)</p><p class=\"ql-align-justify\"><strong>Bó Hoa Sứ Giả May Mắn 616</strong>&nbsp;không chỉ là món quà tặng đơn thuần mà có thể để trang trí không gian sống và làm việc, mang đến sự tươi mới, đầy sức sống và niềm vui mỗi khi ngắm nhìn bởi bạn hoàn toàn yên tâm về chất lượng sạch và an toàn của từng cành hoa từ Dalat Hasfarm. Bạn nên đặt hoa ở nhiệt độ mát, tránh để hoa tiếp xúc với nguồn nhiệt cao (ánh nắng mặt trời chiếu trực tiếp hoặc gần các thiết bị phát nhiệt), quạt gió trực tiếp và cạnh hoa quả chín (khí ethylene từ hoa quả có thể ảnh hưởng đến độ bền của hoa) đồng thời nên bổ sung nước để giữ cho hoa tươi lâu hơn.</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/AFFM/AFFMIXD616/1727147715_66f22ec34927f.jpg\" alt=\"Bó Hoa Sứ Giả May Mắn 616 Hoa Thủy Tiên Alstroemeria Lily Peru Dalat Hasfarm\"></p><p class=\"ql-align-center\">Bó Hoa Sứ Giả May Mắn 616 - Hoa Thủy Tiên (Alstroemeria/ Lily Peru)</p><p><strong>Vì sao nên tặng hoa tươi cho người mình thương?</strong></p><p>Một nghiên cứu của trường đại học Rutgers đã chỉ ra rằng những người nhận được món quà là hoa tươi sẽ có cảm xúc tích cực và vui vẻ trong nhiều ngày liền (Haviland-Jones, 2005). Điều đó đã chứng minh rằng hoa tươi là một trong những món quà tuyệt vời nhất để tạo dấu ấn và mang lại những giây phút hạnh phúc cho một ngày đặc biệt.</p><p class=\"ql-align-center\"><img src=\"https://storage.googleapis.com/cdn_dlhf_vn/public/products/AFFM/AFFMIXD616/1727147712_66f22ec078908.jpg\" alt=\"Bó Hoa Sứ Giả May Mắn 616 Hoa Thủy Tiên Alstroemeria Lily Peru Dalat Hasfarm\"></p><p class=\"ql-align-center\">Bó Hoa Sứ Giả May Mắn 616 - Hoa Thủy Tiên (Alstroemeria/ Lily Peru)</p><p><br></p>','1747904137252_hoaxainh04.jpg','Bó Hoa Sứ Giả May Mắn 616',480000.00,27,'d0d87a73-27ea-4910-b1fd-69d9c45305ff');
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_details`
--

DROP TABLE IF EXISTS `product_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_details` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `attribute_key` varchar(100) NOT NULL,
  `attribute_value` varchar(255) NOT NULL,
  `category_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK183nwj6l8h97lb4gwulfp58u1` (`category_id`),
  KEY `FKrhahp4f26x99lqf0kybcs79rb` (`product_id`),
  CONSTRAINT `FK183nwj6l8h97lb4gwulfp58u1` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`),
  CONSTRAINT `FKrhahp4f26x99lqf0kybcs79rb` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_details`
--

LOCK TABLES `product_details` WRITE;
/*!40000 ALTER TABLE `product_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `review`
--

DROP TABLE IF EXISTS `review`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `comment` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `rating` int(11) DEFAULT NULL,
  `product_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKiyof1sindb9qiqr9o8npj8klt` (`product_id`),
  KEY `FK6cpw2nlklblpvc7hyt7ko6v3e` (`user_id`),
  CONSTRAINT `FK6cpw2nlklblpvc7hyt7ko6v3e` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKiyof1sindb9qiqr9o8npj8klt` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review`
--

LOCK TABLES `review` WRITE;
/*!40000 ALTER TABLE `review` DISABLE KEYS */;
/*!40000 ALTER TABLE `review` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service`
--

DROP TABLE IF EXISTS `service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `active` bit(1) DEFAULT NULL,
  `availability` varchar(255) DEFAULT NULL,
  `base_price` decimal(38,2) NOT NULL,
  `benefits` text,
  `category` enum('BOARDING','GROOMING','HEALTHCARE','PACKAGE') DEFAULT NULL,
  `description` text,
  `duration` int(11) DEFAULT NULL,
  `icon_class` varchar(255) DEFAULT NULL,
  `images` text,
  `is_featured` bit(1) DEFAULT NULL,
  `is_popular` bit(1) DEFAULT NULL,
  `large_pet_price` decimal(38,2) NOT NULL,
  `max_pets_per_slot` int(11) DEFAULT NULL,
  `medium_pet_price` decimal(38,2) NOT NULL,
  `name` varchar(255) NOT NULL,
  `notes` text,
  `service_procedure` text,
  `requires_vaccination` bit(1) DEFAULT NULL,
  `small_pet_price` decimal(38,2) NOT NULL,
  `xlarge_pet_price` decimal(38,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service`
--

LOCK TABLES `service` WRITE;
/*!40000 ALTER TABLE `service` DISABLE KEYS */;
INSERT INTO `service` VALUES ('6d22af1f-859f-4ca3-b15b-b4773dc15512','2025-04-30 21:49:31.001966',_binary '','2025-05-11 00:18:43.168096',_binary '','MON,TUE,WED,THU,FRI,SAT',35.00,'Improves coat health, reduces shedding, prevents skin issues, and provides comfort','GROOMING','<p>Complete grooming service for dogs including bath, brush, nail trim, and ear cleaning</p>',60,'fas fa-shower','grooming1.jpg,grooming2.jpg',_binary '',_binary '',55.00,1,45.00,'Basic Dog Grooming','Please notify us of any skin conditions or allergies before booking','1. Check pet health\n2. Brush to remove tangles\n3. Bathe with appropriate shampoo\n4. Blow dry\n5. Trim nails\n6. Clean ears',_binary '',35.00,65.00),('902a88d6-5876-4dee-aa98-7dd9af43e824','2025-05-11 10:37:33.170272',_binary '','2025-05-11 10:37:33.171288',_binary '',NULL,20000.00,NULL,'GROOMING','<p>tắm cho chít chít</p>',40000,NULL,NULL,_binary '\0',_binary '\0',18.00,1,1617.00,'Tắm và massage',NULL,NULL,NULL,15.00,19.00),('9a7ab7a1-63b7-4c1a-90f7-8463ee016629','2025-05-20 02:13:32.678256',_binary '','2025-05-20 02:13:32.679287',_binary '',NULL,150000.00,NULL,'GROOMING','<h4>Mô tả dịch vụ</h4><p>Dịch vụ tắm và vệ sinh toàn diện tại JanyPet giúp thú cưng của bạn luôn sạch sẽ, thơm tho và khỏe mạnh. Chúng tôi sử dụng các sản phẩm chất lượng cao, an toàn cho da và lông của thú cưng.</p><h4>Quy trình thực hiện</h4><ol><li>Kiểm tra sơ bộ tình trạng da lông</li><li>Gỡ rối (nếu cần)</li><li>Tắm với sữa tắm phù hợp loại lông</li><li>Xả sạch và tắm lần 2 nếu cần</li><li>Làm khô lông</li><li>Vệ sinh tai, mắt</li><li>Cắt móng, vệ sinh bàn chân (theo yêu cầu)</li><li>Xịt thơm, dưỡng lông</li></ol><p><br></p>',60,NULL,NULL,_binary '\0',_binary '\0',248000.00,1,200000.00,'Dịch Vụ Tắm và Vệ Sinh',NULL,NULL,NULL,150000.00,269000.00);
/*!40000 ALTER TABLE `service` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_included_items`
--

DROP TABLE IF EXISTS `service_included_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_included_items` (
  `service_id` varchar(36) NOT NULL,
  `item` varchar(255) DEFAULT NULL,
  KEY `FKqcx01mjgtfgy7x40w53gg1qlo` (`service_id`),
  CONSTRAINT `FKqcx01mjgtfgy7x40w53gg1qlo` FOREIGN KEY (`service_id`) REFERENCES `service` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_included_items`
--

LOCK TABLES `service_included_items` WRITE;
/*!40000 ALTER TABLE `service_included_items` DISABLE KEYS */;
INSERT INTO `service_included_items` VALUES ('6d22af1f-859f-4ca3-b15b-b4773dc15512','Premium shampoo and conditioner'),('6d22af1f-859f-4ca3-b15b-b4773dc15512','Nail trimming'),('6d22af1f-859f-4ca3-b15b-b4773dc15512','Ear cleaning'),('6d22af1f-859f-4ca3-b15b-b4773dc15512','Brush out');
/*!40000 ALTER TABLE `service_included_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_item`
--

DROP TABLE IF EXISTS `service_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_item` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `duration` int(11) DEFAULT NULL,
  `large_pet_price` decimal(38,2) DEFAULT NULL,
  `medium_pet_price` decimal(38,2) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `small_pet_price` decimal(38,2) DEFAULT NULL,
  `xlarge_pet_price` decimal(38,2) DEFAULT NULL,
  `service_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK82rintgbc4qe75p45eerua9ix` (`service_id`),
  CONSTRAINT `FK82rintgbc4qe75p45eerua9ix` FOREIGN KEY (`service_id`) REFERENCES `service` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_item`
--

LOCK TABLES `service_item` WRITE;
/*!40000 ALTER TABLE `service_item` DISABLE KEYS */;
/*!40000 ALTER TABLE `service_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shopping_carts`
--

DROP TABLE IF EXISTS `shopping_carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shopping_carts` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `total` decimal(38,2) DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKt5ao4h91q3su6hi9d2haxdr2t` (`user_id`),
  CONSTRAINT `FK3iw2988ea60alsp0gnvvyt744` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shopping_carts`
--

LOCK TABLES `shopping_carts` WRITE;
/*!40000 ALTER TABLE `shopping_carts` DISABLE KEYS */;
INSERT INTO `shopping_carts` VALUES ('5e0f2996-38ce-4f3b-a67c-5eb4a7feef3d','2025-04-29 09:45:58.682046',_binary '','2025-04-29 09:45:58.774559',11125.00,'0307d342-1c03-4c50-9523-fe70fe94f092');
/*!40000 ALTER TABLE `shopping_carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `is_active` bit(1) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `active` bit(1) DEFAULT NULL,
  `address` text,
  `email` varchar(150) DEFAULT NULL,
  `gender` enum('FEMALE','MALE','OTHER') DEFAULT NULL,
  `is_deleted` bit(1) NOT NULL,
  `is_locked` bit(1) NOT NULL,
  `is_verified` bit(1) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone_number` varchar(15) NOT NULL,
  `refresh_token` varchar(255) DEFAULT NULL,
  `role` enum('ADMIN','CUSTOMER','EMPLOYEE') NOT NULL,
  `token_expiry` bigint(20) DEFAULT NULL,
  `username` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK9q63snka3mdh91as4io72espi` (`phone_number`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('0307d342-1c03-4c50-9523-fe70fe94f092','2025-04-21 03:02:08.776548',_binary '','2025-04-21 03:02:08.777548',NULL,'Hanoi','admin@example.com','MALE',_binary '\0',_binary '\0',_binary '\0','$2a$10$kI1zjeEE8vM5szkmKctxZO8NtiasMwHZ1hGjSrFqHzfzI3LSSYobS','0398467232',NULL,'ADMIN',NULL,'admin'),('0f0f54f9-cc78-41b6-a3c7-3366c6a98fc7','2025-04-27 21:59:21.358714',_binary '','2025-04-27 21:59:21.360711',NULL,'Hanoi','newadmin2811@example.com','MALE',_binary '\0',_binary '\0',_binary '\0','$2a$10$ypLCaR/R3JUsZ3e.EViEBOi56elpkiBVKmdHv4bFIEaeMKrPC/Qzu','0123456888',NULL,'CUSTOMER',NULL,'newadmin'),('13667fa0-a2a8-4ad8-9497-5b65eb7beab2','2025-04-21 11:39:24.255522',_binary '','2025-04-21 18:46:33.245273',NULL,NULL,'dochuong2811204@gmail.com',NULL,_binary '\0',_binary '\0',_binary '','$2a$10$rry4OR3wHm86ZjwooyIk0O1vbEGm4.bFWHcdZl0P9rB1k0sqXmUFO','0398467239','eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMzY2N2ZhMC1hMmE4LTRhZDgtOTQ5Ny01YjY1ZWI3YmVhYjIiLCJpYXQiOjE3NDUyMzU5OTMsImV4cCI6MTc0NTg0MDc5M30.yYA8DsfCVCN_9dAlC4s1lDVb3QO8bp_e6zLTr1wRWJLS1gVrzKL6c7pny5HKBzYpBeFdB616B4eeRG6VH_Sr0Q','CUSTOMER',1745322393000,'chuong'),('2418ec44-5b6a-4f38-943b-377437ff7570','2025-04-20 03:21:22.611775',_binary '','2025-04-29 14:10:42.402852',NULL,NULL,'dochuong281104@gmail.com',NULL,_binary '\0',_binary '\0',_binary '','$2a$10$Ma1kMQr2y93VOCU0PZ5qau5K9akmqrBBop2ZnSidcBo8X64mSd53e','0398467231','eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIyNDE4ZWM0NC01YjZhLTRmMzgtOTQzYi0zNzc0MzdmZjc1NzAiLCJpYXQiOjE3NDU5MTA2NDIsImV4cCI6MTc0NjUxNTQ0Mn0.0ZqanfYx3u07TKG69tUL-HPRi40CpYv6xTbMn3eFqadRSyPReqalVh4-brRbEc4sPlGyjUyJQbYH4kHnmgd6Iw','CUSTOMER',1745997042000,'đochichuong'),('24dbead0-5e09-4df5-b1c7-f3acd7d673fb','2025-04-22 01:09:55.391976',_binary '','2025-05-23 06:53:15.707325',NULL,NULL,'newadmin2@example.com',NULL,_binary '\0',_binary '\0',_binary '','$2a$10$RmbQiWRnR8gbllqwSyqfkO8HpY..QP1vaOR0nbVRsn3eedqMryzri','0123456788','eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIyNGRiZWFkMC01ZTA5LTRkZjUtYjFjNy1mM2FjZDdkNjczZmIiLCJpYXQiOjE3NDc5NTc5OTUsImV4cCI6MTc0ODU2Mjc5NX0.xq8xOdsQxFgwKaol8waWYQ9_GCwlaSTQOQVhxX45n-ZMblRaCHCEgry5Er7Njqx2YGQoLK_8CWTCLUDqLtYB9A','ADMIN',1748044395000,'newadmin'),('2683f009-e366-48cf-9107-99cfa2e7cf35','2025-04-21 03:29:16.573498',_binary '','2025-04-21 03:29:16.574491',NULL,'Hanoi','admin2811@gmail.com','MALE',_binary '\0',_binary '\0',_binary '\0','$2a$10$LBp.a6C/dvkwu76SuO1oeeRqiScpm5STHSnLUHyA0fctS9chqFaDS','0398467233',NULL,'ADMIN',NULL,'admin'),('2818a69a-9722-4926-ad95-708d9bb138a1','2025-04-22 09:41:41.870169',_binary '','2025-04-22 09:41:41.870169',NULL,'HaNOi','Admemailn123!','FEMALE',_binary '\0',_binary '\0',_binary '\0','$2a$10$riGZiWjNyvm.ZOr9JlFOROLdUk30wnb4036UWbdndAK7lLwbxWoce','123456',NULL,'ADMIN',NULL,'admin_test@example.com'),('2d2a78cd-9f92-4801-b51c-66ff84d981d3','2025-04-21 18:49:06.703496',_binary '','2025-05-18 23:25:11.096651',NULL,NULL,'m@gmail.com',NULL,_binary '\0',_binary '\0',_binary '','$2a$10$y32N6Za4alFvke8z9U4wKe.V35KATD7fskRHwWvEYUArCyKrmgY7q','0862741601','eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIyZDJhNzhjZC05ZjkyLTQ4MDEtYjUxYy02NmZmODRkOTgxZDMiLCJpYXQiOjE3NDc1ODU1MTEsImV4cCI6MTc0ODE5MDMxMX0.ryQHsYIlXm2TxRTjZRdEBJLmErGWvG6qQ5ffaFBXAU2DtcUDfvDnn5xv8_kQHSjCCTACChvXYauRABKyY_FyHw','CUSTOMER',1747671911000,'do chi chuong'),('3540fc88-b086-4310-9d87-4b21740bf7bb','2025-04-21 03:44:44.822785',_binary '','2025-04-21 03:44:44.822785',NULL,'Hanoi','admin28112005@gmail.com','MALE',_binary '\0',_binary '\0',_binary '\0','$2a$10$Ptst.zYr1HkcSlgW.KP7h.hFbRPZzG/dFcUJPxaFHZzXuzlA968xm','0398467235',NULL,'ADMIN',NULL,'admin'),('3b389b5d-16bb-40da-b3b3-a1b1cb047f38','2025-05-11 13:26:33.043513',_binary '','2025-05-11 13:26:33.045512',NULL,'Hanoi','newadmin2811204@example.com','MALE',_binary '\0',_binary '\0',_binary '\0','$2a$10$T8gx2UmrOz0MnJMYfGywQuo9uzFkDxOSHvoe8JPMEAw2hVVDTwA8e','0123458889',NULL,'CUSTOMER',NULL,'newadmin'),('3d7ca7d5-d24a-4b38-8766-47ec116729a9','2025-04-21 09:44:59.997763',_binary '','2025-04-21 09:44:59.998351',NULL,'Hanoi','admin2811205@gmail.com','MALE',_binary '\0',_binary '\0',_binary '\0','$2a$10$kR/5ZW5aybx5bruxXGb4Nu6aO1bVe1y9NGNawshpSZzDVcTKMUtL.','0398467236',NULL,'ADMIN',NULL,'admin'),('44c7ad27-cfba-493e-8068-9c93d91bfdd3','2025-04-22 00:20:26.103678',_binary '','2025-04-22 01:07:11.337377',NULL,NULL,'admin_test@example.com',NULL,_binary '\0',_binary '\0',_binary '','$2a$10$mAMnP7zkzwVjOjDQAOJSreobvmwCoROgC7aouKZoqlBLqhERElt/W','0987654321','eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI0NGM3YWQyNy1jZmJhLTQ5M2UtODA2OC05YzkzZDkxYmZkZDMiLCJpYXQiOjE3NDUyNTg4MzEsImV4cCI6MTc0NTg2MzYzMX0.gjShhOr5N2zVNTZpPlEjojbnvZ2CWNrRRWtUdV0J0-Uf3-1uUsBAfmZmkFNn_ROTS-tZC6Sr_V1PwqxrL5vxUQ','CUSTOMER',1745345231000,'admin_test'),('48697de1-d081-4684-817e-d436f7ea3647','2025-04-27 22:38:47.315656',_binary '','2025-04-27 22:38:47.316656',NULL,'Hanoi','newadmin281104@example.com','MALE',_binary '\0',_binary '\0',_binary '\0','$2a$10$zfRAurW0XaK8jnK3/UTJQOYfCDD4GspnUw0PuWz8wWFtvFhu5695e','0123458888',NULL,'CUSTOMER',NULL,'newadmin'),('61f89d0a-b5aa-4c3e-8c61-33f8d7483cb7','2025-04-23 11:33:17.384486',_binary '','2025-05-13 21:46:34.184355',NULL,NULL,'admin@gmail.com',NULL,_binary '\0',_binary '\0',_binary '','$2a$10$i60j1erx/X8yEzKb6p/0fO4wBoiP6c4aWlNKcoCq7DpaHUFoBDIWS','0321654987','eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI2MWY4OWQwYS1iNWFhLTRjM2UtOGM2MS0zM2Y4ZDc0ODNjYjciLCJpYXQiOjE3NDcxNDc1OTQsImV4cCI6MTc0Nzc1MjM5NH0.IWACDbzG7KpDRAxj_aekG34Cz-bme3M7Qm0zQnYjZH9O90zbqb13IR0KiLcsQDxeTLo0IQ6HQDI362R9q3-M4g','ADMIN',1747233994000,'newadmin'),('6b284650-93d3-4f68-849e-058b4cbe22ca','2025-04-21 17:59:45.986938',_binary '','2025-04-21 17:59:45.992704',NULL,NULL,'JannyTr88@example.com',NULL,_binary '\0',_binary '\0',_binary '','$2a$10$7oAT8y7DCAPssQpK3Nmz..ZSyWbqk8oXOnUo7MVE7yCt9w/O2N.kW','0246135709',NULL,'CUSTOMER',NULL,'JannyTr'),('6d9c7586-52fb-436e-ad07-2661a200a378','2025-04-21 10:01:27.961218',_binary '','2025-04-21 10:01:27.961218',NULL,'BacNinh','chuongdo2811@example.com','FEMALE',_binary '\0',_binary '\0',_binary '\0','$2a$10$2LvnUdzwUoPZnOUS24MXT.uJ47OJYzmri3FiaOq9TF3BGFQKGrFPe','0398467238',NULL,'ADMIN',NULL,'admin'),('75da7205-dfe4-45e1-8abd-816f89b1cef4','2025-04-21 10:21:34.259005',_binary '','2025-04-21 10:21:34.259005',NULL,NULL,'admin281@gmail.com',NULL,_binary '\0',_binary '\0',_binary '','$2a$10$zt4fruwUZlqdqFJfUXFMweYzKGcxF.1UaQOSn5RS/AUSp1PPT2yPu','0398467237',NULL,'CUSTOMER',NULL,'admin'),('795c03a4-03ba-4dc0-8c41-92792010e44e','2025-04-21 03:43:34.863632',_binary '','2025-04-21 03:43:34.864633',NULL,'Hanoi','admin28112004@gmail.com','MALE',_binary '\0',_binary '\0',_binary '\0','$2a$10$ut9ZDG.g03F2Z7cCUidFE.dBDoLnkEsHi6ABtn8vFj0nDEmV.yNH6','0398467234',NULL,'ADMIN',NULL,'admin'),('804e84f2-eb54-45bf-8d48-b8ca7a1eccaa','2025-05-18 23:22:52.744600',_binary '','2025-05-23 06:43:03.401157',NULL,NULL,'dochichuong281105@gmail.com',NULL,_binary '\0',_binary '\0',_binary '','$2a$10$by6eROzODLXqLuIQbAETJetLHo9QxYF.WUF1w9aFPpBsLLzY3qtVG','0862741600','eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI4MDRlODRmMi1lYjU0LTQ1YmYtOGQ0OC1iOGNhN2ExZWNjYWEiLCJpYXQiOjE3NDc5NTczODMsImV4cCI6MTc0ODU2MjE4M30.TiPKQH4U6jm1bn6czg8bN9cKIqkixTmMcQmhVrJCJ0tniBhsk65VhrwV9MHo5iAzWUpKfwwv5TOT9q7uVVQp3g','CUSTOMER',1748043783000,'Em Chítttt'),('809ec103-ec55-4abf-9376-6e2a947e1c44','2025-04-21 23:49:19.666068',_binary '','2025-04-21 23:49:19.666068',NULL,NULL,'jannyTr@gmail.com',NULL,_binary '\0',_binary '\0',_binary '','$2a$10$BgLahpzP5c40KuYXDhaoWuh4khgEp4VrW2Hy73JeVoEmAbn7wEh2y','mmmmmmmm',NULL,'ADMIN',NULL,'Trnga'),('8a86bfb2-1e9d-11f0-8fdf-0242ac110002','2025-04-22 11:59:06.888689',_binary '','2025-05-18 23:18:41.531940',_binary '','BacNinh','jannyTr040104@gmail.com','FEMALE',_binary '\0',_binary '\0',_binary '','$2a$10$rsz7cqJ69onx0CvD.GVoIuUvXhboahGPj2109fs6TZx1tzPlTKCG2','0398457242','eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI4YTg2YmZiMi0xZTlkLTExZjAtOGZkZi0wMjQyYWMxMTAwMDIiLCJpYXQiOjE3NDc1ODUxMjEsImV4cCI6MTc0ODE4OTkyMX0.iRAHIr_DjzkXpOc-5esPt5QAhvtvvX6hNfLpxodDwRB-BBnhvOLaASMPUc5Ao5ggeL_BusUks881EfmgckfQFA','ADMIN',1747671521000,'admin2811'),('8bd3028c-0232-41d1-9706-a9dd0f7e924d','2025-04-22 09:01:58.389283',_binary '','2025-04-22 09:02:36.295347',NULL,NULL,'admin@admin.com',NULL,_binary '\0',_binary '\0',_binary '','$2a$10$wBvMjDDTjD7hUe1I5HMYUuCkzw5dS.WybO.fHjPEi9e6F1qutLdhy','0123654789','eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI4YmQzMDI4Yy0wMjMyLTQxZDEtOTcwNi1hOWRkMGY3ZTkyNGQiLCJpYXQiOjE3NDUyODczNTYsImV4cCI6MTc0NTg5MjE1Nn0.KfsQXzKDZBXCDVA7fLk0Ofm3lD7loMkV_2hMl3dQFLiyCY24uqEGI5J4QVoVpRCQh6N7JX8tE_IsiTwC3mqjJw','ADMIN',1745373756000,'admin'),('a8c49ff7-a1b0-40ea-a71e-a31392174a9f','2025-04-19 11:59:06.888689',_binary '','2025-04-19 12:00:59.749788',NULL,NULL,'dochuong2811@gmail.com',NULL,_binary '\0',_binary '\0',_binary '','$2a$10$/6IfqHeUEj5t/AtUNLWYs.TXI7fUpDEOSHwrzv36q3gj1J4STJap2','0398467230','eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhOGM0OWZmNy1hMWIwLTQwZWEtYTcxZS1hMzEzOTIxNzRhOWYiLCJpYXQiOjE3NDUwMzg4NTksImV4cCI6MTc0NTY0MzY1OX0.YUw1UMJLVx1laaFxdrNOVRGYRzmmYIOaetvCOuNg4yStOIj9QbNWpMZnJluS3PmS7YqJZ5WY-ICI3rr2CY1siw','CUSTOMER',1745643659732,'đochichuong'),('b8c49ff7-a1b0-40ea-a71e-a31392174a9h','2025-04-21 11:59:06.888689',_binary '','2025-04-21 12:00:06.888690',_binary '','BacNinh','jannyTr0401@gmail.com','FEMALE',_binary '\0',_binary '\0',_binary '','admin12345','0398457241',NULL,'ADMIN',NULL,'admin2811'),('d00bae30-ef4e-4685-af53-c637145d45a6','2025-05-11 23:57:17.886717',_binary '','2025-05-11 23:57:17.886717',NULL,'Hanoi','newadmin281124@example.com','MALE',_binary '\0',_binary '\0',_binary '\0','$2a$10$90ZSb1FmRybcb8r4xLvbGeHIBJ7lhMnvPVL1vH9asCsCr8vByH8Yy','0123458899',NULL,'CUSTOMER',NULL,'newadmin'),('d01cb57d-1b39-4022-849c-9da34f36c6b7','2025-04-21 22:52:44.103172',_binary '','2025-04-21 22:52:44.105174',NULL,'Hanoi','newadmin@example.com','MALE',_binary '\0',_binary '\0',_binary '\0','$2a$10$vaS33OVNwuhuH5JjZYrzAu530zUr.g.CogfOk8fLxGX3kA5oHJHvW','0123456789',NULL,'ADMIN',NULL,'newadmin');
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

-- Dump completed on 2025-05-23  7:53:38
