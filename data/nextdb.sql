-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3307
-- Généré le : ven. 31 jan. 2025 à 12:30
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `nextdb`
--

-- --------------------------------------------------------

--
-- Structure de la table `category`
--

CREATE TABLE `category` (
  `id` varchar(36) NOT NULL,
  `category` varchar(255) NOT NULL,
  `displayText` varchar(255) NOT NULL,
  `imageUrl` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `category`
--

INSERT INTO `category` (`id`, `category`, `displayText`, `imageUrl`) VALUES
('18f47e1d-dfb6-11ef-937e-1860248bdabc', 'ACCESSOIRES', 'ACCESSOIRES', 'https://www.fedongroup.com/assets/uploads/images/DSC0449.jpg'),
('2', 'SUNGLASSES', 'Sunglasses', 'https://sunski.com/cdn/shop/files/sunski_polarized_sunglasses_baia_24_1400x1100.jpg?v=1721341129'),
('59e86e4b-d983-11ef-937e-1860248bdabc', 'SPORTS', 'Sports', 'https://img.freepik.com/photos-gratuite/outils-sport_53876-138077.jpg');

-- --------------------------------------------------------

--
-- Structure de la table `detail_product`
--

CREATE TABLE `detail_product` (
  `id` varchar(36) NOT NULL,
  `color` varchar(255) NOT NULL,
  `productId` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `detail_product`
--

INSERT INTO `detail_product` (`id`, `color`, `productId`) VALUES
('3368c640-de50-11ef-937e-1860248bdabc', '#0080ff', '3d7e9c33-0080-4bd2-b2bf-56552da31e3g'),
('c65c6759-de3f-11ef-937e-1860248bdabc', 'red', '3d7e9c33-0080-4bd2-b2bf-56552da31e3g');

-- --------------------------------------------------------

--
-- Structure de la table `images`
--

CREATE TABLE `images` (
  `id` varchar(36) NOT NULL,
  `image` varchar(255) NOT NULL DEFAULT '0',
  `detailProductId` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `images`
--

INSERT INTO `images` (`id`, `image`, `detailProductId`) VALUES
('92964630-dd60-11ef-937e-1860248bdabc', 'https://png.pngtree.com/png-clipart/20220620/original/pngtree-red-gradient-sunglasses-free-vector-and-png-png-image_8134222.png', 'c65c6759-de3f-11ef-937e-1860248bdabc'),
('a8b3c986-dd5f-11ef-937e-1860248bdabc', 'https://res.cloudinary.com/ddaimmqrr/image/upload/v1690954152/Eyesome/sports3.88be7fae1effd927c7cd_dtuovm.png', 'c65c6759-de3f-11ef-937e-1860248bdabc'),
('ad3c6008-dd60-11ef-937e-1860248bdabc', 'https://example.com/images/image2.jpg', 'c65c6759-de3f-11ef-937e-1860248bdabc'),
('ef84bc12-de50-11ef-937e-1860248bdabc', 'https://mesnouvelleslunettes.fr/wp-content/uploads/sites/2/2018/09/monture-afternoon-pantone-eight-bleu-electrique-782x373.jpg', '3368c640-de50-11ef-937e-1860248bdabc'),
('ef84cc70-de50-11ef-937e-1860248bdabc', 'https://media.decovry.com/media/catalog/product/cache/p/a/9df78eab33525d08d6e5fb8d27136e95/pantone_n_three_bleu_electrique.png', '3368c640-de50-11ef-937e-1860248bdabc');

-- --------------------------------------------------------

--
-- Structure de la table `product`
--

CREATE TABLE `product` (
  `id` varchar(36) NOT NULL,
  `qty` int(11) NOT NULL DEFAULT 0,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `brand` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `gender` varchar(255) NOT NULL,
  `weight` varchar(255) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `image` varchar(255) NOT NULL,
  `rating` float NOT NULL DEFAULT 0,
  `price` float NOT NULL,
  `newPrice` float DEFAULT NULL,
  `trending` tinyint(4) NOT NULL DEFAULT 0,
  `createAt` varchar(255) NOT NULL DEFAULT '31/01/2025'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `product`
--

INSERT INTO `product` (`id`, `qty`, `name`, `description`, `brand`, `category`, `gender`, `weight`, `quantity`, `image`, `rating`, `price`, `newPrice`, `trending`, `createAt`) VALUES
('3d7e9c33-0080-4bd2-b2bf-56552da31e3g', 0, 'test tesst', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 'Ray-Ban', 'Sports', 'Men', '200g', 10, 'https://res.cloudinary.com/ddaimmqrr/image/upload/v1690954064/Eyesome/sports1.f986df729a29a685f835_ytdbfc.png', 4.5, 1999, 1899, 1, '2025-01-23'),
('6033723f-a8db-4ad8-bfda-d191778141aa', 0, 'Rose Gold Chase', 'Vivamus mattis quam sed libero pretium ullamcorper. Vivamus mattis quam sed libero pretium ullamcorper.', 'Ray-Ban', 'Vision', 'Women', '120g', 9, 'https://res.cloudinary.com/ddaimmqrr/image/upload/v1691424509/Eyesome/vision2.611b59463c103d118f9a_kygv5m.png', 4.3, 2999, 2599, 0, '2025-01-23'),
('8ad38385-1211-4192-8108-db851b4e9434', 0, 'Mercury Rounded Red', 'Donec interdum felis non justo sollicitudin lobortis. Donec interdum felis non justo sollicitudin lobortis.', 'Carrera', 'Vision', 'Unisex', '550g', 7, 'https://res.cloudinary.com/ddaimmqrr/image/upload/v1691424794/Eyesome/vision9.a438b28b85649a305924_asx3ic.png', 4.8, 4999, 4300, 0, '2025-01-23'),
('95cd381c-32cf-46e5-8a75-05d30a421d6b', 0, 'Hyperclax Active', 'Aenean at velit consequat, faucibus mi id, tempor velit. Aenean at velit consequat, faucibus mi id, tempor velit.', 'Oakley', 'Sports', 'Women', '900g', 3, 'https://res.cloudinary.com/ddaimmqrr/image/upload/v1691424391/Eyesome/sports6.eb4430d4a7f77b7b382c_qldpzi.png', 3.5, 3999, 3500, 0, '2025-01-23'),
('ac072970-8dac-42fe-8c31-a8fa6fd4b64a', 0, 'Full Rim Airflex', 'Donec interdum felis non justo sollicitudin lobortis. Donec interdum felis non justo sollicitudin lobortis.', 'Carrera', 'Vision', 'Unisex', '550g', 7, 'https://res.cloudinary.com/ddaimmqrr/image/upload/v1691424676/Eyesome/vision6.c4aa8c09c08cf6e5c4ac_ip3tt2.png', 4.8, 4999, 3999, 0, '2025-01-23'),
('c1244c63-dfb6-11ef-937e-1860248bdabc', 0, 'Etui', NULL, '', 'ACCESSOIRES', 'Women', NULL, 0, 'https://ma.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/80/004256/1.jpg?5776', 0, 70, 50, 0, '31/01/2025'),
('c6dcde20-2e9f-470c-b76c-38b01ab7e16e', 0, 'Candyfloss-302', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 'Ray-Ban', 'Sunglasses', 'Men', '200g', 10, 'https://res.cloudinary.com/ddaimmqrr/image/upload/v1691424907/Eyesome/sun3.4d937ecee4a510684712_gtqccx.png', 4.5, 1999, 1899, 0, '2025-01-23'),
('c76b3840-47d2-4d38-b465-af68e2af9dcd', 0, 'Phenomenal Mercury-02', 'Pellentesque ac tortor sed ipsum feugiat condimentum. Pellentesque ac tortor sed ipsum feugiat condimentum.', 'Persol', 'Sunglasses', 'Unisex', '100g', 5, 'https://res.cloudinary.com/ddaimmqrr/image/upload/v1691424973/Eyesome/sun4.8c4033c31b159eb6dd95_odgrlo.png', 2.8, 1299, 1200, 0, '2025-01-23'),
('dc2b2495-eb6c-4889-a6f7-3c8853a01ba2', 0, 'Alder Street', 'Integer et nunc in turpis maximus facilisis ac ac elit.Integer et nunc in turpis maximus facilisis ac ac elit.', 'Kate Spade', 'Sports', 'Unisex', '750g', 15, 'https://res.cloudinary.com/ddaimmqrr/image/upload/v1690954152/Eyesome/sports3.88be7fae1effd927c7cd_dtuovm.png', 4.7, 2999, 2000, 1, '2025-01-23'),
('fd25068a-9647-45ba-b44d-c8af1523148a', 0, 'Corral Round', 'Vestibulum eu tellus sed lorem tristique lacinia ut vel urna. Vestibulum eu tellus sed lorem tristique lacinia ut vel urna.', 'Carrera', 'Sports', 'Unisex', '300g', 8, 'https://res.cloudinary.com/ddaimmqrr/image/upload/v1691424333/Eyesome/sports4.5ad4095e77c6175978f9_ivfmjv.png', 3.8, 2499, 2300, 0, '2025-01-23');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `detail_product`
--
ALTER TABLE `detail_product`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_27a6f72155c0f5eb41fb9bbac61` (`productId`);

--
-- Index pour la table `images`
--
ALTER TABLE `images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_16ef64f171a76532a8bd7731228` (`detailProductId`);

--
-- Index pour la table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`id`);

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `detail_product`
--
ALTER TABLE `detail_product`
  ADD CONSTRAINT `FK_27a6f72155c0f5eb41fb9bbac61` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Contraintes pour la table `images`
--
ALTER TABLE `images`
  ADD CONSTRAINT `FK_16ef64f171a76532a8bd7731228` FOREIGN KEY (`detailProductId`) REFERENCES `detail_product` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
