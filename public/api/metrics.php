<?php
require __DIR__ . '/../../config/auth.php';
require __DIR__ . '/../../config/database.php';

$isAdmin = is_logged_in() && (current_user()['role'] ?? '') === 'admin';

function scalar_query(PDO $pdo, string $sql, array $params = [])
{
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchColumn();
}

function rows(PDO $pdo, string $sql, array $params = []): array
{
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

$totalPorGrupo = rows($pdo, "
    SELECT grupo_ocupacional, COUNT(*) AS quantidade
   FROM vw_servidores_dashboard
    WHERE ativo = 1
    GROUP BY grupo_ocupacional
");

$auditoresPorCargo = rows($pdo, "
    SELECT COALESCE(cargo_fiscal, 'NAO_INFORMADO') AS cargo_fiscal, COUNT(*) AS quantidade
    FROM vw_servidores_dashboard
    WHERE ativo = 1 AND grupo_ocupacional = 'AUDITOR'
    GROUP BY cargo_fiscal
");

$sexoAuditores = rows($pdo, "
    SELECT sexo, COUNT(*) AS quantidade
    FROM vw_servidores_dashboard
    WHERE ativo = 1 AND grupo_ocupacional = 'AUDITOR'
    GROUP BY sexo
");

$idadeMediaGeral = scalar_query($pdo, "
    SELECT ROUND(AVG(idade), 1)
    FROM vw_servidores_dashboard
    WHERE ativo = 1
      AND idade IS NOT NULL
      AND idade > 0
");

$idadeMediaPorGrupo = rows($pdo, "
    SELECT 
        grupo_ocupacional,
        ROUND(AVG(idade), 1) AS idade_media
    FROM vw_servidores_dashboard
    WHERE ativo = 1
      AND idade IS NOT NULL
      AND idade > 0
    GROUP BY grupo_ocupacional
");

$aposentadoriasEsperadas = rows($pdo, "
    SELECT grupo_ocupacional, COUNT(*) AS quantidade
    FROM vw_servidores_dashboard
    WHERE ativo = 1
      AND grupo_ocupacional IN ('AUDITOR','TECNICO')
      AND idade >= 60
    GROUP BY grupo_ocupacional
");

$auditoresGestao = rows($pdo, "
    SELECT sexo, COUNT(*) AS quantidade
    FROM vw_servidores_dashboard
    WHERE ativo = 1
      AND grupo_ocupacional = 'AUDITOR'
      AND em_gestao = 1
    GROUP BY sexo
");

$distribuicaoClasseNivel = rows($pdo, "
    SELECT COALESCE(classe, 'Sem classe') AS classe,
           COALESCE(nivel, 'Sem nível') AS nivel,
           COUNT(*) AS quantidade
    FROM vw_servidores_dashboard
    WHERE ativo = 1 AND grupo_ocupacional = 'AUDITOR'
    GROUP BY classe, nivel
    ORDER BY classe, nivel
");

$licencas = rows($pdo, "
    SELECT
        SUM(CASE 
            WHEN COALESCE(dias_licenca_medica, 0) > 0 
            THEN 1 
            ELSE 0 
        END) AS servidores_com_licenca,

        COALESCE(SUM(CASE 
            WHEN COALESCE(dias_licenca_medica, 0) > 0 
            THEN dias_licenca_medica 
            ELSE 0 
        END), 0) AS total_dias_licenca,

        SUM(CASE 
            WHEN COALESCE(dias_licenca_medica, 0) > 0
             AND cid IS NOT NULL 
             AND TRIM(cid) <> ''
             AND UPPER(TRIM(cid)) REGEXP '^F[0-9]' 
            THEN 1 
            ELSE 0 
        END) AS servidores_com_cid_f

    FROM vw_servidores_dashboard
    WHERE ativo = 1
")[0] ?? [
    'servidores_com_licenca' => 0,
    'total_dias_licenca' => 0,
    'servidores_com_cid_f' => 0,
];

$detalhesLicencas = [];
if ($isAdmin) {
    $detalhesLicencas = rows($pdo, "
        SELECT
            matricula,
            nome,
            grupo_ocupacional,
            cargo_fiscal,
            sexo,
            idade,
            dias_licenca_medica,
            cid,
            CASE WHEN cid IS NOT NULL AND UPPER(TRIM(cid)) REGEXP '^F[0-9]' THEN 1 ELSE 0 END AS cid_f
        FROM vw_servidores_dashboard
        WHERE ativo = 1
          AND (dias_licenca_medica > 0 OR (cid IS NOT NULL AND cid <> ''))
        ORDER BY dias_licenca_medica DESC, nome ASC
        LIMIT 500
    ");
}

json_response([
    'erro' => false,
    'modo' => $isAdmin ? 'admin' : 'publico',
    'usuario' => current_user(),
    'dados' => [
        'total_por_grupo' => $totalPorGrupo,
        'auditores_por_cargo' => $auditoresPorCargo,
        'sexo_auditores' => $sexoAuditores,
        'idade_media_geral' => $idadeMediaGeral ? (float)$idadeMediaGeral : null,
        'idade_media_por_grupo' => $idadeMediaPorGrupo,
        'aposentadorias_esperadas' => $aposentadoriasEsperadas,
        'auditores_gestao' => $auditoresGestao,
        'distribuicao_classe_nivel' => $distribuicaoClasseNivel,
        'licencas' => $licencas,
        'detalhes_licencas_admin' => $detalhesLicencas,
    ],
]);
