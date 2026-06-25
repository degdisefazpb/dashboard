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
            <div class="brand logo-topo">
    <div class="logo-box">
            <img src="assets/img/logo.png" alt="Logo" onerror="this.style.display='none'; this.parentElement.classList.add('sem-logo');">
            <span>LOGO</span>
        </div>
</div>

            <div class="actions">
                <span id="statusModo" class="badge publico">Modo público</span>
                <button id="btnLogin" class="btn primary">Login administrativo</button>
                <a id="btnExportar" class="btn success hidden" href="api/export.php">Exportar CSV</a>
                <button id="btnLogout" class="btn ghost hidden">Sair</button>
            </div>
        </header>

        <main>
            <section class="secao-dashboard">
                <div class="secao-header">
            <h2>Força de Trabalho SEFAZ - PB</h2>
        </div>

        <section class="grid cards-principais">
            <article class="card metric">
                <p>Auditores</p>
                <h2 id="qtdAuditores">0</h2>
                <small>Total ativo</small>
            </article>

            <article class="card metric">
                <p>Técnicos Administrativos</p>
                <h2 id="qtdTecnicos">0</h2>
                <small>Total ativo</small>
            </article>
            
            <article class="card metric">
                <p>Efetivos</p>
                <h2 id="qtdEfetivosNaoFiscais">0</h2>
                <small>Exceto auditores e técnicos</small>
            </article>

            <article class="card metric">
                <p>Comissionados</p>
                <h2 id="qtdComissionados">0</h2>
                <small>Total ativo</small>
            </article>

            <article class="card metric">
                <p>Terceirizados</p>
                <h2 id="qtdTerceirizados">0</h2>
                <small>Total ativo</small>
            </article>
            <article class="card metric">
                <p>Estagiários</p>
                <h2 id="qtdEstagiarios">0</h2>
                <small>Total ativo</small>
            </article>
            <article class="card metric">
                <p>Idade média geral</p>
                <h2 id="idadeMedia">-</h2>
                <small>Servidores ativos</small>
            </article>
        </section>

        <section class="grid bloco-forca">
            <article class="card chart-card destaque-grafico">
                <h3>Distribuição por grupo ocupacional</h3>
                <canvas id="chartGrupos"></canvas>
            </article>

            <article class="card">
                <div class="card-header">
                    <h3>Comissionados</h3>
                </div>
                <div class="mini-grid">
                    <div>
                        <span>Homens</span>
                        <strong id="qtdComissionadosHomens">0</strong>
                    </div>
                    <div>
                        <span>Mulheres</span>
                        <strong id="qtdComissionadosMulheres">0</strong>
                    </div>
                </div>
            </article>

            <article class="card">
                <div class="card-header">
                    <h3>Sexo ♂️/♀️</h3>
                </div>
                <div class="mini-grid">
                    <div>
                        <span>Homens</span>
                        <strong id="sexoGeralHomens">0</strong>
                    </div>
                    <div>
                        <span>Mulheres</span>
                        <strong id="sexoGeralMulheres">0</strong>
                    </div>
                </div>
            </article>
        </section>

        <section class="grid charts-grid">
            <article class="card chart-card wide doughnut-qualificacao-card">
            <h3>Qualificação da Força de Trabalho SEFAZ - PB</h3>
            <canvas id="chartQualificacaoForca"></canvas>
            </article>
        </section>

    </section>

    <section class="secao-dashboard">
        <div class="secao-header">
            <h2>Grupo Ocupacional Servidor Fiscal Tributário</h2>
        </div>

        <section class="grid cards-secundarios">
            <article class="card">
                <div class="card-header">
                  <h3>AFTE x AFTMT</h3>
                </div>
                <div class="mini-grid three">
                    <div>
                        <span>Total Auditores</span>
                        <strong id="qtdAuditoresBloco">0</strong>
                    </div>
                    <div>
                        <span>AFTE</span>
                        <strong id="qtdAFTE">0</strong>
                        
                    </div>
                    <div>
                        <span>AFTMT</span>
                        <strong id="qtdAFTMT">0</strong>
                        
                    </div>
                </div>
            </article>

            <article class="card">
                <div class="card-header">
                    <h3>Auditores por sexo</h3>
                </div>
                <div class="mini-grid">
                    <div>
                        <span>Homens</span>
                        <strong id="qtdAuditoresHomens">0</strong>
                    </div>
                    <div>
                        <span>Mulheres</span>
                        <strong id="qtdAuditoresMulheres">0</strong>
                    </div>
                </div>
            </article>

            <article class="card">
                <div class="card-header">
                    <h3>Média de idade dos auditores</h3>
                </div>
                <div class="mini-grid">
                    <div>
                        <span>Idade média</span>
                        <strong id="idadeMediaAuditores">-</strong>
                    </div>
                </div>
            </article>

            <article class="card">
                <div class="card-header">
                    <h3>Auditores em cargo de gestão</h3>
                </div>
                <div class="mini-grid three">
                    <div>
                        <span>Total</span>
                        <strong id="gestaoTotal">0</strong>
                    </div>
                    <div>
                        <span>Homens</span>
                        <strong id="gestaoHomens">0</strong>
                    </div>
                    <div>
                        <span>Mulheres</span>
                        <strong id="gestaoMulheres">0</strong>
                    </div>
                </div>
            </article>

            <article class="card">
                <div class="card-header">
                    <h3>Auditores 60+</h3>
                </div>
                <div class="mini-grid">
                    <div>
                        <span>Quantidade</span>
                        <strong id="auditores60Qtd">0</strong>
                        <small>Aposentadoria esperada</small>
                    </div>
                    <div>
                        <span>Percentual etário</span>
                        <strong id="auditores60Percentual">0%</strong>
                        <small>Sobre o total de auditores</small>
                    </div>
                </div>
            </article>
        </section>

        <section class="grid charts-grid">
   

    <article class="card chart-card wide">
        <h3>Distribuição dos auditores por classe e nível</h3>
        <canvas id="chartClasseNivel"></canvas>
    </article>

    <article class="card chart-card wide doughnut-qualificacao-card">
            <h3>Qualificação dos Fiscais Tributários</h3>
            <canvas id="chartQualificacaoFiscais"></canvas>
    </article>
    </section>

    </section>

    <section class="grid cards-secundarios">
        <article class="card">
            <h3>Licença médica vigente</h3>
            <div class="mini-grid">
                <div>
                    <span>Servidores com licença vigente</span>
                    <strong id="licencaServidores">0</strong>
                </div>
                <div>
                    <span>Registros com CID-F</span>
                    <strong id="licencaCidF">0</strong>
                </div>
            </div>
            <p class="helper">CID-F é exibido publicamente apenas como total consolidado.</p>
        </article>
    </section>

    <section id="secaoAdminLicencas" class="card table-card hidden">
        <div class="card-header between">
            <div>
                <h3>Detalhamento administrativo de licenças</h3>
                <p class="helper">Área restrita. Contém nome, matrícula, CID e dias restantes.</p>
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
                        <th>Dias restantes</th>
                        <th>CID</th>
                        <th>CID-F?</th>
                    </tr>
                </thead>
                <tbody id="tabelaLicencas"></tbody>
            </table>
        </div>
    </section>

<section id="secaoAdminServidores" class="card table-card hidden">
    <div class="card-header between">
        <div>
            <h3>Todos os servidores</h3>
            <p class="helper">Área restrita. Lista completa com filtros administrativos.</p>
        </div>
        <strong id="qtdResultadoServidores" class="contador-admin">0 registros</strong>
    </div>

    <div class="filtros-admin">
        <label>
            Buscar
            <input type="text" id="filtroServidor" placeholder="Nome, matrícula, cargo ou função">
        </label>

        <label>
            Grupo
            <select id="filtroGrupoServidor">
                <option value="">Todos</option>
            </select>
        </label>

        <label>
            Sexo
            <select id="filtroSexoServidor">
                <option value="">Todos</option>
            </select>
        </label>

        <label>
            Situação
            <select id="filtroSituacaoServidor">
                <option value="">Todas</option>
            </select>
        </label>

        <label>
            Vínculo
            <select id="filtroVinculoServidor">
                <option value="">Todos</option>
            </select>
        </label>

        <button type="button" id="btnLimparFiltrosServidores" class="btn ghost">
            Limpar filtros
        </button>
    </div>

    <div class="table-wrap">
        <table>
            <thead>
                <tr>
                    <th>Matrícula</th>
                    <th>Nome</th>
                    <th>Grupo</th>
                    <th>Cargo fiscal</th>
                    <th>Sexo</th>
                    <th>Idade</th>
                    <th>Vínculo</th>
                    <th>Cargo</th>
                    <th>Função</th>
                    <th>Formação</th>
                    <th>Efetivo?</th>
                    <th>Gestão?</th>
                    <th>Situação</th>
                </tr>
            </thead>
            <tbody id="tabelaServidoresAdmin"></tbody>
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
