const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// CONFIGURAÇÃO DO BANCO
// ==========================================
const dbConfig = {
  host: 'localhost',
  user: 'root',      
  password: '',      
  database: 'dash_sefaz'
};

app.get('/api/dashboard', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM servidores');
    await connection.end();

    // ==========================================
    // 1. CORREÇÃO DOS KPIs 
    // ==========================================
    const kpis = {
      total: rows.length,
      
      licencas: rows.filter(d => {
        if (!d.licencaMedica) return false;
        const val = d.licencaMedica.toString().trim().toUpperCase();
        return val === 'SIM' || val === 'S';
      }).length,
      
      chefes: rows.filter(d => {
        if (!d.funcao) return false;
        const val = d.funcao.toString().trim().toUpperCase();
        return val !== '' && val !== '-' && val !== 'NENHUMA' && val !== 'N/A' && val !== 'NÃO INFORMADO';
      }).length
    };

    // ==========================================
    // 2. CORREÇÃO DO GRÁFICO DE PIZZA (Limpeza e Agrupamento)
    // ==========================================
    const contagemQualificacao = {};
    rows.forEach(d => {
      let qual = (d.qualificacao || '').toString().trim().toUpperCase();
      
      // Limpeza robusta para não cortar o texto
      if (qual === '' || qual === '-' || qual.includes('NÃO INFORMAD')) {
        qual = 'NÃO INFORMADA';
      }
      
      contagemQualificacao[qual] = (contagemQualificacao[qual] || 0) + 1;
    });

    let qualArray = Object.keys(contagemQualificacao).map(key => ({ name: key, value: contagemQualificacao[key] }));
    qualArray.sort((a, b) => b.value - a.value);

    let topQual = qualArray.slice(0, 5); 
    let outrosQualCount = qualArray.slice(5).reduce((acc, curr) => acc + curr.value, 0);
    if (outrosQualCount > 0) {
      topQual.push({ name: 'OUTRAS', value: outrosQualCount });
    }

    // ==========================================
    // 3. CORREÇÃO DO GRÁFICO DE BARRAS (Top 10 + Outros)
    // ==========================================
    const contagemLocal = {};
    rows.forEach(d => {
      let local = (d.localExercicio || '').toString().trim().toUpperCase();
      // Padronização de valores vazios
      if (local === '' || local === '-' || local.includes('NÃO INFORMAD')) local = 'NÃO INFORMADO';
      
      contagemLocal[local] = (contagemLocal[local] || 0) + 1;
    });

    let locaisArray = Object.keys(contagemLocal).map(key => ({ name: key, value: contagemLocal[key] }));
    locaisArray.sort((a, b) => b.value - a.value);

    let topLocais = locaisArray.slice(0, 10);
    let outrosCount = locaisArray.slice(10).reduce((acc, curr) => acc + curr.value, 0);
    if (outrosCount > 0) {
        topLocais.push({ name: 'OUTROS', value: outrosCount });
    }

    res.json({ kpis, graficos: { dadosLocal: topLocais, dadosQualificacao: topQual } });
  } catch (error) {
    console.error("Erro no Banco de Dados:", error);
    res.status(500).json({ erro: 'Erro ao conectar no banco de dados' });
  }
});

app.post('/api/exportar', async (req, res) => {
  const { senha } = req.body;
  if (senha === 'SenhaSuperSecreta123') {
    try {
      const connection = await mysql.createConnection(dbConfig);
      const [rows] = await connection.execute('SELECT * FROM servidores');
      await connection.end();
      res.json({ sucesso: true, dados: rows });
    } catch (error) {
      res.status(500).json({ sucesso: false, message: 'Erro no banco' });
    }
  } else {
    res.status(403).json({ sucesso: false, mensagem: 'Senha incorreta.' });
  }
});

const PORTA = 3000;
app.listen(PORTA, () => {
  console.log(`✅ Backend rodando na porta ${PORTA}. Dados limpos e padronizados!`);
});