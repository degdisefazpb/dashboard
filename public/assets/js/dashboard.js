const $ = (selector) => document.querySelector(selector);

const charts = {};
const estado = {
    modo: 'publico',
    usuario: null,
};

const labelsPadrao = {
    AUDITOR: 'Auditores',
    TECNICO: 'Técnicos',
    COMISSIONADO: 'Comissionados',
    TERCEIRIZADO: 'Terceirizados',
    AFTE: 'AFTE',
    AFTME: 'AFTME',
    NAO_INFORMADO: 'Não informado',
    M: 'Homens',
    F: 'Mulheres',
    NA: 'Não informado',
};

function formatarNumero(valor) {
    const numero = Number(valor || 0);
    return numero.toLocaleString('pt-BR');
}

function valorPorChave(lista, campoChave, chave, campoValor = 'quantidade') {
    const item = (lista || []).find((linha) => linha[campoChave] === chave);
    return Number(item?.[campoValor] || 0);
}

function somaQuantidades(lista) {
    return (lista || []).reduce((total, item) => total + Number(item.quantidade || 0), 0);
}

function criarOuAtualizarChart(idCanvas, tipo, labels, valores, opcoesExtras = {}) {
    const ctx = document.getElementById(idCanvas);
    if (!ctx) return;

    if (charts[idCanvas]) {
        charts[idCanvas].destroy();
    }

    charts[idCanvas] = new Chart(ctx, {
        type: tipo,
        data: {
            labels,
            datasets: [{
                label: opcoesExtras.label || 'Quantidade',
                data: valores,
                borderWidth: 1,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: tipo === 'pie' || tipo === 'doughnut',
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.label || context.dataset.label}: ${formatarNumero(context.raw)}`,
                    },
                },
            },
            scales: tipo === 'bar' ? {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 },
                },
            } : undefined,
            ...opcoesExtras.options,
        },
    });
}

function atualizarModo(modo, usuario) {
    estado.modo = modo;
    estado.usuario = usuario;

    const admin = modo === 'admin';
    $('#statusModo').textContent = admin ? `Admin: ${usuario?.nome || usuario?.usuario || ''}` : 'Modo público';
    $('#statusModo').className = `badge ${admin ? 'admin' : 'publico'}`;

    $('#btnLogin').classList.toggle('hidden', admin);
    $('#btnExportar').classList.toggle('hidden', !admin);
    $('#btnLogout').classList.toggle('hidden', !admin);
    $('#secaoAdminLicencas').classList.toggle('hidden', !admin);
}

function preencherTabelaLicencas(linhas) {
    const tbody = $('#tabelaLicencas');
    tbody.innerHTML = '';

    if (!linhas || linhas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9">Nenhum registro de licença encontrado.</td></tr>`;
        return;
    }

    linhas.forEach((linha) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${linha.matricula || '-'}</td>
            <td>${linha.nome || '-'}</td>
            <td>${labelsPadrao[linha.grupo_ocupacional] || linha.grupo_ocupacional || '-'}</td>
            <td>${labelsPadrao[linha.cargo_fiscal] || linha.cargo_fiscal || '-'}</td>
            <td>${labelsPadrao[linha.sexo] || linha.sexo || '-'}</td>
            <td>${linha.idade ?? '-'}</td>
            <td>${formatarNumero(linha.dias_licenca_medica)}</td>
            <td>${linha.cid || '-'}</td>
            <td>${Number(linha.cid_f) === 1 ? 'SIM' : 'NÃO'}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderizarDashboard(payload) {
    const dados = payload.dados;
    atualizarModo(payload.modo, payload.usuario);

    const totalPorGrupo = dados.total_por_grupo || [];
    const auditoresPorCargo = dados.auditores_por_cargo || [];
    const sexoAuditores = dados.sexo_auditores || [];
    const aposentadorias = dados.aposentadorias_esperadas || [];
    const gestao = dados.auditores_gestao || [];
    const classeNivel = dados.distribuicao_classe_nivel || [];
    const licencas = dados.licencas || {};

    $('#qtdAuditores').textContent = formatarNumero(valorPorChave(totalPorGrupo, 'grupo_ocupacional', 'AUDITOR'));
    $('#qtdTecnicos').textContent = formatarNumero(valorPorChave(totalPorGrupo, 'grupo_ocupacional', 'TECNICO'));
    $('#qtdComissionados').textContent = formatarNumero(valorPorChave(totalPorGrupo, 'grupo_ocupacional', 'COMISSIONADO'));
    $('#qtdTerceirizados').textContent = formatarNumero(valorPorChave(totalPorGrupo, 'grupo_ocupacional', 'TERCEIRIZADO'));
    $('#idadeMedia').textContent = dados.idade_media_geral ? `${String(dados.idade_media_geral).replace('.', ',')} anos` : '-';

    $('#qtdAFTE').textContent = formatarNumero(valorPorChave(auditoresPorCargo, 'cargo_fiscal', 'AFTE'));
    $('#qtdAFTME').textContent = formatarNumero(valorPorChave(auditoresPorCargo, 'cargo_fiscal', 'AFTME'));

    $('#qtdAuditoresHomens').textContent = formatarNumero(valorPorChave(sexoAuditores, 'sexo', 'M'));
    $('#qtdAuditoresMulheres').textContent = formatarNumero(valorPorChave(sexoAuditores, 'sexo', 'F'));

    $('#aposAuditores').textContent = formatarNumero(valorPorChave(aposentadorias, 'grupo_ocupacional', 'AUDITOR'));
    $('#aposTecnicos').textContent = formatarNumero(valorPorChave(aposentadorias, 'grupo_ocupacional', 'TECNICO'));

    const gestaoHomens = valorPorChave(gestao, 'sexo', 'M');
    const gestaoMulheres = valorPorChave(gestao, 'sexo', 'F');
    $('#gestaoTotal').textContent = formatarNumero(somaQuantidades(gestao));
    $('#gestaoHomens').textContent = formatarNumero(gestaoHomens);
    $('#gestaoMulheres').textContent = formatarNumero(gestaoMulheres);

    $('#licencaServidores').textContent = formatarNumero(licencas.servidores_com_licenca);
    $('#licencaCidF').textContent = formatarNumero(licencas.servidores_com_cid_f);

    criarOuAtualizarChart(
        'chartGrupos',
        'doughnut',
        totalPorGrupo.map((x) => labelsPadrao[x.grupo_ocupacional] || x.grupo_ocupacional),
        totalPorGrupo.map((x) => Number(x.quantidade || 0)),
        { label: 'Servidores' }
    );

    criarOuAtualizarChart(
        'chartCargos',
        'bar',
        auditoresPorCargo.map((x) => labelsPadrao[x.cargo_fiscal] || x.cargo_fiscal),
        auditoresPorCargo.map((x) => Number(x.quantidade || 0)),
        { label: 'Auditores' }
    );

    criarOuAtualizarChart(
        'chartClasseNivel',
        'bar',
        classeNivel.map((x) => `${x.classe} / ${x.nivel}`),
        classeNivel.map((x) => Number(x.quantidade || 0)),
        {
            label: 'Auditores',
            options: {
                plugins: { legend: { display: false } },
            },
        }
    );

    preencherTabelaLicencas(dados.detalhes_licencas_admin || []);
}

async function carregarDashboard() {
    try {
        const resposta = await fetch('api/metrics.php', { credentials: 'same-origin' });
        const payload = await resposta.json();
        if (payload.erro) throw new Error(payload.mensagem || 'Erro ao carregar dados.');
        renderizarDashboard(payload);
    } catch (error) {
        alert(`Não foi possível carregar o dashboard: ${error.message}`);
    }
}

function abrirModal() {
    $('#loginErro').textContent = '';
    $('#modalLogin').classList.remove('hidden');
}

function fecharModal() {
    $('#modalLogin').classList.add('hidden');
}

async function fazerLogin(event) {
    event.preventDefault();
    $('#loginErro').textContent = '';

    const form = new FormData(event.target);
    const usuario = form.get('usuario');
    const senha = form.get('senha');

    try {
        const resposta = await fetch('api/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ usuario, senha }),
        });
        const payload = await resposta.json();
        if (!resposta.ok || payload.erro) throw new Error(payload.mensagem || 'Falha no login.');

        fecharModal();
        event.target.reset();
        await carregarDashboard();
    } catch (error) {
        $('#loginErro').textContent = error.message;
    }
}

async function sair() {
    await fetch('api/logout.php', { credentials: 'same-origin' });
    await carregarDashboard();
}

$('#btnLogin').addEventListener('click', abrirModal);
$('#btnFecharModal').addEventListener('click', fecharModal);
$('#modalLogin').addEventListener('click', (event) => {
    if (event.target.id === 'modalLogin') fecharModal();
});
$('#formLogin').addEventListener('submit', fazerLogin);
$('#btnLogout').addEventListener('click', sair);

carregarDashboard();
