/* Painel do aluno: questionários disponíveis, indicadores e histórico. */
(function () {
  'use strict';
  const u = LT.ui.iniciar(['aluno']); if (!u) return;
  const E = LT.esc, N = LT.nota, UI = LT.ui;
  const ts = LT.tentativasDoAluno(u.id), ind = LT.indicadores(ts);
  const disponiveis = LT.questionarios().filter(q => q.status === 'aplicado');
  const titulo = id => { const q = LT.questionario(id); return q ? q.titulo : 'Questionário removido'; };

  const cards = disponiveis.map(q => {
    const feitas = LT.contarTentativas(u.id, q.id), restam = Math.max(0, LT.MAX_TENTATIVAS - feitas);
    const minhas = ts.filter(t => t.idQuestionario === q.id), melhor = minhas.length ? Math.max(...minhas.map(t => t.nota)) : null;
    const acao = restam === 0 ? '<span class="selo selo-ruim">Limite de tentativas atingido</span>'
      : `<a class="btn btn-bloco" href="responder.html?id=${q.id}">${feitas ? 'Tentar novamente' : 'Responder questionário'} (restam ${restam})</a>`;
    return `<article class="cartao curso"><h3>${E(q.titulo)}</h3><p class="texto-suave">${E(q.curso)}</p><p>${E(q.descricao)}</p>
      <ul class="meta"><li>${q.questoes.length} questões</li><li>Tentativas usadas: ${feitas} de ${LT.MAX_TENTATIVAS}</li><li>Melhor nota: ${melhor === null ? '-' : N(melhor)}</li></ul>${acao}</article>`;
  }).join('');

  const linhas = ts.map(t => `<tr><td>${LT.data(t.data)}</td><td>${E(titulo(t.idQuestionario))}</td><td>${t.numero}</td>
    <td><div class="nota-celula"><strong>${N(t.nota)}</strong>${UI.barra(t.nota, t.aprovado)}</div></td>
    <td>${UI.selo(t.aprovado, 'Aprovado', 'Reprovado')}</td><td><a href="resultado.html?id=${t.id}">Ver resultado</a></td></tr>`).join('');

  UI.mostrar(`
    <header class="cabecalho-pagina"><h1>Olá, ${E(u.nome)}</h1><p class="texto-suave">Responda aos questionários e acompanhe seu desempenho.</p></header>
    ${ind.precisaApoio ? `<div class="alerta alerta-aviso" role="status">Sua média está abaixo de ${N(LT.NOTA_MINIMA)}. Revise o conteúdo e use as tentativas restantes (até ${LT.MAX_TENTATIVAS} por questionário).</div>` : ''}
    <section class="grade grade-4" aria-label="Indicadores">
      <div class="indicador"><span class="indicador-valor">${disponiveis.length}</span><span class="indicador-nome">Questionários disponíveis</span></div>
      <div class="indicador"><span class="indicador-valor">${ind.realizadas}</span><span class="indicador-nome">Avaliações realizadas</span></div>
      <div class="indicador"><span class="indicador-valor">${ind.realizadas ? N(ind.media) : '-'}</span><span class="indicador-nome">Média de desempenho</span></div>
      <div class="indicador"><span class="indicador-valor">${ind.realizadas ? ind.taxa + '%' : '-'}</span><span class="indicador-nome">Taxa de aprovação</span></div>
    </section>
    <section class="grade grade-2" aria-label="Aprovações e reprovações">
      <div class="indicador indicador-ok"><span class="indicador-valor">${ind.aprovacoes}</span><span class="indicador-nome">Aprovações</span></div>
      <div class="indicador indicador-ruim"><span class="indicador-valor">${ind.reprovacoes}</span><span class="indicador-nome">Reprovações</span></div>
    </section>
    <section aria-labelledby="t-disp"><h2 id="t-disp">Questionários disponíveis</h2>
      <p class="texto-suave">Até ${LT.MAX_TENTATIVAS} tentativas por questionário. Nota mínima para aprovação: ${N(LT.NOTA_MINIMA)}.</p>
      ${cards ? `<div class="grade grade-3">${cards}</div>` : '<p class="cartao">Nenhum questionário foi aplicado ainda. Volte mais tarde.</p>'}
    </section>
    <section class="cartao" aria-labelledby="t-hist"><h2 id="t-hist">Histórico de avaliações</h2>
      ${ts.length ? `<div class="tabela-rolagem"><table class="tabela"><thead><tr><th scope="col">Data</th><th scope="col">Questionário</th><th scope="col">Tentativa</th><th scope="col">Nota</th><th scope="col">Situação</th><th scope="col"><span class="so-leitor">Detalhes</span></th></tr></thead><tbody>${linhas}</tbody></table></div>`
        : '<p class="texto-suave">Você ainda não respondeu nenhum questionário. Escolha um acima para começar.</p>'}
    </section>`);
})();
