<?php
/**
 * Conexão PDO com MySQL.
 * Ajuste as variáveis abaixo ou use variáveis de ambiente no servidor.
 */

$DB_HOST = getenv('DB_HOST') ?: '10.10.253.252';
$DB_PORT = getenv('DB_PORT') ?: '3306';
$DB_NAME = getenv('DB_NAME') ?: 'dash_sefaz';
$DB_USER = getenv('DB_USER') ?: 'degdi_user';
$DB_PASS = getenv('DB_PASS') ?: 'e32553c42ebb7c54ba2025d6888f820233b9b5ed722949c109f7dd2cab4962c6';

$dsn = "mysql:host={$DB_HOST};port={$DB_PORT};dbname={$DB_NAME};charset=utf8mb4";

try {
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'erro' => true,
        'mensagem' => 'Erro ao conectar ao banco de dados.',
        'detalhe_dev' => $e->getMessage(),
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
