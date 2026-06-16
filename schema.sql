-- Banco sugerido
CREATE DATABASE IF NOT EXISTS dashboard_fiscal
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE dashboard_fiscal;

-- Usuários do dashboard administrativo
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    usuario VARCHAR(80) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin') NOT NULL DEFAULT 'admin',
    ativo TINYINT(1) NOT NULL DEFAULT 1,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Servidores usados no painel
CREATE TABLE IF NOT EXISTS servidores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    matricula VARCHAR(40) NULL UNIQUE,
    nome VARCHAR(180) NOT NULL,
    grupo_ocupacional ENUM('AUDITOR','TECNICO','COMISSIONADO') NOT NULL,
    cargo_fiscal ENUM('AFTE','AFTME') NULL,
    sexo ENUM('M','F','NA') NOT NULL DEFAULT 'NA',
    data_nascimento DATE NULL,
    classe VARCHAR(20) NULL,
    nivel VARCHAR(20) NULL,
    em_gestao TINYINT(1) NOT NULL DEFAULT 0,
    dias_licenca_medica INT NOT NULL DEFAULT 0,
    cid VARCHAR(20) NULL,
    ativo TINYINT(1) NOT NULL DEFAULT 1,
    data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_grupo (grupo_ocupacional),
    INDEX idx_cargo_fiscal (cargo_fiscal),
    INDEX idx_sexo (sexo),
    INDEX idx_classe_nivel (classe, nivel),
    INDEX idx_gestao (em_gestao),
    INDEX idx_cid (cid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dados de exemplo fictícios. Apague antes de importar os dados reais.
INSERT INTO servidores
(matricula, nome, grupo_ocupacional, cargo_fiscal, sexo, data_nascimento, classe, nivel, em_gestao, dias_licenca_medica, cid)
VALUES
('0001', 'Servidor Exemplo 1', 'AUDITOR', 'AFTE', 'M', '1962-05-10', 'A', 'IV', 1, 0, NULL),
('0002', 'Servidor Exemplo 2', 'AUDITOR', 'AFTME', 'F', '1978-11-20', 'B', 'III', 0, 12, 'J11'),
('0003', 'Servidor Exemplo 3', 'TECNICO', NULL, 'F', '1960-01-15', NULL, NULL, 0, 30, 'F32'),
('0004', 'Servidor Exemplo 4', 'COMISSIONADO', NULL, 'M', '1990-07-01', NULL, NULL, 1, 0, NULL)
ON DUPLICATE KEY UPDATE nome = VALUES(nome);
