/* Área do professor: questionários criados, aplicação aos alunos. */
(function () {
  'use strict';
  const u = LT.ui.iniciar(['professor']); if (!u) return;
  const E = LT.esc;
  const ROTULO = { rascunho: 'Rascunho', aplicado: 'Aplicado aos alunos', encerrado: 'Encerrado' };
  const CLASSE = { rascunho: 'selo-neutro', aplicado: 'selo-ok', encerrado: 'selo-ruim' };

  function render() {
    const lista = LT.questionarios().filter(q => q.idProfessor === u.id);
    const cards = lista.map(q => {
      const usos = LT.tentativas().filter(t => t.idQuestionario === q.id).length;
      const acoes = (q.status === 'rascunho' ? `<button class="btn btn-pequeno" data-acao="aplicado" data-id="${q.id}">Aplicar aos alunos</button>` : '')
        + (q.status === 'aplicado' ? `<button class="btn btn-contorno btn-pequeno" data-acao="encerrado" data-id="${q.id}">Encerrar</button>` : '')
        + (q.status === 'encerrado' ? `<button class="btn btn-pequeno" data-acao="aplicado" data-id="${q.id}">Reabrir</button>` : '')
        + `<a class="btn btn-contorno btn-pequeno" href="relatorios.html?q=${q.id}">Ver relatório</a>`
        + (usos === 0 ? `<button class="btn btn-contorno btn-pequeno" data-acao="excluir" data-id="${q.id}">Excluir</button>` : '');
      const questoes = q.questoes.map((qt, i) => `<li><p class="enunciado">${i + 1}. ${E(qt.enunciado)}</p><ul class="alts">${qt.alternativas.map(a => `<li class="${a.correta ? 'alt-correta' : ''}">${E(a.texto)}${a.correta ? ' <strong>(correta)</strong>' : ''}</li>`).join('')}</ul></li>`).join('');
      return `<article class="cartao"><div class="linha-titulo"><h3>${E(q.titulo)}</h3><span class="selo ${CLASSE[q.status]}">${ROTULO[q.status]}</span></div>
        <p class="texto-suave">${E(q.curso)} · ${q.questoes.length} questões · ${usos} ${usos === 1 ? 'tentativa registrada' : 'tentativas registradas'}</p>
        ${q.descricao ? `<p>${E(q.descricao)}</p>` : ''}
        <details><summary>Ver questões</summary><ol class="lista-questoes">${questoes}</ol></details>
        <div class="acoes">${acoes}</div></article>`;
    }).join('');
    LT.ui.mostrar(`<header class="cabecalho-pagina"><div class="linha-titulo"><div><h1>Meus questionários</h1><p class="texto-suave">Crie questionários e aplique-os aos alunos quando estiverem prontos.</p></div><a class="btn" href="questionario-novo.html">Novo questionário</a></div></header>
      ${cards || '<div class="cartao"><p>Você ainda não criou nenhum questionário.</p><a class="btn" href="questionario-novo.html">Criar o primeiro questionário</a></div>'}`);
  }

  document.getElementById('app').addEventListener('click', e => {
    const b = e.target.closest('[data-acao]'); if (!b) return;
    const id = parseInt(b.getAttribute('data-id'), 10), acao = b.getAttribute('data-acao');
    if (acao === 'excluir') {
      if (!confirm('Excluir este questionário? Esta ação não pode ser desfeita.')) return;
      LT.excluirQuestionario(id);
    } else LT.alterarStatus(id, acao);
    render();
  });
  render();
})();
