<?php
/**
 * Uso:
 * php scripts/criar_usuario_admin.php admin MinhaSenhaForte "Nome do Admin"
 */
require __DIR__ . '/../config/database.php';

$usuario = $argv[1] ?? null;
$senha = $argv[2] ?? null;
$nome = $argv[3] ?? 'Administrador';

if (!$usuario || !$senha) {
    echo "Uso: php scripts/criar_usuario_admin.php admin MinhaSenhaForte \"Nome do Admin\"\n";
    exit(1);
}

$hash = password_hash($senha, PASSWORD_DEFAULT);

$stmt = $pdo->prepare("SELECT id FROM usuarios WHERE usuario = ? LIMIT 1");
$stmt->execute([$usuario]);
$existente = $stmt->fetch();

if ($existente) {
    $stmt = $pdo->prepare("UPDATE usuarios SET nome = ?, password_hash = ?, role = 'admin', ativo = 1 WHERE usuario = ?");
    $stmt->execute([$nome, $hash, $usuario]);
    echo "Usuário admin atualizado: {$usuario}\n";
} else {
    $stmt = $pdo->prepare("INSERT INTO usuarios (nome, usuario, password_hash, role, ativo) VALUES (?, ?, ?, 'admin', 1)");
    $stmt->execute([$nome, $usuario, $hash]);
    echo "Usuário admin criado: {$usuario}\n";
}
