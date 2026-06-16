# Dashboard Gerencial - Grupo Ocupacional Servidor Fiscal Tributário

Projeto em **PHP + MySQL + JavaScript** com painel público, login administrativo e exportação em CSV.

## O que o painel mostra

- Quantidade de auditores, técnicos e comissionados.
- Auditores por cargo: AFTE e AFTME.
- Auditores homens e mulheres.
- Idade média.
- Aposentadorias esperadas para auditores e técnicos com idade maior ou igual a 60 anos.
- Auditores em cargos de gestão, separados por sexo.
- Gráfico de distribuição dos auditores por classe e nível.
- Licença médica: quantidade de servidores com licença, total de dias e total com CID-F.
- Login administrativo para visualizar dados sensíveis e exportar CSV.

## Estrutura

```text
dashboard_php/
├── config/
│   ├── auth.php
│   └── database.php
├── public/
│   ├── api/
│   │   ├── export.php
│   │   ├── login.php
│   │   ├── logout.php
│   │   ├── me.php
│   │   └── metrics.php
│   ├── assets/
│   │   ├── css/style.css
│   │   ├── img/logo.png
│   │   └── js/dashboard.js
│   └── index.php
├── scripts/
│   └── criar_usuario_admin.php
├── schema.sql
└── README.md
```

## Como instalar

### 1. Crie o banco

No MySQL/MariaDB, execute:

```sql
SOURCE schema.sql;
```

Ou importe o arquivo `schema.sql` pelo phpMyAdmin/MySQL Workbench.

### 2. Configure a conexão

Edite `config/database.php`:

```php
$DB_HOST = '127.0.0.1';
$DB_PORT = '3306';
$DB_NAME = 'dashboard_fiscal';
$DB_USER = 'root';
$DB_PASS = '';
```

Também é possível usar variáveis de ambiente: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`.

### 3. Crie o usuário administrativo

No terminal, dentro da pasta do projeto:

```bash
php scripts/criar_usuario_admin.php admin SuaSenhaForte "Administrador"
```

Depois acesse o dashboard e use:

```text
Usuário: admin
Senha: SuaSenhaForte
```

### 4. Rode localmente

```bash
php -S localhost:8000 -t public
```

Acesse:

```text
http://localhost:8000
```

## Como colocar a logo

Salve sua imagem em:

```text
public/assets/img/logo.png
```

Se não houver imagem, o painel mostra um espaço escrito `LOGO`.

## Como importar seus dados reais

A tabela principal é `servidores`.

Campos esperados:

| Campo | Exemplo |
|---|---|
| matricula | 12345 |
| nome | Maria Silva |
| grupo_ocupacional | AUDITOR, TECNICO ou COMISSIONADO |
| cargo_fiscal | AFTE ou AFTME, apenas para auditor |
| sexo | M, F ou NA |
| data_nascimento | 1975-08-10 |
| classe | A, B, C etc. |
| nivel | I, II, III, IV etc. |
| em_gestao | 1 para sim, 0 para não |
| dias_licenca_medica | 15 |
| cid | F32, J11 etc. |

## Regra de dados sensíveis

No modo público, o sistema não entrega nome, matrícula nem CID individual. Apenas totais consolidados são exibidos.

No modo administrativo, após login, o painel mostra detalhamento de licenças e permite exportar CSV completo.

> Observação: CID e informações médicas são dados sensíveis. Use somente para usuários autorizados e conforme as regras internas e LGPD.
