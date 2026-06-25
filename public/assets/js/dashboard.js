const $ = (selector) => document.querySelector(selector);

const charts = {};
const estado = {
    modo: 'publico',
    usuario: null,
};

let servidoresAdminCache = [];

const labelsPadrao = {
    AUDITOR: 'Auditores',
    TECNICO: 'Técnicos Administrativos',
    EFETIVO: 'Efetivos',
    COMISSIONADO: 'Comissionados',
    TERCEIRIZADO: 'Terceirizados',
    ESTAGIARIO: 'Estagiários',
    AFTE: 'AFTE',
    AFTMT: 'AFTMT',
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
    const canvas = document.getElementById(idCanvas);
    if (!canvas) return;

    if (charts[idCanvas]) {
        charts[idCanvas].destroy();
    }

   const coresPorLabel = {
    'Auditores': '#8f1d2c',
    'Comissionados': '#c44555',
    'Efetivos': '#2f3a45',
    'Estagiários': '#71717a',
    'Não informado': '#9ca3af',
    'Técnicos Administrativos': '#1f7a64',
    'Terceirizados': '#d9a441'
};

const cores = labels.map((label) => coresPorLabel[label] || '#64748b');

    const pluginCentroEPorcentagem = {
        id: `pluginCentroEPorcentagem_${idCanvas}`,
        afterDatasetsDraw(chart) {
            const { ctx } = chart;
            const meta = chart.getDatasetMeta(0);
            const dataset = chart.data.datasets[0];

            const valoresVisiveis = dataset.data.map((valor, index) => {
                return chart.getDataVisibility(index) ? Number(valor || 0) : 0;
            });

            const totalVisivel = valoresVisiveis.reduce((soma, valor) => soma + valor, 0);

            ctx.save();

            if (meta.data.length > 0) {
                const centroX = meta.data[0].x;
                const centroY = meta.data[0].y;

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                ctx.fillStyle = '#8f1d2c';
                ctx.font = '700 20px Arial';
                ctx.fillText(formatarNumero(totalVisivel), centroX, centroY - 10);

                ctx.fillStyle = '#6b7280';
                ctx.font = '600 12px Arial';
                ctx.fillText('servidores ativos', centroX, centroY + 16);
            }

            ctx.font = '700 13px Arial';
            ctx.lineWidth = 1.5;

            meta.data.forEach((arc, index) => {
                if (!chart.getDataVisibility(index)) return;

                const valor = Number(dataset.data[index] || 0);
                if (!valor || totalVisivel <= 0) return;

                const percentualNumero = (valor / totalVisivel) * 100;
               if (percentualNumero < 0.3) return;

                const percentual = percentualNumero.toFixed(1).replace('.', ',');

                const angulo = (arc.startAngle + arc.endAngle) / 2;
                const raio = arc.outerRadius;
                const centroX = arc.x;
                const centroY = arc.y;

                const x1 = centroX + Math.cos(angulo) * (raio + 4);
                const y1 = centroY + Math.sin(angulo) * (raio + 4);

                const x2 = centroX + Math.cos(angulo) * (raio + 20);
                const y2 = centroY + Math.sin(angulo) * (raio + 20);

                const ladoDireito = x2 >= centroX;
                const x3 = ladoDireito ? x2 + 18 : x2 - 18;
                const y3 = y2;

                const cor = dataset.backgroundColor[index];

                ctx.strokeStyle = cor;
                ctx.fillStyle = cor;

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.lineTo(x3, y3);
                ctx.stroke();

                ctx.textAlign = ladoDireito ? 'left' : 'right';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${percentual}%`, ladoDireito ? x3 + 4 : x3 - 4, y3);
            });

            ctx.restore();
        }
    };

    charts[idCanvas] = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: valores,
                backgroundColor: cores,
                borderColor: '#ffffff',
                borderWidth: 7,
                hoverOffset: 8,
                spacing: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            layout: {
                padding: {
                    top: 20,
                    right: 85,
                    bottom: 20,
                    left: 85
                }
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
                        label: (context) => {
                            const chart = context.chart;
                            const dataset = context.dataset;

                            const valoresVisiveis = dataset.data.map((valor, index) => {
                                return chart.getDataVisibility(index) ? Number(valor || 0) : 0;
                            });

                            const totalVisivel = valoresVisiveis.reduce((soma, valor) => soma + valor, 0);
                            const valor = Number(context.raw || 0);
                            const percentual = totalVisivel > 0 ? ((valor / totalVisivel) * 100).toFixed(1) : '0.0';

                            return `${context.label}: ${formatarNumero(valor)} servidores (${percentual.replace('.', ',')}%)`;
                        }
                    }
                }
            }
        },
        plugins: [pluginCentroEPorcentagem]
    });

    let legenda = document.getElementById(`${idCanvas}Legenda`);

    if (!legenda) {
        legenda = document.createElement('div');
        legenda.id = `${idCanvas}Legenda`;
        legenda.className = 'legenda-doughnut-organizada';
        canvas.insertAdjacentElement('afterend', legenda);
    }

    function renderizarLegenda() {
        legenda.innerHTML = labels.map((label, index) => {
            const ativo = charts[idCanvas].getDataVisibility(index);

            return `
                <button type="button"
                        class="legenda-doughnut-item ${ativo ? '' : 'inativo'}"
                        data-index="${index}">
                    <span class="legenda-cor" style="background:${cores[index % cores.length]}"></span>
                    <span class="legenda-texto">${label}</span>
                </button>
            `;
        }).join('');

        legenda.querySelectorAll('.legenda-doughnut-item').forEach((item) => {
            item.addEventListener('click', () => {
                const index = Number(item.dataset.index);
                const chart = charts[idCanvas];

                chart.toggleDataVisibility(index);
                chart.update();
                renderizarLegenda();
            });
        });
    }

    renderizarLegenda();
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
function padronizarNomeFormacao(nome) {
    const texto = String(nome || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .trim();

    if (texto.includes('NAO INFORMADO')) return 'Não informado';
    if (texto.includes('POS GRADUACAO')) return 'Pós-graduação';
    if (texto.includes('ESPECIALIZACAO')) return 'Especialização';
    if (texto.includes('TECNICO DE NIVEL MEDIO')) return 'Técnico de nível médio';
    if (texto.includes('CURSO TECNICO')) return 'Curso técnico';
    if (texto.includes('NIVEL MEDIO COMPLETO')) return 'Nível médio completo';
    if (texto.includes('NIVEL FUNDAMENTAL INCOMPLETO')) return 'Fundamental incompleto';
    if (texto.includes('NIVEL FUNDAMENTAL COMPLETO')) return 'Fundamental completo';
    if (texto.includes('SUPERIOR INCOMPLETO')) return 'Superior incompleto';
    if (texto.includes('GRADUACAO')) return 'Graduação';
    if (texto.includes('MESTRADO')) return 'Mestrado';
    if (texto.includes('DOUTORADO')) return 'Doutorado';

    return nome;
}

function criarGraficoQualificacaoHorizontal(idCanvas, lista, tituloTooltip = 'Servidores') {
    const canvas = document.getElementById(idCanvas);
    if (!canvas) return;

    if (charts[idCanvas]) {
        charts[idCanvas].destroy();
    }

    const dados = (lista || [])
        .map((item) => ({
            formacao: item.formacao || 'Não informado',
            quantidade: Number(item.quantidade || 0)
        }))
        .filter((item) => item.quantidade > 0)
        .sort((a, b) => b.quantidade - a.quantidade);

    if (dados.length === 0) return;

    const labels = dados.map((item) => padronizarNomeFormacao(item.formacao));
    const valores = dados.map((item) => item.quantidade);

    // ajusta a altura do canvas conforme a quantidade de linhas
    const altura = Math.max(260, dados.length * 46);
    canvas.style.height = `${altura}px`;

    const pluginValorNaBarra = {
        id: `valorNaBarra_${idCanvas}`,
        afterDatasetsDraw(chart) {
            const { ctx } = chart;
            const meta = chart.getDatasetMeta(0);

            ctx.save();
            ctx.font = '700 12px Arial';
            ctx.fillStyle = '#2b2b2b';
            ctx.textBaseline = 'middle';

            meta.data.forEach((bar, index) => {
                const valor = valores[index];
                const x = bar.x + 8;
                const y = bar.y;

                ctx.textAlign = 'left';
                ctx.fillText(formatarNumero(valor), x, y);
            });

            ctx.restore();
        }
    };

    charts[idCanvas] = new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: tituloTooltip,
                data: valores,
                borderRadius: 8,
                borderSkipped: false,
                backgroundColor: [
                    '#8f1d2c',
                    '#b83242',
                    '#cf4658',
                    '#d9a441',
                    '#1f7a64',
                    '#475569',
                    '#7c3aed',
                    '#ea580c',
                    '#0f766e',
                    '#64748b',
                    '#be123c',
                    '#0369a1'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            layout: {
                padding: {
                    right: 45
                }
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
                        label: (context) => {
                            const total = valores.reduce((soma, v) => soma + v, 0);
                            const valor = Number(context.raw || 0);
                            const percentual = total > 0 ? ((valor / total) * 100).toFixed(1) : '0.0';
                            return `${context.label}: ${formatarNumero(valor)} (${percentual.replace('.', ',')}%)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.08)',
                        borderDash: [4, 4]
                    },
                    ticks: {
                        color: '#6b7280',
                        precision: 0
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#4b5563',
                        font: {
                            size: 12,
                            weight: '700'
                        },
                        callback: function(value) {
                            const label = this.getLabelForValue(value);
                            return label.length > 24 ? label.substring(0, 24) + '...' : label;
        }
    }
}
            }
        },
        plugins: [pluginValorNaBarra]
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
    $('#secaoAdminServidores').classList.toggle('hidden', !admin);
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

function normalizarTexto(valor) {
    return String(valor || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function preencherSelectFiltro(idSelect, linhas, campo, usarLabel = false) {
    const select = document.getElementById(idSelect);
    if (!select) return;

    const valorAtual = select.value;

    const valores = [...new Set(
        (linhas || [])
            .map((linha) => linha[campo])
            .filter((valor) => valor !== null && valor !== undefined && String(valor).trim() !== '')
    )].sort();

    select.innerHTML = `<option value="">Todos</option>`;

    valores.forEach((valor) => {
        const option = document.createElement('option');
        option.value = valor;
        option.textContent = usarLabel ? (labelsPadrao[valor] || valor) : valor;
        select.appendChild(option);
    });

    select.value = valorAtual;
}

function prepararFiltrosServidores(linhas) {
    preencherSelectFiltro('filtroGrupoServidor', linhas, 'grupo_ocupacional', true);
    preencherSelectFiltro('filtroSexoServidor', linhas, 'sexo', true);
    preencherSelectFiltro('filtroSituacaoServidor', linhas, 'tipo_situacao');
    preencherSelectFiltro('filtroVinculoServidor', linhas, 'vinculo_funcao');
}

function renderizarTabelaServidores(linhas) {
    const tbody = document.getElementById('tabelaServidoresAdmin');
    const contador = document.getElementById('qtdResultadoServidores');

    if (!tbody) return;

    tbody.innerHTML = '';

    if (contador) {
        contador.textContent = `${formatarNumero(linhas.length)} registros`;
    }

    if (!linhas || linhas.length === 0) {
        tbody.innerHTML = `<tr><td>Nenhum servidor encontrado.</td></tr>`;
        return;
    }

    linhas.forEach((linha, index) => {
        const idDetalhe = `detalheServidor_${index}`;

        const trResumo = document.createElement('tr');
        trResumo.className = 'linha-servidor-resumo';

        trResumo.innerHTML = `
            <td>${linha.matricula || '-'}</td>
            <td>
                <button type="button" class="btn-nome-servidor" data-target="${idDetalhe}">
                    ${linha.nome || '-'}
                </button>
            </td>
            <td>${labelsPadrao[linha.grupo_ocupacional] || linha.grupo_ocupacional || '-'}</td>
            <td>${linha.tipo_situacao || linha.situacao_servidor || '-'}</td>
        `;

        const trDetalhe = document.createElement('tr');
        trDetalhe.id = idDetalhe;
        trDetalhe.className = 'linha-servidor-detalhes hidden';

        trDetalhe.innerHTML = `
            <td colspan="4">
                <div class="card-detalhe-servidor">
                    <div>
                        <span>Matrícula</span>
                        <strong>${linha.matricula || '-'}</strong>
                    </div>

                    <div>
                        <span>Nome</span>
                        <strong>${linha.nome || '-'}</strong>
                    </div>

                    <div>
                        <span>Grupo</span>
                        <strong>${labelsPadrao[linha.grupo_ocupacional] || linha.grupo_ocupacional || '-'}</strong>
                    </div>

                    <div>
                        <span>Cargo fiscal</span>
                        <strong>${labelsPadrao[linha.cargo_fiscal] || linha.cargo_fiscal || '-'}</strong>
                    </div>

                    <div>
                        <span>Sexo</span>
                        <strong>${labelsPadrao[linha.sexo] || linha.sexo || '-'}</strong>
                    </div>

                    <div>
                        <span>Idade</span>
                        <strong>${linha.idade ?? '-'}</strong>
                    </div>

                    <div>
                        <span>Vínculo</span>
                        <strong>${linha.vinculo_funcao || '-'}</strong>
                    </div>

                    <div>
                        <span>Cargo</span>
                        <strong>${linha.cargo || '-'}</strong>
                    </div>

                    <div>
                        <span>Função</span>
                        <strong>${linha.funcao || '-'}</strong>
                    </div>

                    <div>
                        <span>Formação</span>
                        <strong>${linha.formacao || '-'}</strong>
                    </div>

                    <div>
                        <span>Efetivo?</span>
                        <strong>${Number(linha.efetivo) === 1 ? 'SIM' : 'NÃO'}</strong>
                    </div>

                    <div>
                        <span>Gestão?</span>
                        <strong>${Number(linha.em_gestao) === 1 ? 'SIM' : 'NÃO'}</strong>
                    </div>

                    <div>
                        <span>Situação</span>
                        <strong>${linha.tipo_situacao || linha.situacao_servidor || '-'}</strong>
                    </div>
                </div>
            </td>
        `;

        tbody.appendChild(trResumo);
        tbody.appendChild(trDetalhe);
    });

    tbody.querySelectorAll('.btn-nome-servidor').forEach((botao) => {
        botao.addEventListener('click', () => {
            const idDetalhe = botao.dataset.target;
            const detalhe = document.getElementById(idDetalhe);

            if (!detalhe) return;

            detalhe.classList.toggle('hidden');
            botao.classList.toggle('aberto');
        });
    });
}

function aplicarFiltrosServidores() {
    const busca = normalizarTexto(document.getElementById('filtroServidor')?.value);
    const grupo = document.getElementById('filtroGrupoServidor')?.value || '';
    const sexo = document.getElementById('filtroSexoServidor')?.value || '';
    const situacao = document.getElementById('filtroSituacaoServidor')?.value || '';
    const vinculo = document.getElementById('filtroVinculoServidor')?.value || '';

    let filtrados = servidoresAdminCache.filter((linha) => {
        const textoBusca = normalizarTexto([
            linha.matricula,
            linha.nome,
            linha.grupo_ocupacional,
            linha.cargo_fiscal,
            linha.cargo,
            linha.funcao,
            linha.vinculo_funcao,
            linha.formacao,
            linha.tipo_situacao
        ].join(' '));

        if (busca && !textoBusca.includes(busca)) return false;
        if (grupo && linha.grupo_ocupacional !== grupo) return false;
        if (sexo && linha.sexo !== sexo) return false;
        if (situacao && linha.tipo_situacao !== situacao) return false;
        if (vinculo && linha.vinculo_funcao !== vinculo) return false;

        return true;
    });

    renderizarTabelaServidores(filtrados);
}

function preencherTabelaServidoresAdmin(linhas) {
    servidoresAdminCache = linhas || [];
    prepararFiltrosServidores(servidoresAdminCache);
    aplicarFiltrosServidores();
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
    $('#qtdEfetivosNaoFiscais').textContent = formatarNumero(dados.total_efetivos_nao_fiscais || 0);
    $('#qtdComissionados').textContent = formatarNumero(valorPorChave(totalPorGrupo, 'grupo_ocupacional', 'COMISSIONADO'));
    $('#qtdTerceirizados').textContent = formatarNumero(valorPorChave(totalPorGrupo, 'grupo_ocupacional', 'TERCEIRIZADO'));
    $('#qtdEstagiarios').textContent = formatarNumero(valorPorChave(totalPorGrupo, 'grupo_ocupacional', 'ESTAGIARIO'));
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
    $('#qtdAFTMT').textContent = formatarNumero(valorPorChave(auditoresPorCargo, 'cargo_fiscal', 'AFTMT'));

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

    criarGraficoQualificacaoHorizontal('chartQualificacaoForca', qualificacaoForca, 'Servidores');
    
criarGraficoQualificacaoHorizontal('chartQualificacaoFiscais', qualificacaoFiscais, 'Fiscais');

    preencherTabelaLicencas(dados.detalhes_licencas_admin || []);
    preencherTabelaServidoresAdmin(dados.servidores_admin || []);
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

[
    '#filtroServidor',
    '#filtroGrupoServidor',
    '#filtroSexoServidor',
    '#filtroSituacaoServidor',
    '#filtroVinculoServidor'
].forEach((selector) => {
    const elemento = document.querySelector(selector);

    if (!elemento) return;

    elemento.addEventListener('input', aplicarFiltrosServidores);
    elemento.addEventListener('change', aplicarFiltrosServidores);
});

const btnLimparFiltrosServidores = document.getElementById('btnLimparFiltrosServidores');

if (btnLimparFiltrosServidores) {
    btnLimparFiltrosServidores.addEventListener('click', () => {
        document.getElementById('filtroServidor').value = '';
        document.getElementById('filtroGrupoServidor').value = '';
        document.getElementById('filtroSexoServidor').value = '';
        document.getElementById('filtroSituacaoServidor').value = '';
        document.getElementById('filtroVinculoServidor').value = '';

        aplicarFiltrosServidores();
    });
}

carregarDashboard();
