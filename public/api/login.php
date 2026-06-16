<?php
require __DIR__ . '/../../config/auth.php';
require __DIR__ . '/../../config/database.php';

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$usuario = trim($input['usuario'] ?? '');
$senha = $input['senha'] ?? '';

if ($usuario === '' || $senha === '') {
    json_response(['erro' => true, 'mensagem' => 'Informe usuário e senha.'], 422);
}

$stmt = $pdo->prepare("SELECT id, nome, usuario, password_hash, role FROM usuarios WHERE usuario = ? AND ativo = 1 LIMIT 1");
$stmt->execute([$usuario]);
$user = $stmt->fetch();

if (!$user || !password_verify($senha, $user['password_hash'])) {
    json_response(['erro' => true, 'mensagem' => 'Usuário ou senha inválidos.'], 401);
}

session_regenerate_id(true);
$_SESSION['usuario'] = [
    'id' => (int)$user['id'],
    'nome' => $user['nome'],
    'usuario' => $user['usuario'],
    'role' => $user['role'],
];

json_response([
    'erro' => false,
    'mensagem' => 'Login realizado com sucesso.',
    'usuario' => $_SESSION['usuario'],
]);
