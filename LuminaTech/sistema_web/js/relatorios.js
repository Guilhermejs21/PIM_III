/* Relatórios de desempenho (professor: seus questionários; administrador: todos). */
(function () {
  'use strict';
  const u = LT.ui.iniciar(['professor', 'admin']); if (!u) return;
  const E = LT.esc, N = LT.nota, UI = LT.ui;
  const meus = LT.questionarios().filter(q => u.perfil === 'admin' || q.idProfessor === u.id);
  let filtro = UI.param('q') || 'todos', alunoSel = null;
  if (filtro !== 'todos' && !meus.some(q => String(q.id) === filtro)) filtro = 'todos';

  const sel = document.getElementById('filtro');
  sel.innerHTML = '<option value="todos">Todos os questionários</option>' + meus.map(q => `<option value="${q.id}">${E(q.titulo)}</option>`).join('');
  sel.value = filtro;
  sel.addEventListener('change', () => { filtro = sel.value; alunoSel = null; render(); });
  document.getElementById('btn-imprimir').addEventListener('click', () => window.print());

  function render() {
    const qs = filtro === 'todos' ? meus : meus.filter(q => String(q.id) === filtro);
    const ids = new Set(qs.map(q => q.id));
    const ts = LT.tentativas().filter(t => ids.has(t.idQuestionario));
    const geral = LT.indicadores(ts);
    const alunos = LT.usuarios().filter(a => a.perfil === 'aluno').map(a => {
      const tl = ts.filter(t => t.idAluno === a.id); return { a, tl, ind: LT.indicadores(tl) };
    }).filter(x => x.a.ativo || x.tl.length);
    const participantes = alunos.filter(x => x.tl.length), apoio = participantes.filter(x => x.ind.precisaApoio);

    // índice de acerto por questão
    const questoes = [];
    qs.forEach(q => q.questoes.forEach(qt => {
      const rs = ts.filter(t => t.idQuestionario === q.id);
      if (!rs.length) return;
      const ac = rs.filter(t => { const a = qt.alternativas.find(x => x.id === t.respostas[qt.id]); return a && a.correta; }).length;
      questoes.push({ q, qt, pct: Math.round(ac * 100 / rs.length), total: rs.length });
    }));
    questoes.sort((a, b) => a.pct - b.pct);
    const listaQuestoes = filtro === 'todos' ? questoes.slice(0, 5) : questoes;

    const porQ = qs.map(q => { const tl = ts.filter(t => t.idQuestionario === q.id); return { q, tl, ind: LT.indicadores(tl), alunos: new Set(tl.map(t => t.idAluno)).size }; });
    const comTentativas = porQ.filter(x => x.tl.length);

    // pontos de atenção (regras fixas, sem machine learning)
    const pontos = [];
    if (!ts.length) pontos.push('Ainda não há tentativas registradas neste filtro.');
    else {
      if (apoio.length) pontos.push(`${apoio.length} de ${participantes.length} alunos estão com média abaixo de ${N(LT.NOTA_MINIMA)} e podem precisar de apoio: ${apoio.map(x => E(x.a.nome)).join(', ')}.`);
      else pontos.push(`Nenhum aluno está com média abaixo de ${N(LT.NOTA_MINIMA)}.`);
      if (questoes.length && questoes[0].pct < 60) pontos.push(`A questão com menor índice de acerto é “${E(questoes[0].qt.enunciado)}” (${E(questoes[0].q.titulo)}), com ${questoes[0].pct}% de acertos. Vale retomar esse conteúdo.`);
      if (filtro === 'todos' && comTentativas.length > 1) { const pior = comTentativas.slice().sort((a, b) => a.ind.media - b.ind.media)[0]; pontos.push(`O questionário com menor média é “${E(pior.q.titulo)}” (${N(pior.ind.media)}).`); }
    }

    const linhasAluno = alunos.map(x => `<tr><td>${E(x.a.nome)}</td><td>${x.tl.length}</td>
      <td>${x.tl.length ? `<div class="nota-celula"><strong>${N(x.ind.media)}</strong>${UI.barra(x.ind.media, !x.ind.precisaApoio)}</div>` : '-'}</td>
      <td>${x.ind.aprovacoes} / ${x.ind.reprovacoes}</td>
      <td>${x.tl.length ? UI.selo(!x.ind.precisaApoio, 'Bom desempenho', 'Precisa de apoio') : '<span class="selo selo-neutro">Sem avaliações</span>'}</td>
      <td>${x.tl.length ? `<button class="btn btn-contorno btn-pequeno nao-imprimir" data-aluno="${x.a.id}">Ver detalhes</button>` : ''}</td></tr>`).join('');

    let detalhe = '';
    const ds = alunoSel && alunos.find(x => x.a.id === alunoSel);
    if (ds) {
      const hist = ds.tl.slice().sort((a, b) => b.data.localeCompare(a.data)).map(t => { const q = LT.questionario(t.idQuestionario);
        return `<tr><td>${LT.data(t.data)}</td><td>${E(q ? q.titulo : '-')}</td><td>${t.numero}</td><td>${N(t.nota)} (${t.acertos}/${t.total})</td><td>${UI.selo(t.aprovado, 'Aprovado', 'Reprovado')}</td></tr>`; }).join('');
      detalhe = `<section class="cartao" aria-labelledby="t-det"><h2 id="t-det">Detalhes de ${E(ds.a.nome)}</h2>
        <p>${ds.ind.realizadas} avaliações · média ${N(ds.ind.media)} · taxa de aprovação ${ds.ind.taxa}%</p>
        <div class="tabela-rolagem"><table class="tabela"><thead><tr><th scope="col">Data</th><th scope="col">Questionário</th><th scope="col">Tentativa</th><th scope="col">Nota</th><th scope="col">Situação</th></tr></thead><tbody>${hist}</tbody></table></div></section>`;
    }

    UI.mostrar(`
      <section class="grade grade-4" aria-label="Indicadores gerais">
        <div class="indicador"><span class="indicador-valor">${participantes.length}</span><span class="indicador-nome">Alunos participantes</span></div>
        <div class="indicador"><span class="indicador-valor">${geral.realizadas}</span><span class="indicador-nome">Avaliações realizadas</span></div>
        <div class="indicador"><span class="indicador-valor">${geral.realizadas ? N(geral.media) : '-'}</span><span class="indicador-nome">Média geral</span></div>
        <div class="indicador"><span class="indicador-valor">${geral.realizadas ? geral.taxa + '%' : '-'}</span><span class="indicador-nome">Taxa de aprovação</span></div>
      </section>
      <section class="cartao" aria-labelledby="t-pontos"><h2 id="t-pontos">Pontos de atenção</h2><ul class="pontos">${pontos.map(p => `<li>${p}</li>`).join('')}</ul>
        <p class="texto-suave">Regra fixa: média abaixo de ${N(LT.NOTA_MINIMA)} indica que o aluno pode precisar de apoio. Não usa machine learning.</p></section>
      ${filtro === 'todos' ? `<section class="cartao" aria-labelledby="t-q"><h2 id="t-q">Desempenho por questionário</h2><div class="tabela-rolagem"><table class="tabela"><thead><tr><th scope="col">Questionário</th><th scope="col">Alunos</th><th scope="col">Tentativas</th><th scope="col">Média</th><th scope="col">Aprovação</th></tr></thead><tbody>
        ${porQ.map(x => `<tr><td>${E(x.q.titulo)}</td><td>${x.alunos}</td><td>${x.tl.length}</td><td>${x.tl.length ? N(x.ind.media) : '-'}</td><td>${x.tl.length ? x.ind.taxa + '%' : '-'}</td></tr>`).join('')}</tbody></table></div></section>` : ''}
      <section class="cartao" aria-labelledby="t-al"><h2 id="t-al">Desempenho por aluno</h2><div class="tabela-rolagem"><table class="tabela"><thead><tr><th scope="col">Aluno</th><th scope="col">Tentativas</th><th scope="col">Média</th><th scope="col">Aprov. / reprov.</th><th scope="col">Situação</th><th scope="col"><span class="so-leitor">Detalhes</span></th></tr></thead><tbody>${linhasAluno}</tbody></table></div></section>
      ${detalhe}
      <section class="cartao" aria-labelledby="t-qt"><h2 id="t-qt">${filtro === 'todos' ? 'Questões com menor índice de acerto' : 'Índice de acerto por questão'}</h2>
        ${listaQuestoes.length ? `<ol class="revisao">${listaQuestoes.map(x => `<li><p class="enunciado">${E(x.qt.enunciado)}</p><p class="texto-suave">${filtro === 'todos' ? E(x.q.titulo) + ' · ' : ''}${x.total} ${x.total === 1 ? 'resposta' : 'respostas'}</p><div class="nota-celula"><strong>${x.pct}%</strong>${UI.barraPct(x.pct, x.pct >= 60)}</div></li>`).join('')}</ol>` : '<p class="texto-suave">Sem respostas registradas ainda.</p>'}</section>`);
  }

  document.getElementById('app').addEventListener('click', e => {
    const b = e.target.closest('[data-aluno]'); if (!b) return;
    alunoSel = parseInt(b.getAttribute('data-aluno'), 10); render();
    document.getElementById('t-det').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  render();
})();
