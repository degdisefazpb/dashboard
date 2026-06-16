<?php
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

function json_response(array $data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function is_logged_in(): bool
{
    return isset($_SESSION['usuario']) && !empty($_SESSION['usuario']['id']);
}

function current_user(): ?array
{
    return is_logged_in() ? $_SESSION['usuario'] : null;
}

function require_admin(): void
{
    if (!is_logged_in() || ($_SESSION['usuario']['role'] ?? '') !== 'admin') {
        json_response([
            'erro' => true,
            'mensagem' => 'Acesso restrito. Faça login administrativo.',
        ], 401);
    }
}
