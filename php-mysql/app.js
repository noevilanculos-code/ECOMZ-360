/**
 * ECO-MZ 360 - Frontend Vanilla JavaScript (Fetch API + DOM)
 * 
 * Comunicação direta com a API REST em PHP e o banco de dados MySQL
 * utilizando a Fetch API nativa do JavaScript.
 */

const API_BASE = 'api';

// Coordenadas geográficas de referência por província em Moçambique
const COORDENADAS_PROVINCIAS = {
  'Cabo Delgado': { lat: -12.9732, lng: 40.5178 },
  'Niassa': { lat: -13.3125, lng: 35.2406 },
  'Nampula': { lat: -15.1165, lng: 39.2666 },
  'Zambézia': { lat: -17.8786, lng: 36.8883 },
  'Tete': { lat: -16.1564, lng: 33.5863 },
  'Manica': { lat: -18.9333, lng: 32.8833 },
  'Sofala': { lat: -19.8436, lng: 34.8389 },
  'Inhambane': { lat: -23.8650, lng: 35.3833 },
  'Gaza': { lat: -25.0444, lng: 33.6444 },
  'Maputo Província': { lat: -25.6667, lng: 32.3333 },
  'Maputo Cidade': { lat: -25.9692, lng: 32.5732 }
};

document.addEventListener('DOMContentLoaded', () => {
  carregarOcorrencias();
  carregarProjetos();
});

/**
 * Busca ocorrências do banco MySQL via Fetch API (GET em api/ocorrencias.php)
 * Suporta filtragem dinâmica por província e atualiza a interface.
 */
async function carregarOcorrencias() {
  const filtroProvinciaEl = document.getElementById('filtro-provincia');
  const provinciaFiltro = filtroProvinciaEl ? filtroProvinciaEl.value.trim() : '';
  const tbody = document.getElementById('lista-ocorrencias');
  const totalCountEl = document.getElementById('total-ocorrencias');
  const dbStatusEl = document.getElementById('db-status');
  
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center" style="padding: 24px; color: #64748b;">
          <strong>Carregando ocorrências do MySQL via PHP...</strong>
        </td>
      </tr>
    `;
  }

  try {
    // Montagem da URL com parâmetros de busca opcionais
    const params = new URLSearchParams();
    if (provinciaFiltro) {
      params.append('provincia', provinciaFiltro);
    }

    const url = `${API_BASE}/ocorrencias.php${params.toString() ? '?' + params.toString() : ''}`;
    
    // Chamada HTTP GET com a Fetch API
    const resposta = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!resposta.ok) {
      throw new Error(`Erro HTTP ${resposta.status}: ${resposta.statusText}`);
    }

    const resultado = await resposta.json();

    if (resultado.status === 'sucesso' && Array.isArray(resultado.dados)) {
      atualizarTabelaOcorrencias(resultado.dados);
      
      if (totalCountEl) {
        totalCountEl.textContent = resultado.total !== undefined ? resultado.total : resultado.dados.length;
      }

      if (dbStatusEl) {
        dbStatusEl.className = 'stat-badge online';
        dbStatusEl.textContent = 'MySQL Online';
      }
    } else {
      throw new Error(resultado.mensagem || 'Resposta inválida do backend PHP.');
    }
  } catch (erro) {
    console.warn('Aviso: Falha ao contactar api/ocorrencias.php:', erro.message);
    
    if (dbStatusEl) {
      dbStatusEl.className = 'stat-badge offline';
      dbStatusEl.textContent = 'Modo Demonstração';
    }

    // Utiliza dados de demonstração para manter a interface funcional caso o MySQL local não esteja ligado
    usarDadosDemonstracao();
  }
}

/**
 * Salva uma nova ocorrência ambiental no banco de dados MySQL via Fetch API (POST em api/ocorrencias.php)
 *
 * @param {Event} event Evento de submissão do formulário
 */
async function salvarOcorrencia(event) {
  if (event && event.preventDefault) {
    event.preventDefault();
  }

  const btnSubmit = document.getElementById('btn-submit');
  const alertBox = document.getElementById('mensagem-retorno');
  const form = document.getElementById('form-ocorrencia');

  // Coleta dos campos do formulário
  const titulo = document.getElementById('titulo')?.value.trim() || '';
  const categoria = document.getElementById('categoria')?.value || 'Outro';
  const provincia = document.getElementById('provincia')?.value || '';
  const distrito = document.getElementById('distrito')?.value.trim() || '';
  const gravidade = document.getElementById('gravidade')?.value || 'media';
  const descricao = document.getElementById('descricao')?.value.trim() || '';

  // Validação simples no lado do cliente
  if (!titulo || !provincia || !descricao) {
    exibirAlerta('Por favor, preencha todos os campos obrigatórios (*).', 'error');
    return;
  }

  // Determinar coordenadas padrão da província selecionada
  const coordenadas = COORDENADAS_PROVINCIAS[provincia] || { lat: -18.665695, lng: 35.529562 };

  const payload = {
    titulo,
    categoria,
    provincia,
    distrito,
    gravidade,
    descricao,
    latitude: coordenadas.lat,
    longitude: coordenadas.lng
  };

  // Feedback de carregamento no botão
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Gravando no MySQL...';
  }

  try {
    // Chamada HTTP POST com Fetch API enviando JSON
    const resposta = await fetch(`${API_BASE}/ocorrencias.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const resultado = await resposta.json();

    if (resposta.ok && (resultado.status === 'sucesso' || resultado.id)) {
      exibirAlerta(`✓ Ocorrência gravada com sucesso no MySQL! ID registado: #${resultado.id || 'OK'}`, 'success');
      
      // Limpar formulário após sucesso
      if (form) {
        form.reset();
      }

      // Atualizar a listagem de ocorrências imediatamente
      await carregarOcorrencias();
    } else {
      throw new Error(resultado.mensagem || 'Falha ao processar a inserção no banco de dados.');
    }
  } catch (erro) {
    console.error('Erro na submissão:', erro);
    exibirAlerta(
      `Falha na gravação: ${erro.message}. Verifique se o servidor Apache e MySQL (XAMPP/WAMP) estão em execução.`,
      'error'
    );
  } finally {
    // Restaurar estado do botão
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'Gravar no Banco MySQL';
    }
  }
}

/**
 * Exibe alertas de status (sucesso ou erro) na interface
 */
function exibirAlerta(mensagem, tipo = 'success') {
  const alertBox = document.getElementById('mensagem-retorno');
  if (!alertBox) return;

  alertBox.className = `alert-box ${tipo}`;
  alertBox.textContent = mensagem;
  alertBox.style.display = 'block';

  // Ocultar alerta de sucesso após 7 segundos
  if (tipo === 'success') {
    setTimeout(() => {
      alertBox.style.display = 'none';
    }, 7000);
  }
}

/**
 * Renderiza as ocorrências na tabela HTML
 */
function atualizarTabelaOcorrencias(ocorrencias) {
  const tbody = document.getElementById('lista-ocorrencias');
  if (!tbody) return;

  if (!ocorrencias || ocorrencias.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center" style="padding: 20px; color: #64748b;">
          Nenhuma ocorrência encontrada para os filtros selecionados.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = ocorrencias.map(o => `
    <tr>
      <td><strong>#${escapeHtml(String(o.id))}</strong></td>
      <td><strong>${escapeHtml(o.titulo)}</strong></td>
      <td><span class="badge badge-categoria">${escapeHtml(o.categoria)}</span></td>
      <td>${escapeHtml(o.provincia)}</td>
      <td>${escapeHtml(o.distrito || '-')}</td>
      <td><span class="badge badge-${escapeHtml(o.gravidade)}">${escapeHtml(o.gravidade)}</span></td>
      <td><strong>${escapeHtml(o.status || 'pendente')}</strong></td>
      <td>${o.criado_em ? new Date(o.criado_em).toLocaleDateString('pt-MZ') : '-'}</td>
    </tr>
  `).join('');
}

/**
 * Busca projetos ecológicos do MySQL via Fetch API (api/projetos.php)
 */
async function carregarProjetos() {
  const container = document.getElementById('lista-projetos');
  const totalProjetosEl = document.getElementById('total-projetos');
  const totalArvoresEl = document.getElementById('total-arvores');

  try {
    const res = await fetch(`${API_BASE}/projetos.php`, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!res.ok) return;

    const json = await res.json();
    if (json.status === 'sucesso' && Array.isArray(json.dados)) {
      if (totalProjetosEl) {
        totalProjetosEl.textContent = json.total || json.dados.length;
      }

      let totalArvores = 0;

      if (container) {
        container.innerHTML = json.dados.map(p => {
          totalArvores += parseInt(p.arvores_plantadas || 0, 10);
          return `
            <div class="project-card">
              <h3>${escapeHtml(p.titulo)}</h3>
              <p>${escapeHtml(p.descricao)}</p>
              <div class="project-meta">
                <span>Província: <strong>${escapeHtml(p.provincia)}</strong></span>
                <span>Plantadas: <strong>${Number(p.arvores_plantadas || 0).toLocaleString()} / ${Number(p.meta_arvores || 0).toLocaleString()}</strong></span>
              </div>
            </div>
          `;
        }).join('');
      }

      if (totalArvoresEl) {
        totalArvoresEl.textContent = totalArvores.toLocaleString();
      }
    }
  } catch (e) {
    console.warn('Carregamento de projetos padrão offline');
  }
}

/**
 * Fallback com dados demonstrativos caso a API PHP/MySQL não esteja respondendo
 */
function usarDadosDemonstracao() {
  const demo = [
    { id: 1, titulo: 'Corte Ilegal de Mangleiros', categoria: 'Mangaal', provincia: 'Sofala', distrito: 'Búzi', gravidade: 'critica', status: 'em_acao', criado_em: '2026-03-12' },
    { id: 2, titulo: 'Foco de Queimada de Machamba', categoria: 'Queimada', provincia: 'Niassa', distrito: 'Marrupa', gravidade: 'alta', status: 'pendente', criado_em: '2026-03-14' },
    { id: 3, titulo: 'Lixeira Clandestina na Orla Costeira', categoria: 'Residuos', provincia: 'Maputo Cidade', distrito: 'KaMpfumo', gravidade: 'media', status: 'resolvido', criado_em: '2026-03-16' },
    { id: 4, titulo: 'Contaminação de Afluente Fluvial', categoria: 'Poluicao_Agua', provincia: 'Tete', distrito: 'Moatize', gravidade: 'critica', status: 'em_analise', criado_em: '2026-03-18' }
  ];
  atualizarTabelaOcorrencias(demo);
  
  const totalCountEl = document.getElementById('total-ocorrencias');
  if (totalCountEl) {
    totalCountEl.textContent = demo.length;
  }
}

/**
 * Sanitiza texto para prevenir XSS ao injetar no HTML
 */
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
