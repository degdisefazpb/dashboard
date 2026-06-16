<?php
require __DIR__ . '/../../config/auth.php';
require __DIR__ . '/../../config/database.php';

require_admin();

$filename = 'export_servidores_' . date('Ymd_His') . '.csv';

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Pragma: no-cache');
header('Expires: 0');

$output = fopen('php://output', 'w');

// BOM para abrir corretamente no Excel em português.
fwrite($output, "\xEF\xBB\xBF");

fputcsv($output, [
    'matricula',
    'nome',
    'grupo_ocupacional',
    'cargo_fiscal',
    'sexo',
    'data_nascimento',
    'idade',
    'classe',
    'nivel',
    'em_gestao',
    'dias_licenca_medica',
    'cid',
    'cid_f',
    'possivel_aposentadoria_60_mais',
    'data_atualizacao',
], ';');

$stmt = $pdo->query("
    SELECT
        matricula,
        nome,
        grupo_ocupacional,
        cargo_fiscal,
        sexo,
        data_nascimento,
        TIMESTAMPDIFF(YEAR, data_nascimento, CURDATE()) AS idade,
        classe,
        nivel,
        em_gestao,
        dias_licenca_medica,
        cid,
        CASE WHEN cid IS NOT NULL AND UPPER(TRIM(cid)) REGEXP '^F[0-9]' THEN 'SIM' ELSE 'NAO' END AS cid_f,
        CASE
            WHEN grupo_ocupacional IN ('AUDITOR','TECNICO')
             AND data_nascimento IS NOT NULL
             AND TIMESTAMPDIFF(YEAR, data_nascimento, CURDATE()) >= 60
            THEN 'SIM' ELSE 'NAO'
        END AS possivel_aposentadoria_60_mais,
        data_atualizacao
    FROM vw_servidores_dashboard
    WHERE ativo = 1
    ORDER BY grupo_ocupacional, nome
");

while ($row = $stmt->fetch()) {
    fputcsv($output, $row, ';');
}

fclose($output);
exit;
