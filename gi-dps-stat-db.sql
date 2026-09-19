-- =====================================================================
-- GenshinDPS: Combat Analytics & Telemetry Archive
-- Database Schema: gi-dps-stat-db.sql
-- Target DBMS: MySQL 8.0+ / MariaDB 10.5+
-- Charset: utf8mb4 / Collation: utf8mb4_unicode_ci
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `genshin_dps`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `genshin_dps`;

-- Disable foreign key checks during table setup
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `run_elemental_shares`;
DROP TABLE IF EXISTS `run_rotations`;
DROP TABLE IF EXISTS `run_characters`;
DROP TABLE IF EXISTS `dps_runs`;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- 1. CORE TABLE: dps_runs
-- Stores top-level combat telemetry from damage simulator/test dummy
-- =====================================================================
CREATE TABLE `dps_runs` (
  `id`                    VARCHAR(36) NOT NULL,
  `stage_guid`            VARCHAR(64) NULL COMMENT 'Stage GUID watermark identifier',
  `uid`                   VARCHAR(32) NULL COMMENT 'Player UID from bottom-right watermark',
  `test_preset`           VARCHAR(64) NOT NULL COMMENT 'e.g. Abyss 12, Local Legend, Overworld',
  `dps`                   INT NOT NULL COMMENT 'Average Damage Per Second',
  `time_elapsed_seconds`  DECIMAL(6, 2) NOT NULL COMMENT 'Combat duration in seconds (e.g. 115.83)',
  `total_damage`          DECIMAL(16, 0) NOT NULL COMMENT 'Cumulative damage dealt across all rotations',
  `strongest_hit`         INT NOT NULL COMMENT 'Peak single-instance damage hit',
  
  -- Target Dummy Modifiers
  `target_name`           VARCHAR(64) NOT NULL DEFAULT 'Target Dummy' COMMENT 'e.g. Mitachurl, Ruin Guard',
  `target_level`          INT NOT NULL DEFAULT 100 COMMENT 'Enemy target level',
  `target_resistances`    JSON NOT NULL COMMENT '8-element resistance map {"pyro":10,"hydro":10,"electro":10,"cryo":10,"anemo":10,"geo":10,"dendro":10,"physical":10}',
  
  -- Versioning, Assets & Audit Verification
  `gameVersion`           VARCHAR(16) NOT NULL DEFAULT '7.0' COMMENT 'Active patch version (e.g. 7.0)',
  `image_url`             VARCHAR(512) NOT NULL COMMENT 'Relative path or URI of original test screenshot',
  `verified`              TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 if human-verified, 0 if raw OCR/LLM extraction',
  `created_at`            DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`            DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  INDEX `idx_dps_runs_preset` (`test_preset`),
  INDEX `idx_dps_runs_game_version` (`gameVersion`),
  INDEX `idx_dps_runs_dps` (`dps`),
  INDEX `idx_dps_runs_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 2. PARTY MEMBER TABLE: run_characters
-- Stores character contribution, slot order, and extracted attribute sheets
-- =====================================================================
CREATE TABLE `run_characters` (
  `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `run_id`            VARCHAR(36) NOT NULL,
  `slot_order`        TINYINT UNSIGNED NOT NULL COMMENT 'Party position order (1 to 4)',
  `name`              VARCHAR(64) NOT NULL COMMENT 'Character name (e.g. Varesa, Mavuika)',
  `level`             INT NOT NULL DEFAULT 90 COMMENT 'Character level',
  `damage_dealt`      DECIMAL(14, 0) NOT NULL COMMENT 'Damage dealt by character in this run',
  `damage_percent`    INT NOT NULL COMMENT 'Contribution percentage (0-100)',
  
  -- Attribute Sheet Metrics
  `hp`                INT NOT NULL COMMENT 'Total Max HP',
  `base_atk`          INT NOT NULL COMMENT 'White base attack',
  `atk`               INT NOT NULL COMMENT 'Total attack value',
  `base_def`          INT NOT NULL COMMENT 'White base defense',
  `def`               INT NOT NULL COMMENT 'Total defense value',
  `crit_rate`         DECIMAL(5, 1) NOT NULL COMMENT 'Crit Rate percentage (e.g. 60.0)',
  `crit_damage`       DECIMAL(6, 1) NOT NULL COMMENT 'Crit Damage percentage (e.g. 251.0)',
  `energy_recharge`   DECIMAL(5, 1) NOT NULL COMMENT 'Energy Recharge percentage (e.g. 134.0)',
  `elemental_mastery` INT NOT NULL DEFAULT 0 COMMENT 'Elemental Mastery score',
  
  -- Elemental Damage Bonus JSON (e.g. {"electroDmg": 47.0} or {"pyroDmg": 47.0})
  `damage_bonuses`    JSON NULL,

  PRIMARY KEY (`id`),
  INDEX `idx_run_characters_name` (`name`),
  INDEX `idx_run_characters_run_id` (`run_id`),
  CONSTRAINT `fk_run_characters_run`
    FOREIGN KEY (`run_id`) REFERENCES `dps_runs` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 3. ROTATION TIMELINE: run_rotations
-- Stores individual rotation cadence metrics and duration breakdown
-- =====================================================================
CREATE TABLE `run_rotations` (
  `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `run_id`            VARCHAR(36) NOT NULL,
  `rotation_number`   SMALLINT UNSIGNED NOT NULL COMMENT 'Sequential rotation number (1, 2, 3...)',
  `dps`               INT NOT NULL COMMENT 'DPS achieved during this specific rotation cycle',
  `damage_dealt`      DECIMAL(14, 0) NOT NULL COMMENT 'Damage dealt during this cycle',
  `duration_seconds`  DECIMAL(6, 2) NOT NULL COMMENT 'Cycle duration in seconds (e.g. 19.05)',

  PRIMARY KEY (`id`),
  INDEX `idx_run_rotations_run_cycle` (`run_id`, `rotation_number`),
  CONSTRAINT `fk_run_rotations_run`
    FOREIGN KEY (`run_id`) REFERENCES `dps_runs` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 4. ELEMENTAL DAMAGE DISTRIBUTION: run_elemental_shares
-- Stores elemental percentage breakdown for the test run
-- =====================================================================
CREATE TABLE `run_elemental_shares` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `run_id`      VARCHAR(36) NOT NULL,
  `element`     VARCHAR(16) NOT NULL COMMENT 'Pyro, Hydro, Electro, Cryo, Anemo, Geo, Dendro, Physical',
  `percentage`  INT NOT NULL COMMENT 'Share percentage (0 to 100)',

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_run_element` (`run_id`, `element`),
  INDEX `idx_run_elemental_shares_run_id` (`run_id`),
  CONSTRAINT `fk_run_elemental_shares_run`
    FOREIGN KEY (`run_id`) REFERENCES `dps_runs` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- REFERENCE BENCHMARK SEED DATA
-- Abyss 12 Mitachurl Lv. 100 (Varesa & Mavuika Overload Hypercarry)
-- =====================================================================
START TRANSACTION;

INSERT INTO `dps_runs` (
  `id`,
  `stage_guid`,
  `uid`,
  `test_preset`,
  `dps`,
  `time_elapsed_seconds`,
  `total_damage`,
  `strongest_hit`,
  `target_name`,
  `target_level`,
  `target_resistances`,
  `gameVersion`,
  `image_url`,
  `verified`,
  `created_at`,
  `updated_at`
) VALUES (
  'f87a1921-6dc3-4a18-971c-4395b28710a1',
  '13031458938',
  '835033286',
  'Abyss 12',
  143554,
  115.83,
  16627852,
  358600,
  'Mitachurl',
  100,
  '{"pyro":10,"hydro":10,"electro":10,"cryo":10,"anemo":10,"geo":10,"dendro":10,"physical":10}',
  '7.0',
  '/sample-runs/sample-dps-run.png',
  1,
  '2026-09-19 14:30:00.000',
  '2026-09-19 14:30:00.000'
);

-- Party Members
INSERT INTO `run_characters` (
  `run_id`, `slot_order`, `name`, `level`, `damage_dealt`, `damage_percent`,
  `hp`, `base_atk`, `atk`, `base_def`, `def`, `crit_rate`, `crit_damage`,
  `energy_recharge`, `elemental_mastery`, `damage_bonuses`
) VALUES
(
  'f87a1921-6dc3-4a18-971c-4395b28710a1', 1, 'Varesa', 90, 7504109, 45,
  18355, 866, 2000, 782, 851, 60.0, 251.0, 134.0, 0,
  '{"electroDmg": 47.0}'
),
(
  'f87a1921-6dc3-4a18-971c-4395b28710a1', 2, 'Iansan', 90, 532027, 3,
  16494, 865, 3125, 638, 738, 50.0, 116.0, 217.0, 0,
  '{}'
),
(
  'f87a1921-6dc3-4a18-971c-4395b28710a1', 3, 'Chevreuse', 90, 195722, 1,
  40412, 758, 1356, 605, 873, 42.0, 76.0, 148.0, 0,
  '{}'
),
(
  'f87a1921-6dc3-4a18-971c-4395b28710a1', 4, 'Mavuika', 90, 8395994, 50,
  17571, 1099, 2697, 792, 847, 59.0, 210.0, 113.0, 0,
  '{"pyroDmg": 47.0}'
);

-- Rotations
INSERT INTO `run_rotations` (`run_id`, `rotation_number`, `dps`, `damage_dealt`, `duration_seconds`) VALUES
('f87a1921-6dc3-4a18-971c-4395b28710a1', 1, 161000, 3065636, 19.05),
('f87a1921-6dc3-4a18-971c-4395b28710a1', 2, 137000, 2382932, 17.37),
('f87a1921-6dc3-4a18-971c-4395b28710a1', 3, 145000, 2915748, 20.16),
('f87a1921-6dc3-4a18-971c-4395b28710a1', 4, 146000, 2706486, 18.48),
('f87a1921-6dc3-4a18-971c-4395b28710a1', 5, 151000, 2965757, 19.62);

-- Elemental Damage Distribution
INSERT INTO `run_elemental_shares` (`run_id`, `element`, `percentage`) VALUES
('f87a1921-6dc3-4a18-971c-4395b28710a1', 'Pyro', 52),
('f87a1921-6dc3-4a18-971c-4395b28710a1', 'Electro', 48),
('f87a1921-6dc3-4a18-971c-4395b28710a1', 'Hydro', 0),
('f87a1921-6dc3-4a18-971c-4395b28710a1', 'Cryo', 0),
('f87a1921-6dc3-4a18-971c-4395b28710a1', 'Anemo', 0),
('f87a1921-6dc3-4a18-971c-4395b28710a1', 'Geo', 0),
('f87a1921-6dc3-4a18-971c-4395b28710a1', 'Dendro', 0),
('f87a1921-6dc3-4a18-971c-4395b28710a1', 'Physical', 0);

COMMIT;

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================
-- 1. Check loaded runs
SELECT id, test_preset, dps, time_elapsed_seconds, total_damage, target_name, gameVersion, verified
FROM `dps_runs`;

-- 2. Party members & damage contribution
SELECT 
  r.test_preset,
  c.slot_order,
  c.name AS character_name,
  c.damage_percent,
  c.damage_dealt,
  c.crit_rate,
  c.crit_damage,
  c.atk
FROM `run_characters` c
JOIN `dps_runs` r ON c.run_id = r.id
ORDER BY c.slot_order ASC;
