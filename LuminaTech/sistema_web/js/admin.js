/* Área do administrador: gerenciamento de usuários e perfis. */
(function () {
  'use strict';
  const u = LT.ui.iniciar(['admin']); if (!u) return;
  const E = LT.esc, NOME = { aluno: 'Aluno', professor: 'Professor', admin: 'Administrador' };
  const erro = document.getElementById('erro');

  function render() {
    const us = LT.usuarios();
    const cont = p => us.filter(x => x.perfil === p).length;
    document.getElementById('resumo').innerHTML = ['admin', 'professor', 'aluno'].map(p => `<div class="indicador"><span class="indicador-valor">${cont(p)}</span><span class="indicador-nome">${NOME[p]}${cont(p) === 1 ? '' : 's'}</span></div>`).join('');
    document.getElementById('usuarios').innerHTML = us.map(x => `<tr><td>${E(x.nome)}</td><td>${E(x.email)}</td><td>${NOME[x.perfil]}</td>
      <td>${LT.ui.selo(x.ativo, 'Ativo', 'Desativado')}</td>
      <td>${x.id === u.id ? '<span class="texto-suave">Você</span>' : `<button class="btn btn-contorno btn-pequeno" data-id="${x.id}">${x.ativo ? 'Desativar' : 'Ativar'}</button>`}</td></tr>`).join('');
  }
  document.getElementById('usuarios').addEventListener('click', e => {
    const b = e.target.closest('[data-id]'); if (!b) return;
    LT.alternarAtivo(parseInt(b.getAttribute('data-id'), 10)); render();
  });
  document.getElementById('form-usuario').addEventListener('submit', e => {
    e.preventDefault();
    const nome = document.getElementById('nome').value.trim(), email = document.getElementById('email').value.trim(), senha = document.getElementById('senha').value, perfil = document.getElementById('perfil').value;
    let msg = '';
    if (!nome) msg = 'Informe o nome.';
    else if (senha.length < 6) msg = 'A senha precisa ter pelo menos 6 caracteres.';
    else { const r = LT.cadastrarUsuario({ nome, email, senha, perfil }); if (r.erro) msg = r.erro; }
    erro.hidden = !msg; erro.textContent = msg;
    if (!msg) { e.target.reset(); render(); }
  });
  render();
})();
