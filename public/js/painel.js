/**
 * Lógica do Painel Público de Auditoria — AcompanhaBrasil
 */

document.addEventListener('DOMContentLoaded', () => {
  const formFiltros = document.getElementById('form-filtros');
  const tabelaSecoesCorpo = document.getElementById('tabela-secoes-corpo');
  const totalSecoesCount = document.getElementById('total-secoes-count');
  
  // Cards de Métricas
  const metricSecoes = document.getElementById('metric-secoes');
  const metricBoletins = document.getElementById('metric-boletins');
  const metricVotos = document.getElementById('metric-votos');
  const metricDivergencias = document.getElementById('metric-divergencias');
  const listaVotosConsolidada = document.getElementById('lista-votos-consolidada');

  // Modal de Detalhes
  const modalDetalhes = document.getElementById('modal-detalhes-secao');
  const modalTitulo = document.getElementById('modal-secao-titulo');
  const modalConteudo = document.getElementById('modal-secao-conteudo');
  const btnFecharModal = document.getElementById('btn-fechar-modal');

  // Carrega dados iniciais
  loadEstatisticas();
  loadSecoes();

  if (formFiltros) {
    formFiltros.addEventListener('submit', (e) => {
      e.preventDefault();
      loadSecoes();
    });

    document.getElementById('btn-limpar-filtros').addEventListener('click', () => {
      formFiltros.reset();
      loadSecoes();
    });
  }

  async function loadEstatisticas() {
    try {
      const res = await Api.getEstatisticas();
      if (res.sucesso) {
        const est = res.estatisticas;
        if (metricSecoes) metricSecoes.textContent = est.totalSecoes.toLocaleString('pt-BR');
        if (metricBoletins) metricBoletins.textContent = est.totalBoletinsEnviados.toLocaleString('pt-BR');
        if (metricVotos) metricVotos.textContent = est.totalVotosAuditados.toLocaleString('pt-BR');
        if (metricDivergencias) metricDivergencias.textContent = est.totalDivergentes.toLocaleString('pt-BR');

        // Renderiza consolidado de votos
        if (listaVotosConsolidada && est.consolidacaoVotos) {
          listaVotosConsolidada.innerHTML = '';
          const maxVotos = Math.max(...est.consolidacaoVotos.map(v => v.total_votos), 1);

          est.consolidacaoVotos.forEach(voto => {
            const percentual = ((voto.total_votos / maxVotos) * 100).toFixed(1);
            const div = document.createElement('div');
            div.className = 'space-y-1';
            div.innerHTML = `
              <div class="flex justify-between text-xs font-semibold text-slate-700">
                <span>${voto.cargo} — ${voto.nome_candidato || voto.numero_candidato} (${voto.partido})</span>
                <span class="font-bold">${voto.total_votos.toLocaleString('pt-BR')} votos</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${percentual}%"></div>
              </div>
            `;
            listaVotosConsolidada.appendChild(div);
          });
        }
      }
    } catch (err) {
      console.error('Erro ao carregar métricas:', err);
    }
  }

  async function loadSecoes() {
    tabelaSecoesCorpo.innerHTML = `
      <tr>
        <td colspan="7" class="py-8 text-center text-slate-500">
          <span class="animate-spin inline-block mr-2">🔄</span> Carregando seções eleitorais auditadas...
        </td>
      </tr>
    `;

    const params = {
      uf: document.getElementById('filtro-uf').value,
      municipio: document.getElementById('filtro-municipio').value,
      zona: document.getElementById('filtro-zona').value,
      secao: document.getElementById('filtro-secao').value,
      status: document.getElementById('filtro-status').value
    };

    try {
      const res = await Api.getSecoes(params);
      if (res.sucesso) {
        totalSecoesCount.textContent = `${res.total} seções encontradas`;
        renderTabelaSecoes(res.secoes);
      }
    } catch (err) {
      tabelaSecoesCorpo.innerHTML = `
        <tr>
          <td colspan="7" class="py-8 text-center text-red-500">
            Erro ao carregar dados do painel de auditoria.
          </td>
        </tr>
      `;
    }
  }

  function renderTabelaSecoes(secoes) {
    if (!secoes || secoes.length === 0) {
      tabelaSecoesCorpo.innerHTML = `
        <tr>
          <td colspan="7" class="py-8 text-center text-slate-400">
            Nenhuma seção eleitoral encontrada para os filtros selecionados.
          </td>
        </tr>
      `;
      return;
    }

    tabelaSecoesCorpo.innerHTML = '';
    secoes.forEach(s => {
      const isDivergente = s.status_auditoria === 'DIVERGENTE';
      const tr = document.createElement('tr');
      tr.className = `border-b border-slate-100 text-sm hover:bg-slate-50 transition-colors ${isDivergente ? 'row-divergente' : ''}`;

      const statusBadge = isDivergente
        ? `<span class="px-2.5 py-1 rounded-full text-xs badge-divergente">⚠️ Divergente (${s.total_envios} envios)</span>`
        : `<span class="px-2.5 py-1 rounded-full text-xs badge-validado">✓ Validado (${s.total_envios} envio)</span>`;

      tr.innerHTML = `
        <td class="py-3 px-4 font-bold text-slate-900">${s.uf}</td>
        <td class="py-3 px-4 text-slate-800">${s.municipio}</td>
        <td class="py-3 px-4 font-mono font-medium">${s.zona}</td>
        <td class="py-3 px-4 font-mono font-bold text-blue-700">${s.secao}</td>
        <td class="py-3 px-4 text-slate-600">${s.comparecimento_ultimo ? s.comparecimento_ultimo.toLocaleString('pt-BR') : '-'}</td>
        <td class="py-3 px-4">${statusBadge}</td>
        <td class="py-3 px-4 text-right">
          <button class="px-3 py-1 bg-slate-800 text-white rounded text-xs font-medium hover:bg-blue-700 transition btn-ver-detalhes" data-id="${s.id}">
            Inspecionar
          </button>
        </td>
      `;

      tabelaSecoesCorpo.appendChild(tr);
    });

    // Eventos do botão inspecionar
    tabelaSecoesCorpo.querySelectorAll('.btn-ver-detalhes').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openSecaoModal(id);
      });
    });
  }

  async function openSecaoModal(id) {
    modalDetalhes.classList.remove('hidden');
    modalTitulo.textContent = 'Carregando detalhes da seção...';
    modalConteudo.innerHTML = `
      <div class="py-12 text-center text-slate-500">
        <span class="animate-spin inline-block text-2xl mb-2">🔄</span>
        <p>Buscando Boletins de Urna e comparando hashes...</p>
      </div>
    `;

    try {
      const res = await Api.getSecaoDetails(id);
      if (res.sucesso) {
        const { secao, boletins } = res;
        modalTitulo.innerHTML = `
          ${secao.municipio} - ${secao.uf} &nbsp;|&nbsp; 
          <span class="text-blue-600 font-mono">Zona ${secao.zona}</span> &nbsp;|&nbsp; 
          <span class="text-blue-600 font-mono">Seção ${secao.secao}</span>
        `;

        let html = `
          <div class="space-y-6">
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div><span class="text-slate-500 block">Status:</span> <strong>${secao.status_auditoria}</strong></div>
              <div><span class="text-slate-500 block">Total de Envios:</span> <strong>${secao.total_envios}</strong></div>
              <div><span class="text-slate-500 block">Local de Votação:</span> <strong>${secao.local_votacao || 'Zona Urbana'}</strong></div>
              <div><span class="text-slate-500 block">Última Atualização:</span> <strong>${new Date(secao.updated_at).toLocaleString('pt-BR')}</strong></div>
            </div>
        `;

        if (secao.status_auditoria === 'DIVERGENTE') {
          html += `
            <div class="p-4 rounded-xl bg-red-50 border border-red-300 text-red-900 text-sm">
              <strong class="font-bold flex items-center gap-2">⚠️ DIVERGÊNCIA IDENTIFICADA:</strong>
              Existem registros submetidos por voluntários diferentes com contagens de votos discrepantes. Confira as fotos e os dados de cada envio abaixo para auditoria pública.
            </div>
          `;
        }

        html += `<h4 class="font-bold text-slate-800 text-sm border-b pb-2">Boletins de Urna Submetidos (${boletins.length})</h4>`;

        boletins.forEach((b, index) => {
          html += `
            <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-4">
              <div class="flex flex-wrap items-center justify-between gap-2 border-b pb-2 text-xs">
                <span class="font-bold text-slate-800">Envio #${index + 1} — ID: ${b.id}</span>
                <span class="text-slate-500">${new Date(b.created_at).toLocaleString('pt-BR')}</span>
                <span class="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-600">SHA-256: ${b.imagem_sha256 ? b.imagem_sha256.substring(0, 16) + '...' : 'N/A'}</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div>
                  <p class="text-xs font-semibold text-slate-700 mb-1">Foto Original do BU:</p>
                  ${b.imagem_url 
                    ? `<a href="${b.imagem_url}" target="_blank"><img src="${b.imagem_url}" class="max-h-56 rounded-lg border object-cover w-full hover:opacity-90 transition"></a>`
                    : `<div class="h-32 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400">Sem imagem anexada</div>`}
                </div>
                <div>
                  <p class="text-xs font-semibold text-slate-700 mb-1">Dados Apurados:</p>
                  <div class="text-xs space-y-1 bg-slate-50 p-3 rounded-lg border">
                    <div class="flex justify-between"><span>Aptos:</span> <strong>${b.aptos}</strong></div>
                    <div class="flex justify-between"><span>Comparecimento:</span> <strong>${b.comparecimento}</strong></div>
                    <div class="flex justify-between"><span>Faltosos:</span> <strong>${b.faltosos}</strong></div>
                    <div class="flex justify-between"><span>Brancos:</span> <strong>${b.brancos}</strong></div>
                    <div class="flex justify-between"><span>Nulos:</span> <strong>${b.nulos}</strong></div>
                  </div>

                  <p class="text-xs font-semibold text-slate-700 mt-3 mb-1">Votação por Candidato:</p>
                  <div class="max-h-36 overflow-y-auto border rounded-lg">
                    <table class="w-full text-[11px] text-left">
                      <thead class="bg-slate-100 text-slate-600">
                        <tr>
                          <th class="py-1 px-2">Cargo</th>
                          <th class="py-1 px-2">Candidato</th>
                          <th class="py-1 px-2 text-right">Votos</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${(b.votos || []).map(v => `
                          <tr class="border-t">
                            <td class="py-1 px-2 text-slate-500">${v.cargo}</td>
                            <td class="py-1 px-2 font-medium">${v.nome_candidato || v.numero_candidato}</td>
                            <td class="py-1 px-2 text-right font-bold">${v.quantidade_votos}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          `;
        });

        html += `</div>`;
        modalConteudo.innerHTML = html;
      }
    } catch (err) {
      modalConteudo.innerHTML = `<p class="text-red-500 text-center py-6">Falha ao carregar detalhes da seção.</p>`;
    }
  }

  if (btnFecharModal) {
    btnFecharModal.addEventListener('click', () => {
      modalDetalhes.classList.add('hidden');
    });
  }
});
