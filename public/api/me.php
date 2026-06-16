<?php
require __DIR__ . '/../../config/auth.php';

json_response([
    'autenticado' => is_logged_in(),
    'usuario' => current_user(),
]);
