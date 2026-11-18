/* Resultado de uma tentativa, com as respostas registradas. */
(function () {
  'use strict';
  const u = LT.ui.iniciar(['aluno']); if (!u) return;
  const E = LT.esc, N = LT.nota;
  const t = LT.tentativa(parseInt(LT.ui.param('id'), 10));
  if (!t || t.idAluno !== u.id) { LT.ui.flash('erro', 'Resultado não encontrado.'); location.replace('aluno.html'); return; }
  const q = LT.questionario(t.idQuestionario);
  const restam = Math.max(0, LT.MAX_TENTATIVAS - LT.contarTentativas(u.id, t.idQuestionario));
  const disponivel = q && q.status === 'aplicado';
  // O gabarito só aparece quando não há mais tentativas ou o aluno foi aprovado.
  const mostrarGabarito = restam === 0 || t.aprovado;

  const revisao = q ? q.questoes.map((qt, i) => {
    const esc = qt.alternativas.find(a => a.id === t.respostas[qt.id]), certa = qt.alternativas.find(a => a.correta), ok = !!esc && esc.correta;
    return `<li class="revisao-item ${ok ? 'revisao-ok' : 'revisao-ruim'}"><p class="enunciado">${i + 1}. ${E(qt.enunciado)}</p>
      <p>Sua resposta: <strong>${esc ? E(esc.texto) : 'não respondida'}</strong> — ${ok ? 'correta' : 'incorreta'}.</p>
      ${!ok && mostrarGabarito ? `<p>Resposta correta: <strong>${E(certa.texto)}</strong></p>` : ''}</li>`;
  }).join('') : '';

  LT.ui.mostrar(`<section class="cartao resultado ${t.aprovado ? 'resultado-ok' : 'resultado-ruim'}">
    <p class="etiqueta">${q ? E(q.titulo) : 'Questionário removido'} · Tentativa ${t.numero} de ${LT.MAX_TENTATIVAS} · ${LT.data(t.data)}</p>
    <h1>${t.aprovado ? 'Parabéns, você foi aprovado!' : 'Você não atingiu a nota mínima'}</h1>
    <p class="resultado-nota">${N(t.nota)}<span> / 10</span></p>
    <p>Você acertou <strong>${t.acertos}</strong> de <strong>${t.total}</strong> questões. Nota mínima para aprovação: ${N(LT.NOTA_MINIMA)}.</p>
    <p>${restam > 0 ? `Você ainda tem <strong>${restam}</strong> ${restam === 1 ? 'tentativa' : 'tentativas'} neste questionário.` : `Você atingiu o limite de ${LT.MAX_TENTATIVAS} tentativas neste questionário.`}</p>
    <div class="acoes">${restam > 0 && disponivel ? `<a class="btn" href="responder.html?id=${q.id}">Tentar novamente</a>` : ''}<a class="btn btn-contorno" href="aluno.html">Voltar ao meu painel</a></div></section>
    ${q ? `<section class="cartao" aria-labelledby="t-rev"><h2 id="t-rev">Suas respostas</h2>${mostrarGabarito ? '' : '<p class="texto-suave">As respostas corretas aparecem quando você for aprovado ou usar todas as tentativas.</p>'}<ol class="revisao">${revisao}</ol></section>` : ''}`);
})();
