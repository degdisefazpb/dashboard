const $ = (selector) => document.querySelector(selector);

const charts = {};
const estado = {
    modo: 'publico',
    usuario: null,
};

const labelsPadrao = {
    AUDITOR: 'Auditores',
    TECNICO: 'Técnicos Administrativos',
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

function criarDoughnutModerno(idCanvas, labels, valores) {
    const ctx = document.getElementById(idCanvas);
    if (!ctx) return;

    if (charts[idCanvas]) {
        charts[idCanvas].destroy();
    }

    const total = valores.reduce((soma, valor) => soma + Number(valor || 0), 0);

    const pluginTextoCentro = {
        id: 'textoCentro',
        afterDraw(chart) {
            const { ctx, chartArea } = chart;
            if (!chartArea) return;

            const centroX = (chartArea.left + chartArea.right) / 2;
            const centroY = (chartArea.top + chartArea.bottom) / 2;

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.font = '700 30px Arial';
            ctx.fillStyle = '#8f1d2c';
            ctx.fillText(formatarNumero(total), centroX, centroY - 8);

            ctx.font = '600 13px Arial';
            ctx.fillStyle = '#71717a';
            ctx.fillText('servidores ativos', centroX, centroY + 22);

            ctx.restore();
        }
    };

    charts[idCanvas] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: valores,
                backgroundColor: [
                    '#8f1d2c',
                    '#b73a4a',
                    '#2f3a45',
                    '#6b7280',
                    '#d9a441',
                    '#1f7a64'
                ],
                borderColor: '#ffffff',
                borderWidth: 4,
                hoverOffset: 14,
                spacing: 3,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '68%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 18,
                        font: {
                            size: 13,
                            weight: '600'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: '#171717',
                    padding: 12,
                    cornerRadius: 10,
                    callbacks: {
                        label: (context) => {
                            const valor = Number(context.raw || 0);
                            const percentual = total > 0 ? ((valor / total) * 100).toFixed(1) : 0;
                            return `${context.label}: ${formatarNumero(valor)} (${String(percentual).replace('.', ',')}%)`;
                        }
                    }
                }
            }
        },
        plugins: [pluginTextoCentro]
    });
}
function nomeCurtoFormacao(nome) {
    const texto = String(nome || '').toUpperCase();

    if (texto.includes('NÃO INFORMADO') || texto.includes('NAO INFORMADO')) return 'Não informado';
    if (texto.includes('GRADUACAO')) return 'Graduação';
    if (texto.includes('ESPECIALIZACAO')) return 'Especialização';
    if (texto.includes('NIVEL MEDIO')) return 'Nível médio';
    if (texto.includes('CURSO TECNICO')) return 'Curso técnico';
    if (texto.includes('TECNICO DE NIVEL MEDIO')) return 'Téc. nível médio';
    if (texto.includes('MESTRADO')) return 'Mestrado';
    if (texto.includes('DOUTORADO')) return 'Doutorado';
    if (texto.includes('SUPERIOR INCOMPLETO')) return 'Superior inc.';
    if (texto.includes('FUNDAMENTAL COMPLETO')) return 'Fundamental';
    if (texto.includes('FUNDAMENTAL INCOMPLETO')) return 'Fund. inc.';
    if (texto.includes('POS GRADUACAO')) return 'Pós-graduação';
    if (texto.includes('OUTROS')) return 'Outros';

    return nome;
}

function nomeCurtoFormacao(nome) {
    const texto = String(nome || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase();

    if (texto.includes('NAO INFORMADO')) return 'Não informado';
    if (texto.includes('TECNICO DE NIVEL MEDIO')) return 'Téc. nível médio';
    if (texto.includes('NIVEL MEDIO')) return 'Nível médio';
    if (texto.includes('CURSO TECNICO')) return 'Curso técnico';
    if (texto.includes('GRADUACAO') && !texto.includes('POS')) return 'Graduação';
    if (texto.includes('ESPECIALIZACAO')) return 'Especialização';
    if (texto.includes('MESTRADO')) return 'Mestrado';
    if (texto.includes('DOUTORADO')) return 'Doutorado';
    if (texto.includes('SUPERIOR INCOMPLETO')) return 'Superior inc.';
    if (texto.includes('FUNDAMENTAL INCOMPLETO')) return 'Fund. inc.';
    if (texto.includes('FUNDAMENTAL COMPLETO')) return 'Fundamental';
    if (texto.includes('POS GRADUACAO')) return 'Pós-grad.';
    if (texto.includes('OUTROS')) return 'Outros';

    return nome;
}

function criarTreemapQualificacao(idCanvas, lista, tituloTooltip = 'Quantidade') {
    const ctx = document.getElementById(idCanvas);
    if (!ctx) return;

    if (!lista || lista.length === 0) return;

    if (charts[idCanvas]) {
        charts[idCanvas].destroy();
    }

    const dadosReais = lista
        .map((item) => ({
            formacao: item.formacao || 'Não informado',
            quantidade: Number(item.quantidade || 0)
        }))
        .filter((item) => item.quantidade > 0)
        .sort((a, b) => b.quantidade - a.quantidade);

    const totalOriginal = dadosReais.reduce((soma, item) => soma + item.quantidade, 0);

    /*
        Aqui está o ajuste principal:
        O treemap usa valor_visual para desenhar os blocos.
        A quantidade real continua aparecendo nos rótulos e no tooltip.
    */
    const maiorQuantidade = Math.max(...dadosReais.map((item) => item.quantidade));
    const minimoVisual = Math.sqrt(maiorQuantidade) * 0.18;

    const dados = dadosReais.map((item) => ({
        ...item,
        valor_visual: Math.max(Math.sqrt(item.quantidade), minimoVisual)
    }));

    const cores = [
        '#7f1d2d',
        '#982436',
        '#b83242',
        '#cf4658',
        '#dc6170',
        '#e48893',
        '#334155',
        '#475569',
        '#64748b',
        '#7f1d2d',
        '#982436',
        '#b83242'
    ];

    charts[idCanvas] = new Chart(ctx, {
        type: 'treemap',
        data: {
            datasets: [{
                label: tituloTooltip,
                tree: dados,
                key: 'valor_visual',
                groups: ['formacao'],
                spacing: 6,
                borderWidth: 4,
                borderColor: '#ffffff',
                borderRadius: 14,

                backgroundColor(context) {
                    if (context.type !== 'data') return 'transparent';
                    return cores[context.dataIndex % cores.length];
                },

                hoverBackgroundColor(context) {
                    if (context.type !== 'data') return 'transparent';
                    return '#641421';
                },

                labels: {
                    display: true,
                    color: '#ffffff',
                    align: 'center',
                    position: 'middle',
                    font: {
                        size: 12,
                        weight: 'bold'
                    },
                    formatter(context) {
                        const nomeOriginal = context.raw?.g || '';
                        const itemReal = dadosReais.find((item) => item.formacao === nomeOriginal);

                        if (!itemReal) return '';

                        const nomeCurto = nomeCurtoFormacao(nomeOriginal);
                        const valor = itemReal.quantidade;
                        const percentualNumero = totalOriginal > 0 ? (valor / totalOriginal) * 100 : 0;
                        const percentual = percentualNumero.toFixed(1).replace('.', ',');

                        if (percentualNumero >= 8) {
                            return [
                                nomeCurto,
                                formatarNumero(valor),
                                `${percentual}%`
                            ];
                        }

                        if (percentualNumero >= 1) {
                            return [
                                nomeCurto,
                                formatarNumero(valor)
                            ];
                        }

                        return [
                            nomeCurto
                        ];
                    }
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: 0
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#171717',
                    padding: 12,
                    cornerRadius: 10,
                    callbacks: {
                        title(items) {
                            return items[0]?.raw?.g || '';
                        },
                        label(item) {
                            const nomeOriginal = item.raw?.g || '';
                            const itemReal = dadosReais.find((linha) => linha.formacao === nomeOriginal);

                            if (!itemReal) return '';

                            const valor = itemReal.quantidade;
                            const percentual = totalOriginal > 0 ? ((valor / totalOriginal) * 100).toFixed(1) : '0.0';

                            return `${tituloTooltip}: ${formatarNumero(valor)} (${percentual.replace('.', ',')}%)`;
                        }
                    }
                }
            }
        }
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
    const sexoGeral = dados.sexo_geral || [];
    const sexoComissionados = dados.sexo_comissionados || [];
    const auditores60 = dados.auditores_60 || {};
    const aposentadorias = dados.aposentadorias_esperadas || [];
    const gestao = dados.auditores_gestao || [];
    const classeNivel = dados.distribuicao_classe_nivel || [];
    const qualificacaoForca = dados.qualificacao_forca_trabalho || [];
    const qualificacaoFiscais = dados.qualificacao_fiscais || [];
    const licencas = dados.licencas || {};

    $('#qtdAuditores').textContent = formatarNumero(valorPorChave(totalPorGrupo, 'grupo_ocupacional', 'AUDITOR'));
    $('#qtdTecnicos').textContent = formatarNumero(valorPorChave(totalPorGrupo, 'grupo_ocupacional', 'TECNICO'));
    $('#qtdComissionados').textContent = formatarNumero(valorPorChave(totalPorGrupo, 'grupo_ocupacional', 'COMISSIONADO'));
    $('#qtdTerceirizados').textContent = formatarNumero(valorPorChave(totalPorGrupo, 'grupo_ocupacional', 'TERCEIRIZADO'));
    $('#idadeMedia').textContent = dados.idade_media_geral ? `${String(dados.idade_media_geral).replace('.', ',')} anos` : '-';

    $('#qtdAuditoresBloco').textContent = formatarNumero(valorPorChave(totalPorGrupo, 'grupo_ocupacional', 'AUDITOR'));

    $('#sexoGeralHomens').textContent = formatarNumero(valorPorChave(sexoGeral, 'sexo', 'M'));
    $('#sexoGeralMulheres').textContent = formatarNumero(valorPorChave(sexoGeral, 'sexo', 'F'));

    $('#qtdComissionadosHomens').textContent = formatarNumero(valorPorChave(sexoComissionados, 'sexo', 'M'));
    $('#qtdComissionadosMulheres').textContent = formatarNumero(valorPorChave(sexoComissionados, 'sexo', 'F'));

    $('#idadeMediaAuditores').textContent = dados.idade_media_auditores
        ? `${String(dados.idade_media_auditores).replace('.', ',')} anos`
        : '-';

    $('#auditores60Qtd').textContent = formatarNumero(auditores60.auditores_60);
    $('#auditores60Percentual').textContent = `${String(auditores60.percentual_60 || 0).replace('.', ',')}%`;

    $('#qtdAFTE').textContent = formatarNumero(valorPorChave(auditoresPorCargo, 'cargo_fiscal', 'AFTE'));
    $('#qtdAFTME').textContent = formatarNumero(valorPorChave(auditoresPorCargo, 'cargo_fiscal', 'AFTME'));

    $('#qtdAuditoresHomens').textContent = formatarNumero(valorPorChave(sexoAuditores, 'sexo', 'M'));
    $('#qtdAuditoresMulheres').textContent = formatarNumero(valorPorChave(sexoAuditores, 'sexo', 'F'));

    //$('#aposAuditores').textContent = formatarNumero(valorPorChave(aposentadorias, 'grupo_ocupacional', 'AUDITOR'));
    //$('#aposTecnicos').textContent = formatarNumero(valorPorChave(aposentadorias, 'grupo_ocupacional', 'TECNICO'));

    const gestaoHomens = valorPorChave(gestao, 'sexo', 'M');
    const gestaoMulheres = valorPorChave(gestao, 'sexo', 'F');
    $('#gestaoTotal').textContent = formatarNumero(somaQuantidades(gestao));
    $('#gestaoHomens').textContent = formatarNumero(gestaoHomens);
    $('#gestaoMulheres').textContent = formatarNumero(gestaoMulheres);

    $('#licencaServidores').textContent = formatarNumero(licencas.servidores_com_licenca);
    $('#licencaCidF').textContent = formatarNumero(licencas.servidores_com_cid_f);

    criarDoughnutModerno(
    'chartGrupos',
    totalPorGrupo.map((x) => labelsPadrao[x.grupo_ocupacional] || x.grupo_ocupacional),
    totalPorGrupo.map((x) => Number(x.quantidade || 0))
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
    criarTreemapQualificacao('chartQualificacaoForca', qualificacaoForca, 'Servidores');
    criarTreemapQualificacao('chartQualificacaoFiscais', qualificacaoFiscais, 'Fiscais');
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
