/* Criação de questionários de múltipla escolha (4 alternativas, 1 correta). */
(function () {
  'use strict';
  const u = LT.ui.iniciar(['professor']); if (!u) return;
  const lista = document.getElementById('lista-questoes'), erro = document.getElementById('erro');
  document.getElementById('curso').innerHTML = LT.CURSOS.map(c => `<option>${LT.esc(c)}</option>`).join('');
  let seq = 0;

  function novaQuestao() {
    const n = ++seq;
    lista.insertAdjacentHTML('beforeend', `<fieldset class="cartao questao" data-questao><legend>Questão <span data-num></span></legend>
      <div class="campo"><label for="en${n}">Enunciado</label><textarea id="en${n}" rows="2" data-enunciado></textarea></div>
      <p class="texto-suave">Preencha as quatro alternativas e marque a correta.</p>
      ${[0, 1, 2, 3].map(i => `<div class="alt-edicao"><input type="radio" name="correta${n}" value="${i}" aria-label="Marcar a alternativa ${i + 1} como correta"><input type="text" data-alt placeholder="Alternativa ${i + 1}" aria-label="Texto da alternativa ${i + 1}"></div>`).join('')}
      <button type="button" class="btn btn-contorno btn-pequeno" data-remover>Remover questão</button></fieldset>`);
    renumerar();
  }
  function renumerar() {
    const todas = lista.querySelectorAll('[data-questao]');
    todas.forEach((f, i) => { f.querySelector('[data-num]').textContent = i + 1; f.querySelector('[data-remover]').disabled = todas.length === 1; });
  }
  lista.addEventListener('click', e => { const b = e.target.closest('[data-remover]'); if (b && !b.disabled) { b.closest('[data-questao]').remove(); renumerar(); } });
  document.getElementById('add-questao').addEventListener('click', novaQuestao);

  document.getElementById('form-questionario').addEventListener('submit', e => {
    e.preventDefault();
    const status = e.submitter && e.submitter.value === 'aplicado' ? 'aplicado' : 'rascunho';
    const titulo = document.getElementById('titulo').value.trim(), erros = [], questoes = [];
    if (!titulo) erros.push('Informe o título do questionário.');
    lista.querySelectorAll('[data-questao]').forEach((f, i) => {
      const enun = f.querySelector('[data-enunciado]').value.trim(), textos = [...f.querySelectorAll('[data-alt]')].map(x => x.value.trim());
      const marcada = f.querySelector('input[type=radio]:checked');
      if (!enun) erros.push(`Questão ${i + 1}: escreva o enunciado.`);
      if (textos.some(t => !t)) erros.push(`Questão ${i + 1}: preencha as quatro alternativas.`);
      if (!marcada) erros.push(`Questão ${i + 1}: marque a alternativa correta.`);
      questoes.push({ enunciado: enun, alternativas: textos.map((t, k) => ({ texto: t, correta: !!marcada && parseInt(marcada.value, 10) === k })) });
    });
    if (erros.length) { erro.innerHTML = '<strong>Corrija antes de salvar:</strong><ul>' + erros.map(x => `<li>${LT.esc(x)}</li>`).join('') + '</ul>'; erro.hidden = false; erro.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    LT.criarQuestionario({ titulo, curso: document.getElementById('curso').value, descricao: document.getElementById('descricao').value.trim(), status, idProfessor: u.id, questoes });
    LT.ui.flash('sucesso', status === 'aplicado' ? 'Questionário criado e aplicado aos alunos.' : 'Questionário salvo como rascunho. Aplique-o aos alunos quando estiver pronto.');
    location.href = 'professor.html';
  });
  novaQuestao();
})();
