/* Criação de conta de aluno (cadastro.html). */
(function () {
  'use strict';
  LT.ui.iniciar(null);
  const erro = document.getElementById('erro');
  document.getElementById('form-cadastro').addEventListener('submit', e => {
    e.preventDefault();
    const nome = document.getElementById('nome').value.trim(), email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value, conf = document.getElementById('confirmar').value;
    let msg = '';
    if (!nome) msg = 'Informe seu nome.';
    else if (senha.length < 6) msg = 'A senha precisa ter pelo menos 6 caracteres.';
    else if (senha !== conf) msg = 'A confirmação não é igual à senha.';
    else { const r = LT.cadastrarUsuario({ nome, email, senha, perfil: 'aluno' }); if (r.erro) msg = r.erro; }
    if (msg) { erro.textContent = msg; erro.hidden = false; return; }
    LT.ui.flash('sucesso', 'Conta criada. Entre com seu e-mail e senha.'); location.href = 'index.html';
  });
})();
