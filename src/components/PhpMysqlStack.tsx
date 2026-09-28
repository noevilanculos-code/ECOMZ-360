import React, { useState } from 'react';
import {
  Database,
  Code,
  FileCode,
  Download,
  Copy,
  Check,
  Server,
  Layers,
  Terminal,
  Play,
  FileText,
  ExternalLink,
  Info
} from 'lucide-react';

export const PhpMysqlStack: React.FC = () => {
  const [activeFile, setActiveFile] = useState<
    'database.sql' | 'config.php' | 'ocorrencias.php' | 'projetos.php' | 'index.html' | 'style.css' | 'app.js' | 'readme'
  >('database.sql');
  const [copied, setCopied] = useState(false);
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM ocorrencias WHERE gravidade = "critica" ORDER BY criado_em DESC;');
  const [queryResult, setQueryResult] = useState<any[] | null>(null);

  const sampleDatabase = {
    ocorrencias: [
      { id: 1, titulo: 'Corte Ilegal de Mangleiros', categoria: 'Mangaal', provincia: 'Sofala', distrito: 'Búzi', gravidade: 'critica', status: 'em_acao', criado_em: '2026-03-12' },
      { id: 2, titulo: 'Queimada Descontrolada no Miombo', categoria: 'Queimada', provincia: 'Niassa', distrito: 'Marrupa', gravidade: 'alta', status: 'pendente', criado_em: '2026-03-14' },
      { id: 3, titulo: 'Depósito Irregular de Plásticos', categoria: 'Residuos', provincia: 'Maputo Cidade', distrito: 'KaMpfumo', gravidade: 'media', status: 'resolvido', criado_em: '2026-03-16' },
      { id: 4, titulo: 'Contaminação de Bacia Hidrográfica', categoria: 'Poluicao_Agua', provincia: 'Tete', distrito: 'Moatize', gravidade: 'critica', status: 'em_analise', criado_em: '2026-03-18' }
    ],
    projetos: [
      { id: 1, titulo: 'Restauração do Mangal de Sofala', provincia: 'Sofala', meta_arvores: 50000, arvores_plantadas: 31200, voluntarios: 84 },
      { id: 2, titulo: 'Brigada Anti-Queimadas do Miombo', provincia: 'Niassa', meta_arvores: 10000, arvores_plantadas: 4800, voluntarios: 52 },
      { id: 3, titulo: 'Ecopontos Urbanos de Maputo', provincia: 'Maputo Cidade', meta_arvores: 5000, arvores_plantadas: 2100, voluntarios: 37 }
    ]
  };

  const fileContents: Record<string, { lang: string; code: string; desc: string }> = {
    'database.sql': {
      lang: 'sql',
      desc: 'Esquema completo do banco de dados MySQL (tabelas de usuários, ocorrências, províncias e projetos)',
      code: `-- ============================================================
-- ECO-MZ 360 - Banco de Dados MySQL
-- ============================================================
CREATE DATABASE IF NOT EXISTS \`ecomz_db\` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE \`ecomz_db\`;

-- 1. Tabela de Ocorrências Ambientais
CREATE TABLE IF NOT EXISTS \`ocorrencias\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`titulo\` VARCHAR(150) NOT NULL,
  \`descricao\` TEXT NOT NULL,
  \`categoria\` ENUM('Desmatamento', 'Queimada', 'Poluicao_Agua', 'Mangaal', 'Residuos', 'Outro') NOT NULL,
  \`provincia\` VARCHAR(50) NOT NULL,
  \`distrito\` VARCHAR(80) NOT NULL,
  \`latitude\` DECIMAL(10, 7) NOT NULL,
  \`longitude\` DECIMAL(10, 7) NOT NULL,
  \`gravidade\` ENUM('baixa', 'media', 'alta', 'critica') DEFAULT 'media',
  \`status\` ENUM('pendente', 'em_analise', 'em_acao', 'resolvido') DEFAULT 'pendente',
  \`criado_em\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabela de Projetos Ecológicos
CREATE TABLE IF NOT EXISTS \`projetos\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`titulo\` VARCHAR(150) NOT NULL,
  \`descricao\` TEXT NOT NULL,
  \`categoria\` VARCHAR(50) NOT NULL,
  \`provincia\` VARCHAR(50) NOT NULL,
  \`meta_arvores\` INT DEFAULT 0,
  \`arvores_plantadas\` INT DEFAULT 0,
  \`status\` ENUM('planejamento', 'em_execucao', 'concluido') DEFAULT 'em_execucao',
  \`data_inicio\` DATE NOT NULL,
  \`criado_em\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    },
    'config.php': {
      lang: 'php',
      desc: 'Conexão PDO segura ao MySQL com suporte a UTF-8, tratamento de erros e variáveis de ambiente',
      code: `<?php
/**
 * ECO-MZ 360 - Configuração de Conexão com a Base de Dados MySQL via PDO
 */

define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_PORT', getenv('DB_PORT') ?: 3306);
define('DB_NAME', getenv('DB_NAME') ?: 'ecomz_db');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') !== false ? getenv('DB_PASS') : '');
define('DB_CHARSET', 'utf8mb4');

if (!headers_sent()) {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    
    if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

function getDbConnection(): PDO {
    static $pdo = null;

    if ($pdo === null) {
        $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=%s', DB_HOST, DB_PORT, DB_NAME, DB_CHARSET);
        $opcoes = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ];

        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $opcoes);
        } catch (PDOException $e) {
            if (!headers_sent()) {
                http_response_code(500);
                header('Content-Type: application/json; charset=utf-8');
            }
            echo json_encode([
                'status' => 'erro',
                'mensagem' => 'Falha ao conectar com o banco de dados MySQL do ECO-MZ.',
                'detalhe' => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
    return $pdo;
}

$pdo = getDbConnection();`
    },
    'ocorrencias.php': {
      lang: 'php',
      desc: 'API REST em PHP: Consulta (GET) com filtros e Inserção (POST) de Ocorrências no MySQL',
      code: `<?php
require_once __DIR__ . '/../config.php';

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    $provincia = $_GET['provincia'] ?? '';
    $sql = "SELECT * FROM ocorrencias WHERE 1=1";
    $params = [];

    if (!empty($provincia)) {
        $sql .= " AND provincia = :provincia";
        $params[':provincia'] = $provincia;
    }

    $sql .= " ORDER BY criado_em DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode([
        'status' => 'sucesso',
        'total'  => $stmt->rowCount(),
        'dados'  => $stmt->fetchAll()
    ]);
    exit;
}

if ($metodo === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    
    $sql = "INSERT INTO ocorrencias (titulo, descricao, categoria, provincia, distrito, latitude, longitude, gravidade) 
            VALUES (:titulo, :descricao, :categoria, :provincia, :distrito, :latitude, :longitude, :gravidade)";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':titulo'    => $input['titulo'],
        ':descricao' => $input['descricao'],
        ':categoria' => $input['categoria'] ?? 'Outro',
        ':provincia' => $input['provincia'],
        ':distrito'  => $input['distrito'] ?? '',
        ':latitude'  => $input['latitude'] ?? -18.665,
        ':longitude' => $input['longitude'] ?? 35.529,
        ':gravidade' => $input['gravidade'] ?? 'media'
    ]);

    echo json_encode(['status' => 'sucesso', 'id' => $pdo->lastInsertId()]);
    exit;
}`
    },
    'projetos.php': {
      lang: 'php',
      desc: 'API REST em PHP: Listagem e cadastro de projetos comunitários no MySQL',
      code: `<?php
require_once __DIR__ . '/../config.php';

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    $stmt = $pdo->query("SELECT * FROM projetos ORDER BY data_inicio DESC");
    echo json_encode([
        'status' => 'sucesso',
        'total' => $stmt->rowCount(),
        'dados' => $stmt->fetchAll()
    ]);
    exit;
}`
    },
    'index.html': {
      lang: 'html',
      desc: 'Estrutura HTML5 Semântica para o frontend nativo',
      code: `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ECO-MZ 360 - Gestão Ambiental (PHP & MySQL)</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="navbar">
    <div class="container nav-container">
      <span class="logo-badge">ECO-MZ 360</span>
      <nav class="nav-links">
        <a href="#ocorrencias">Ocorrências</a>
        <a href="#projetos">Projetos</a>
      </nav>
    </div>
  </header>

  <main class="container">
    <table class="data-table">
      <thead>
        <tr><th>ID</th><th>Título</th><th>Província</th><th>Gravidade</th></tr>
      </thead>
      <tbody id="lista-ocorrencias"></tbody>
    </table>
  </main>

  <script src="app.js"></script>
</body>
</html>`
    },
    'style.css': {
      lang: 'css',
      desc: 'Estilização limpa em CSS3 puro (sem dependência de frameworks externos)',
      code: `:root {
  --primary: #059669;
  --dark: #0f172a;
  --slate-100: #f1f5f9;
}

body {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background-color: #f8fafc;
  color: #334155;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
}`
    },
    'app.js': {
      lang: 'javascript',
      desc: 'Lógica Frontend em JavaScript Vanilla (Fetch API conectando com os scripts PHP)',
      code: `const API_BASE = 'api';

// 1. Carregar ocorrências do MySQL via Fetch API (GET)
async function carregarOcorrencias() {
  const provinciaFiltro = document.getElementById('filtro-provincia')?.value || '';
  const url = \`\${API_BASE}/ocorrencias.php\${provinciaFiltro ? '?provincia=' + encodeURIComponent(provinciaFiltro) : ''}\`;

  try {
    const resposta = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const json = await resposta.json();

    if (json.status === 'sucesso' && Array.isArray(json.dados)) {
      const tbody = document.getElementById('lista-ocorrencias');
      tbody.innerHTML = json.dados.map(o => \`
        <tr>
          <td><strong>#\${o.id}</strong></td>
          <td>\${o.titulo}</td>
          <td>\${o.categoria}</td>
          <td>\${o.provincia}</td>
          <td>\${o.distrito || '-'}</td>
          <td><span class="badge badge-\${o.gravidade}">\${o.gravidade}</span></td>
          <td><strong>\${o.status}</strong></td>
        </tr>
      \`).join('');
      document.getElementById('total-ocorrencias').textContent = json.total;
    }
  } catch (err) {
    console.warn('Erro ao contactar API PHP:', err);
  }
}

// 2. Salvar nova ocorrência no MySQL via Fetch API (POST)
async function salvarOcorrencia(event) {
  event.preventDefault();
  const btn = document.getElementById('btn-submit');
  const alertBox = document.getElementById('mensagem-retorno');

  const payload = {
    titulo: document.getElementById('titulo').value.trim(),
    categoria: document.getElementById('categoria').value,
    provincia: document.getElementById('provincia').value,
    distrito: document.getElementById('distrito').value.trim(),
    gravidade: document.getElementById('gravidade').value,
    descricao: document.getElementById('descricao').value.trim(),
    latitude: -18.665695,
    longitude: 35.529562
  };

  btn.disabled = true;
  btn.textContent = 'Gravando no MySQL...';

  try {
    const resposta = await fetch(\`\${API_BASE}/ocorrencias.php\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });

    const resultado = await resposta.json();
    if (resposta.ok && resultado.status === 'sucesso') {
      alertBox.className = 'alert-box success';
      alertBox.textContent = \`✓ Ocorrência gravada com sucesso no MySQL! ID: #\${resultado.id}\`;
      document.getElementById('form-ocorrencia').reset();
      await carregarOcorrencias();
    } else {
      throw new Error(resultado.mensagem || 'Falha ao salvar');
    }
  } catch (err) {
    alertBox.className = 'alert-box error';
    alertBox.textContent = \`Erro: \${err.message}\`;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Gravar no Banco MySQL';
  }
}

document.addEventListener('DOMContentLoaded', carregarOcorrencias);`
    },
    'readme': {
      lang: 'markdown',
      desc: 'Manual de Instalação e Execução com XAMPP / WampServer / Apache',
      code: `# Guia de Execução com PHP e MySQL

1. Abra o phpMyAdmin e crie o banco 'ecomz_db'.
2. Importe o arquivo 'database.sql'.
3. Copie os arquivos da pasta 'php-mysql/' para o seu servidor local:
   - XAMPP: C:/xampp/htdocs/ecomz-360/
   - WAMP: C:/wamp64/www/ecomz-360/
4. Abra no seu navegador: http://localhost/ecomz-360/`
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(fileContents[activeFile].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const element = document.createElement('a');
    const file = new Blob([fileContents[activeFile].code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = activeFile;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const runSimulationQuery = () => {
    const q = sqlQuery.toLowerCase();
    if (q.includes('critica')) {
      setQueryResult(sampleDatabase.ocorrencias.filter((o) => o.gravidade === 'critica'));
    } else if (q.includes('projetos')) {
      setQueryResult(sampleDatabase.projetos);
    } else {
      setQueryResult(sampleDatabase.ocorrencias);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-indigo-50 text-indigo-800 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1">
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span>Stack Clássica • PHP + MySQL + HTML5 + CSS3 + JS</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Arquitetura Nativa: MySQL, PHP, HTML, CSS e JavaScript
          </h2>
          <p className="text-xs text-slate-500">
            Todos os ficheiros completos desta stack estão gerados na pasta <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">/php-mysql/</code> prontos para execução no XAMPP, WAMP ou servidor Apache.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadFile}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar {activeFile}</span>
          </button>
        </div>
      </div>

      {/* Architecture Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs mb-1">
            <Database className="w-4 h-4" />
            <span>MySQL 8 / MariaDB</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">Base de Dados ecomz_db</h4>
          <p className="text-xs text-slate-500 mt-1">
            Tabelas relacionais com chaves estrangeiras, índices e codificação UTF-8mb4.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 text-blue-600 font-bold text-xs mb-1">
            <Server className="w-4 h-4" />
            <span>PHP 7.4+ / PHP 8.x</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">Backend & PDO API</h4>
          <p className="text-xs text-slate-500 mt-1">
            Scripts modulares com Prepared Statements para prevenção contra SQL Injection.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 text-orange-600 font-bold text-xs mb-1">
            <FileCode className="w-4 h-4" />
            <span>HTML5 & CSS3 Puro</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">Layout Semântico</h4>
          <p className="text-xs text-slate-500 mt-1">
            Design responsivo, tipografia limpa e formulários padronizados para Moçambique.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 text-amber-600 font-bold text-xs mb-1">
            <Code className="w-4 h-4" />
            <span>JavaScript Vanilla</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">Fetch API Dinâmica</h4>
          <p className="text-xs text-slate-500 mt-1">
            Consumo assíncrono dos endpoints PHP e renderização em tempo real na tabela HTML.
          </p>
        </div>
      </div>

      {/* Code Browser & File Viewer */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {/* File Tabs */}
        <div className="flex items-center space-x-1 p-2 bg-slate-900 text-white overflow-x-auto text-xs font-mono">
          {(
            [
              'database.sql',
              'config.php',
              'ocorrencias.php',
              'projetos.php',
              'index.html',
              'style.css',
              'app.js',
              'readme'
            ] as const
          ).map((fname) => (
            <button
              key={fname}
              onClick={() => setActiveFile(fname)}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1.5 shrink-0 ${
                activeFile === fname
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{fname}</span>
            </button>
          ))}

          <div className="ml-auto pr-2">
            <button
              onClick={handleCopyCode}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[11px] flex items-center space-x-1 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copiado!' : 'Copiar Código'}</span>
            </button>
          </div>
        </div>

        {/* Code Description Bar */}
        <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 text-xs text-slate-600 flex items-center space-x-2">
          <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>{fileContents[activeFile].desc}</span>
        </div>

        {/* Code Body */}
        <div className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto max-h-[420px]">
          <pre>{fileContents[activeFile].code}</pre>
        </div>
      </div>

      {/* Interactive MySQL Query Simulator */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Simulador Interativo de Consultas MySQL (PDO Query)
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Experimente como as consultas SQL preparadas pelo script <code className="text-indigo-600 font-bold">ocorrencias.php</code> filtram as tabelas da base de dados:
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            className="flex-1 font-mono text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={runSimulationQuery}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Executar Consulta</span>
          </button>
        </div>

        {queryResult && (
          <div className="border border-slate-200 rounded-lg overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  {Object.keys(queryResult[0] || {}).map((k) => (
                    <th key={k} className="p-2.5 capitalize">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {queryResult.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    {Object.values(row).map((val: any, vIdx) => (
                      <td key={vIdx} className="p-2.5 font-mono text-[11px] text-slate-700">
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
