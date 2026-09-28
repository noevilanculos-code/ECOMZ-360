-- ============================================================
-- ECO-MZ 360 - Banco de Dados MySQL
-- Plataforma de Gestão e Monitoramento Ambiental de Moçambique
-- ============================================================

CREATE DATABASE IF NOT EXISTS `ecomz_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `ecomz_db`;

-- 1. Tabela de Províncias de Moçambique
CREATE TABLE IF NOT EXISTS `provincias` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nome` VARCHAR(50) NOT NULL UNIQUE,
  `regiao` ENUM('Norte', 'Centro', 'Sul') NOT NULL,
  `capital` VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `provincias` (`nome`, `regiao`, `capital`) VALUES
('Cabo Delgado', 'Norte', 'Pemba'),
('Niassa', 'Norte', 'Lichinga'),
('Nampula', 'Norte', 'Nampula'),
('Zambézia', 'Centro', 'Quelimane'),
('Tete', 'Centro', 'Tete'),
('Manica', 'Centro', 'Chimoio'),
('Sofala', 'Centro', 'Beira'),
('Inhambane', 'Sul', 'Inhambane'),
('Gaza', 'Sul', 'Xai-Xai'),
('Maputo Província', 'Sul', 'Matola'),
('Maputo Cidade', 'Sul', 'Maputo');

-- 2. Tabela de Usuários / Fiscais / Cidadãos
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nome` VARCHAR(100) NOT NULL,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `senha_hash` VARCHAR(255) NOT NULL,
  `tipo` ENUM('cidadao', 'fiscal', 'gestor', 'ong') DEFAULT 'cidadao',
  `provincia_id` INT NULL,
  `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`provincia_id`) REFERENCES `provincias`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabela de Ocorrências Ambientais
CREATE TABLE IF NOT EXISTS `ocorrencias` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `titulo` VARCHAR(150) NOT NULL,
  `descricao` TEXT NOT NULL,
  `categoria` ENUM('Desmatamento', 'Queimada', 'Poluicao_Agua', 'Mangaal', 'Residuos', 'Outro') NOT NULL,
  `provincia` VARCHAR(50) NOT NULL,
  `distrito` VARCHAR(80) NOT NULL,
  `latitude` DECIMAL(10, 7) NOT NULL,
  `longitude` DECIMAL(10, 7) NOT NULL,
  `gravidade` ENUM('baixa', 'media', 'alta', 'critica') DEFAULT 'media',
  `status` ENUM('pendente', 'em_analise', 'em_acao', 'resolvido') DEFAULT 'pendente',
  `usuario_id` INT NULL,
  `foto_url` VARCHAR(255) NULL,
  `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabela de Projetos Ecológicos
CREATE TABLE IF NOT EXISTS `projetos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `titulo` VARCHAR(150) NOT NULL,
  `descricao` TEXT NOT NULL,
  `categoria` VARCHAR(50) NOT NULL,
  `provincia` VARCHAR(50) NOT NULL,
  `meta_arvores` INT DEFAULT 0,
  `arvores_plantadas` INT DEFAULT 0,
  `voluntarios_inscritos` INT DEFAULT 0,
  `status` ENUM('planejamento', 'em_execucao', 'concluido') DEFAULT 'em_execucao',
  `data_inicio` DATE NOT NULL,
  `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Tabela de Inquéritos Comunitários (Pesquisas de Campo)
CREATE TABLE IF NOT EXISTS `inqueritos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `titulo` VARCHAR(150) NOT NULL,
  `descricao` TEXT NULL,
  `google_form_id` VARCHAR(100) NULL,
  `provincia` VARCHAR(50) NOT NULL,
  `respostas_coletadas` INT DEFAULT 0,
  `ativo` TINYINT(1) DEFAULT 1,
  `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Inserção de Dados Iniciais de Demonstração
INSERT INTO `ocorrencias` (`titulo`, `descricao`, `categoria`, `provincia`, `distrito`, `latitude`, `longitude`, `gravidade`, `status`) VALUES
('Corte Ilegal de Mangleiros', 'Extracção descontrolada de estacas para carvão vegetal no estuário do Rio Búzi.', 'Mangaal', 'Sofala', 'Búzi', -19.8833, 34.6000, 'critica', 'em_acao'),
('Foco de Queimada Próximo a Aldeia', 'Queimada descontrolada em preparação de machamba ameaçando reserva florestal.', 'Queimada', 'Niassa', 'Marrupa', -13.1833, 37.5000, 'alta', 'pendente'),
('Depósito Irregular de Resíduos Plásticos', 'Lixeira a céu aberto junto à orla costeira e drenagem pluvial.', 'Residuos', 'Maputo Cidade', 'KaMpfumo', -25.9667, 32.5833, 'media', 'resolvido');

INSERT INTO `projetos` (`titulo`, `descricao`, `categoria`, `provincia`, `meta_arvores`, `arvores_plantadas`, `voluntarios_inscritos`, `status`, `data_inicio`) VALUES
('Restauração do Mangal de Sofala', 'Replantio comunitário de 50.000 propágulos de Rhizophora mucronata na baía.', 'Mangais', 'Sofala', 50000, 31200, 84, 'em_execucao', '2026-01-15'),
('Brigada Anti-Queimadas do Miombo', 'Criação de faixas corta-fogo e capacitação comunitária de agricultores.', 'Prevenção Florestal', 'Niassa', 10000, 4800, 52, 'em_execucao', '2026-02-01'),
('Ecopontos Urbanos de Maputo', 'Instalação de pontos de entrega voluntária de plásticos e garrafas PET.', 'Reciclagem', 'Maputo Cidade', 5000, 2100, 37, 'em_execucao', '2026-03-10');
