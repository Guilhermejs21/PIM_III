/* Aplicação do questionário ao aluno: exibe as questões e registra as respostas. */
(function () {
  'use strict';
  const u = LT.ui.iniciar(['aluno']); if (!u) return;
  const E = LT.esc;
  const id = parseInt(LT.ui.param('id'), 10), q = LT.questionario(id);
  const voltar = (msg) => { LT.ui.flash('erro', msg); location.replace('aluno.html'); };
  if (!q || q.status !== 'aplicado') return voltar('Este questionário não está disponível.');
  const feitas = LT.contarTentativas(u.id, q.id);
  if (feitas >= LT.MAX_TENTATIVAS) return voltar(`Você atingiu o limite de ${LT.MAX_TENTATIVAS} tentativas neste questionário.`);

  const blocos = q.questoes.map((qt, i) => `<fieldset class="cartao questao"><legend>Questão ${i + 1} de ${q.questoes.length}</legend>
    <p class="enunciado">${E(qt.enunciado)}</p>
    ${qt.alternativas.map(a => `<div class="alternativa"><input type="radio" id="q${qt.id}_${a.id}" name="q_${qt.id}" value="${a.id}" required><label for="q${qt.id}_${a.id}">${E(a.texto)}</label></div>`).join('')}</fieldset>`).join('');

  LT.ui.mostrar(`<header class="cabecalho-pagina"><h1>${E(q.titulo)}</h1>
    <p class="texto-suave">${E(q.curso)} · Tentativa ${feitas + 1} de ${LT.MAX_TENTATIVAS}. Marque uma alternativa em cada questão e envie ao final.</p></header>
    <form id="prova" class="prova" novalidate>${blocos}
      <p class="progresso" id="progresso" aria-live="polite"></p>
      <div class="alerta alerta-erro" id="erro" role="alert" hidden></div>
      <div class="acoes"><button type="submit" class="btn btn-grande">Enviar respostas</button><a class="btn btn-contorno btn-grande" href="aluno.html">Cancelar</a></div></form>`);

  const form = document.getElementById('prova'), prog = document.getElementById('progresso'), erro = document.getElementById('erro');
  const respostas = () => { const r = {}; q.questoes.forEach(qt => { const m = form.querySelector(`input[name="q_${qt.id}"]:checked`); if (m) r[qt.id] = parseInt(m.value, 10); }); return r; };
  const atualizar = () => { prog.textContent = `${Object.keys(respostas()).length} de ${q.questoes.length} questões respondidas`; };
  form.addEventListener('change', atualizar); atualizar();
  form.addEventListener('submit', e => {
    e.preventDefault();
    const r = respostas(), faltam = q.questoes.length - Object.keys(r).length;
    if (faltam > 0) { erro.textContent = `Responda todas as questões antes de enviar. Faltam ${faltam}.`; erro.hidden = false; return; }
    const res = LT.registrarTentativa(u.id, q.id, r);
    if (res.erro) return voltar(res.erro);
    location.href = 'resultado.html?id=' + res.tentativa.id;
  });
})();
