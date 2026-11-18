/* Tela de entrada (index.html). */
(function () {
  'use strict';
  const atual = LT.usuarioAtual();
  if (atual) { location.replace(LT.ui.home(atual.perfil)); return; }
  LT.ui.iniciar(null);
  const erro = document.getElementById('erro');
  document.getElementById('form-login').addEventListener('submit', e => {
    e.preventDefault();
    const r = LT.autenticar(document.getElementById('email').value, document.getElementById('senha').value);
    if (r.erro) { erro.textContent = r.erro; erro.hidden = false; return; }
    location.href = LT.ui.home(r.usuario.perfil);
  });
  document.querySelectorAll('[data-demo]').forEach(b => b.addEventListener('click', () => {
    document.getElementById('email').value = b.getAttribute('data-demo');
    document.getElementById('senha').value = '123456';
    document.getElementById('senha').focus();
  }));
  document.getElementById('btn-restaurar').addEventListener('click', () => {
    if (confirm('Restaurar os dados de demonstração? Tudo o que foi criado neste navegador será apagado.')) {
      LT.restaurarDemo(); LT.ui.flash('sucesso', 'Dados de demonstração restaurados.'); location.reload();
    }
  });
})();
