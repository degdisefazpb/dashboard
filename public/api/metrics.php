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
            WHEN dias_restantes_licenca > 0 
            THEN 1 ELSE 0 
        END) AS servidores_com_licenca,

        SUM(CASE 
            WHEN dias_restantes_licenca > 0
             AND cid IS NOT NULL 
             AND TRIM(cid) <> ''
             AND UPPER(TRIM(cid)) REGEXP '^F[0-9]' 
            THEN 1 ELSE 0 
        END) AS servidores_com_cid_f

    FROM (
        SELECT
            cid,
            CASE
                WHEN data_final_licenca IS NOT NULL
                THEN GREATEST(DATEDIFF(data_final_licenca, CURDATE()), 0)
                ELSE 0
            END AS dias_restantes_licenca
        FROM (
            SELECT
                cid,
                CASE
                    WHEN licenca IS NULL OR TRIM(licenca) = '' THEN NULL

                    WHEN TRIM(licenca) REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
                    THEN DATE(TRIM(licenca))

                    WHEN TRIM(licenca) REGEXP '^[0-9]{2}/[0-9]{2}/[0-9]{4}$'
                    THEN STR_TO_DATE(TRIM(licenca), '%d/%m/%Y')

                    ELSE NULL
                END AS data_final_licenca
            FROM vw_servidores_dashboard
            WHERE ativo = 1
        ) base
    ) calculado
")[0] ?? [
    'servidores_com_licenca' => 0,
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
            licenca,
            DATE_FORMAT(data_final_licenca, '%d/%m/%Y') AS data_final_licenca_formatada,
            dias_restantes_licenca AS dias_licenca_medica,
            cid,
            CASE 
                WHEN cid IS NOT NULL 
                 AND TRIM(cid) <> ''
                 AND UPPER(TRIM(cid)) REGEXP '^F[0-9]' 
                THEN 1 
                ELSE 0 
            END AS cid_f
        FROM (
            SELECT
                matricula,
                nome,
                grupo_ocupacional,
                cargo_fiscal,
                sexo,
                idade,
                licenca,
                cid,

                CASE
                    WHEN licenca IS NULL OR TRIM(licenca) = '' THEN NULL

                    WHEN TRIM(licenca) REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
                    THEN DATE(TRIM(licenca))

                    WHEN TRIM(licenca) REGEXP '^[0-9]{2}/[0-9]{2}/[0-9]{4}$'
                    THEN STR_TO_DATE(TRIM(licenca), '%d/%m/%Y')

                    ELSE NULL
                END AS data_final_licenca,

                CASE
                    WHEN licenca IS NULL OR TRIM(licenca) = '' THEN 0

                    WHEN TRIM(licenca) REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
                    THEN GREATEST(DATEDIFF(DATE(TRIM(licenca)), CURDATE()), 0)

                    WHEN TRIM(licenca) REGEXP '^[0-9]{2}/[0-9]{2}/[0-9]{4}$'
                    THEN GREATEST(DATEDIFF(STR_TO_DATE(TRIM(licenca), '%d/%m/%Y'), CURDATE()), 0)

                    ELSE 0
                END AS dias_restantes_licenca

            FROM vw_servidores_dashboard
            WHERE ativo = 1
        ) dados
        WHERE dias_restantes_licenca > 0
        ORDER BY dias_restantes_licenca DESC, nome ASC
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
