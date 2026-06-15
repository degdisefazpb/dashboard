import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Users, Calendar, Building, Download, Lock, Unlock, LogOut } from 'lucide-react';
import logoGovernanca from './logo.jpeg';

// PALETA DE CORES EXPANDIDA
const CORES_GRAFICOS = ['#7b1f20', '#2b2b2b', '#9e2a2b', '#555555', '#c0392b', '#7f8c8d', '#d9534f', '#95a5a6'];
const COR_PRIMARIA = '#9e2a2b'; 
const COR_SECUNDARIA = '#2b2b2b'; 

export default function DashboardGerencial() {
  const [dadosPainel, setDadosPainel] = useState(null);
  const [erro, setErro] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dadosCompletos, setDadosCompletos] = useState([]);

  useEffect(() => {
    document.title = "Dashboard Governança - SEFAZ";
    
    fetch('http://localhost:3000/api/dashboard')
      .then(resposta => resposta.json())
      .then(dados => setDadosPainel(dados))
      .catch(erro => {
        console.error("Erro ao conectar com o backend:", erro);
        setErro(true);
      });
  }, []);

  const fazerLoginAdmin = async () => {
    const senhaDigitada = window.prompt("🔒 Área Restrita: Digite a senha de administrador:");
    if (!senhaDigitada) return;

    try {
      const resposta = await fetch('http://localhost:3000/api/exportar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha: senhaDigitada })
      });

      const resultado = await resposta.json();

      if (resultado.sucesso) {
        setIsAdmin(true);
        setDadosCompletos(resultado.dados);
        alert("✅ Acesso Liberado! Você agora está no perfil Administrador.");
      } else {
        alert("❌ " + resultado.mensagem);
      }
    } catch (error) {
      alert("❌ Erro ao tentar se comunicar com o servidor.");
    }
  };

  const sairAdmin = () => {
    setIsAdmin(false);
    setDadosCompletos([]); 
  };

  const baixarCSV = () => {
    const cabecalhos = [
      "Matrícula", "CPF", "Nome Completo", "Sexo", "Cargo", "Função", 
      "Situação", "Tipo de Regime", "Local de Exercício", "Qualificação", "Licença Médica"
    ];
    
    const linhas = dadosCompletos.map(d => [
      d.matricula, d.cpf, d.nome, d.sexo, d.cargo, d.funcao,
      d.situacao, d.tipoRegime, d.localExercicio, d.qualificacao, d.licencaMedica
    ]);

    const conteudoCSV = [
      cabecalhos.join(";"),
      ...linhas.map(linha => linha.join(";"))
    ].join("\n");

    const blob = new Blob(["\ufeff" + conteudoCSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "relatorio_governanca_sefaz.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (erro) return <div style={{ padding: '40px', textAlign: 'center', color: COR_PRIMARIA }}><h2>Erro de Conexão</h2><p>Verifique se o backend está rodando na porta 3000.</p></div>;
  if (!dadosPainel) return <div style={{ padding: '40px', textAlign: 'center', color: COR_SECUNDARIA }}><h2>Carregando painel... ⏳</h2></div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div>
          <img src={logoGovernanca} alt="Diretoria Executiva de Governança" style={{ height: '70px', objectFit: 'contain' }} />
        </div>
        
        {isAdmin ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ backgroundColor: '#fbeceb', color: COR_PRIMARIA, padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Unlock size={18} /> Perfil: Administrador
            </span>
            <button onClick={sairAdmin} style={{ backgroundColor: COR_SECUNDARIA, color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
              <LogOut size={18} /> Sair
            </button>
          </div>
        ) : (
          <button onClick={fazerLoginAdmin} style={{ backgroundColor: COR_SECUNDARIA, color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
            <Lock size={20} color={COR_PRIMARIA} /> Entrar como Administrador
          </button>
        )}
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <KpiCard title="Servidores Ativos" value={dadosPainel.kpis.total} icon={<Users size={24} color={COR_PRIMARIA} />} />
        <KpiCard title="Funções de Chefia" value={dadosPainel.kpis.chefes} icon={<Building size={24} color={COR_SECUNDARIA} />} />
        <KpiCard title="Em Licença Médica" value={dadosPainel.kpis.licencas} icon={<Calendar size={24} color={COR_PRIMARIA} />} />
      </div>

      {/* GRÁFICOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, color: COR_SECUNDARIA }}>Distribuição por Local de Exercício</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosPainel.graficos.dadosLocal} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 10}} />
                <YAxis />
                <Tooltip content={<TooltipPersonalizado />} cursor={{fill: '#f4f6f8'}} />
                <Bar dataKey="value" fill={COR_PRIMARIA} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, color: COR_SECUNDARIA }}>Qualificação do Efetivo</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dadosPainel.graficos.dadosQualificacao} cx="40%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value">
                  {dadosPainel.graficos.dadosQualificacao.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CORES_GRAFICOS[index % CORES_GRAFICOS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px', lineHeight: '24px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ÁREA EXCLUSIVA DO ADMINISTRADOR */}
      {isAdmin ? (
        <div style={{ border: `2px solid ${COR_PRIMARIA}`, backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginTop: '32px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ margin: 0, color: COR_PRIMARIA, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Unlock size={24} /> Tabela de Dados Nominais
              </h2>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Você está autenticado. Os dados abaixo são confidenciais.</p>
            </div>
            
            <button onClick={baixarCSV} style={{ backgroundColor: COR_PRIMARIA, color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
              <Download size={20} /> Baixar Relatório (CSV)
            </button>
          </div>

          <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1200px', fontSize: '14px' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', color: COR_SECUNDARIA }}>Matrícula</th>
                  <th style={{ padding: '12px', color: COR_SECUNDARIA }}>Nome Completo</th>
                  <th style={{ padding: '12px', color: COR_SECUNDARIA }}>CPF</th>
                  <th style={{ padding: '12px', color: COR_SECUNDARIA }}>Cargo</th>
                  <th style={{ padding: '12px', color: COR_SECUNDARIA }}>Localização</th>
                  <th style={{ padding: '12px', color: COR_SECUNDARIA }}>Qualificação</th>
                </tr>
              </thead>
              <tbody>
                {dadosCompletos.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontFamily: 'monospace', color: COR_PRIMARIA, fontWeight: 'bold' }}>{row.matricula}</td>
                    <td style={{ padding: '12px', fontWeight: '500', color: COR_SECUNDARIA }}>{row.nome}</td>
                    <td style={{ padding: '12px', fontFamily: 'monospace' }}>{row.cpf}</td>
                    <td style={{ padding: '12px' }}>{row.cargo}</td>
                    <td style={{ padding: '12px' }}>{row.localExercicio}</td>
                    <td style={{ padding: '12px' }}>{row.qualificacao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      ) : (
        <div style={{ marginTop: '32px', textAlign: 'center', padding: '40px', backgroundColor: '#e2e8f0', borderRadius: '8px', color: COR_SECUNDARIA }}>
          <Lock size={48} style={{ margin: '0 auto', marginBottom: '16px', opacity: 0.5, color: COR_PRIMARIA }} />
          <h3>Dados Protegidos (LGPD)</h3>
          <p>A listagem nominal e a extração de relatórios estão restritas.<br/>Faça login como Administrador no topo da página para liberar esta área.</p>
        </div>
      )}

    </div>
  );
}

// COMPONENTE KPI 
function KpiCard({ title, value, icon }) {
  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: `4px solid ${COR_PRIMARIA}` }}>
      <div style={{ padding: '12px', backgroundColor: '#f4f6f8', borderRadius: '8px' }}>
        {icon}
      </div>
      <div>
        <h4 style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase' }}>{title}</h4>
        <p style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: 'bold', color: COR_SECUNDARIA }}>{value}</p>
      </div>
    </div>
  );
}

// CAIXINHA DE INFORMAÇÃO INTELIGENTE (TOOLTIP)
function TooltipPersonalizado({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: '#fff',
        padding: '12px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '350px', 
        whiteSpace: 'normal',
        wordWrap: 'break-word'
      }}>
        <p style={{ margin: '0 0 8px 0', color: '#2b2b2b', fontWeight: 'bold', fontSize: '12px', lineHeight: '1.4' }}>
          {label}
        </p>
        <p style={{ margin: 0, color: '#9e2a2b', fontWeight: 'bold', fontSize: '14px' }}>
          Total: {payload[0].value} servidores
        </p>
      </div>
    );
  }
  return null;
}