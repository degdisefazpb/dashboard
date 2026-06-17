<?php
require __DIR__ . '/../config/auth.php';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Gerencial - Grupo Ocupacional Servidor Fiscal Tributário</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="app-shell">
        <header class="topbar">
            <div class="brand">
                <div class="logo-box">
                    <img src="assets/img/logo.png" alt="Logo" onerror="this.style.display='none'; this.parentElement.classList.add('sem-logo');">
                    <span>LOGO</span>
                </div>
                <div>
                    <p class="eyebrow">Dashboard Gerencial</p>
                    <h1>Grupo Ocupacional Servidor Fiscal Tributário</h1>
                    <p class="subtitle">Indicadores consolidados de auditores, técnicos, comissionados e terceirizados.</p>
                </div>
            </div>

            <div class="actions">
                <span id="statusModo" class="badge publico">Modo público</span>
                <button id="btnLogin" class="btn primary">Login administrativo</button>
                <a id="btnExportar" class="btn success hidden" href="api/export.php">Exportar CSV</a>
                <button id="btnLogout" class="btn ghost hidden">Sair</button>
            </div>
        </header>

        <section class="notice">
            <strong>Observação:</strong> o painel público exibe apenas dados agregados. Nomes, matrículas e CID aparecem somente com login administrativo.
        </section>

        <main>
            <section class="grid cards-principais">
                <article class="card metric">
                    <p>Auditores</p>
                    <h2 id="qtdAuditores">0</h2>
                    <small>Total no grupo ocupacional</small>
                </article>
                <article class="card metric">
                    <p>Técnicos</p>
                    <h2 id="qtdTecnicos">0</h2>
                    <small>Total no grupo ocupacional</small>
                </article>
                <article class="card metric">
                    <p>Comissionados</p>
                    <h2 id="qtdComissionados">0</h2>
                    <small>Total no grupo ocupacional</small>
                </article>
                <article class="card metric">
                    <p>Terceirizados</p>
                    <h2 id="qtdTerceirizados">0</h2>
                    <small>Total no grupo ocupacional</small>
                </article>
                <article class="card metric">
                    <p>Idade média</p>
                    <h2 id="idadeMedia">-</h2>
                    <small>Considerando registros com data de nascimento</small>
                </article>
            </section>

            <section class="grid cards-secundarios">
                <article class="card">
                    <div class="card-header">
                        <h3>Auditores por cargo</h3>
                    </div>
                    <div class="mini-grid">
                        <div>
                            <span>AFTE</span>
                            <strong id="qtdAFTE">0</strong>
                            <small>Auditor Fiscal Tributário Estabelecimento</small>
                        </div>
                        <div>
                            <span>AFTME</span>
                            <strong id="qtdAFTME">0</strong>
                            <small>Auditor Fiscal Tributário Mercadoria em Trânsito</small>
                        </div>
                    </div>
                </article>

                <article class="card">
                    <div class="card-header">
                        <h3>Auditores por sexo</h3>
                    </div>
                    <div class="mini-grid">
                        <div><span>Homens</span><strong id="qtdAuditoresHomens">0</strong></div>
                        <div><span>Mulheres</span><strong id="qtdAuditoresMulheres">0</strong></div>
                    </div>
                </article>

                <article class="card">
                    <div class="card-header">
                        <h3>Aposentadorias esperadas</h3>
                    </div>
                    <div class="mini-grid">
                        <div><span>Auditores 60+</span><strong id="aposAuditores">0</strong></div>
                        <div><span>Técnicos 60+</span><strong id="aposTecnicos">0</strong></div>
                    </div>
                </article>

                <article class="card">
                    <div class="card-header">
                        <h3>Auditores em gestão</h3>
                    </div>
                    <div class="mini-grid three">
                        <div><span>Total</span><strong id="gestaoTotal">0</strong></div>
                        <div><span>Homens</span><strong id="gestaoHomens">0</strong></div>
                        <div><span>Mulheres</span><strong id="gestaoMulheres">0</strong></div>
                    </div>
                </article>
            </section>

            <section class="grid charts-grid">
                <article class="card chart-card">
                    <h3>Grupo ocupacional</h3>
                    <canvas id="chartGrupos"></canvas>
                </article>
                <article class="card chart-card">
                    <h3>AFTE x AFTME</h3>
                    <canvas id="chartCargos"></canvas>
                </article>
                <article class="card chart-card wide">
                    <h3>Distribuição dos auditores por classe e nível</h3>
                    <canvas id="chartClasseNivel"></canvas>
                </article>
            </section>

            <section class="grid cards-secundarios">
                <article class="card">
                    <h3>Licença médica</h3>
                    <div class="mini-grid three">
                        <div><span>Servidores com licença</span><strong id="licencaServidores">0</strong></div>
                        <div><span>Total de dias</span><strong id="licencaDias">0</strong></div>
                        <div><span>Registros com CID-F</span><strong id="licencaCidF">0</strong></div>
                    </div>
                    <p class="helper">CID-F é exibido publicamente apenas como total consolidado.</p>
                </article>
            </section>

            <section id="secaoAdminLicencas" class="card table-card hidden">
                <div class="card-header between">
                    <div>
                        <h3>Detalhamento administrativo de licenças</h3>
                        <p class="helper">Área restrita. Contém nome, matrícula e CID.</p>
                    </div>
                </div>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Matrícula</th>
                                <th>Nome</th>
                                <th>Grupo</th>
                                <th>Cargo</th>
                                <th>Sexo</th>
                                <th>Idade</th>
                                <th>Dias</th>
                                <th>CID</th>
                                <th>CID-F?</th>
                            </tr>
                        </thead>
                        <tbody id="tabelaLicencas"></tbody>
                    </table>
                </div>
            </section>
        </main>
    </div>

    <div id="modalLogin" class="modal hidden">
        <div class="modal-card">
            <button id="btnFecharModal" class="modal-close" aria-label="Fechar">×</button>
            <h2>Acesso administrativo</h2>
            <p>Entre para visualizar dados sensíveis e exportar CSV.</p>
            <form id="formLogin">
                <label>
                    Usuário
                    <input type="text" name="usuario" autocomplete="username" required>
                </label>
                <label>
                    Senha
                    <input type="password" name="senha" autocomplete="current-password" required>
                </label>
                <button type="submit" class="btn primary full">Entrar</button>
                <p id="loginErro" class="erro"></p>
            </form>
        </div>
    </div>

    <script src="assets/js/dashboard.js"></script>
</body>
</html>
