/* Elementos comuns: topo, rodapé, controle de perfil e mensagens entre páginas. */
(function () {
  'use strict';
  const E = LT.esc;
  const HOME = { aluno: 'aluno.html', professor: 'professor.html', admin: 'admin.html' };
  const NOME_PERFIL = { aluno: 'Aluno', professor: 'Professor', admin: 'Administrador' };
  const MENUS = {
    aluno: [['aluno.html', 'Meu painel']],
    professor: [['professor.html', 'Questionários'], ['questionario-novo.html', 'Novo questionário'], ['relatorios.html', 'Relatórios']],
    admin: [['admin.html', 'Usuários'], ['relatorios.html', 'Relatórios']]
  };
  const pagina = () => location.pathname.split('/').pop() || 'index.html';

  function topo(u) {
    const links = u ? MENUS[u.perfil].map(([h, t]) => `<a href="${h}"${h === pagina() ? ' aria-current="page"' : ''}>${t}</a>`).join('') : '';
    const lado = u
      ? `<span class="menu-usuario">${E(u.nome)} (${NOME_PERFIL[u.perfil]})</span><button type="button" class="btn btn-contorno btn-pequeno" id="btn-sair">Sair</button>`
      : '<a href="index.html">Entrar</a><a href="cadastro.html" class="btn btn-pequeno">Criar conta</a>';
    document.getElementById('topo').innerHTML = `<div class="topo-conteudo"><a class="marca" href="${u ? HOME[u.perfil] : 'index.html'}" aria-label="LuminaTech - página inicial"><span class="marca-icone" aria-hidden="true">✦</span> LuminaTech</a><nav class="menu" aria-label="Navegação principal">${links}${lado}</nav></div>`;
    const sair = document.getElementById('btn-sair');
    if (sair) sair.addEventListener('click', () => { LT.sair(); location.href = 'index.html'; });
  }

  function rodape() {
    document.getElementById('rodape').innerHTML = '<p>LuminaTech · Projeto acadêmico PIM III · UNIP · ADS</p><p>Versão de demonstração: os dados ficam salvos somente neste navegador (localStorage). Não é um banco de dados real, não há servidor e a autenticação é simplificada. Coletamos apenas nome, e-mail e senha.</p>';
  }

  function flashExibir() {
    try {
      const f = JSON.parse(sessionStorage.getItem('lt.flash') || 'null'); if (!f) return;
      sessionStorage.removeItem('lt.flash');
      document.getElementById('conteudo').insertAdjacentHTML('afterbegin', `<div class="alerta alerta-${f.tipo}" role="${f.tipo === 'erro' ? 'alert' : 'status'}">${E(f.texto)}</div>`);
    } catch (e) { /* ignora */ }
  }

  LT.ui = {
    home: perfil => HOME[perfil] || 'index.html',
    param: nome => new URLSearchParams(location.search).get(nome),
    flash(tipo, texto) { try { sessionStorage.setItem('lt.flash', JSON.stringify({ tipo, texto })); } catch (e) { /* ignora */ } },
    // Retorna o usuário logado, ou null se a página redirecionou (perfil sem permissão).
    iniciar(perfis) {
      const u = LT.usuarioAtual();
      if (perfis) {
        if (!u) { location.replace('index.html'); return null; }
        if (perfis.indexOf(u.perfil) < 0) { location.replace(HOME[u.perfil]); return null; }
      }
      topo(u); rodape(); flashExibir(); return u;
    },
    selo: (ok, a, b) => `<span class="selo ${ok ? 'selo-ok' : 'selo-ruim'}">${ok ? a : b}</span>`,
    barra: (valor, ok) => `<div class="barra" role="img" aria-label="${LT.nota(valor)} de 10"><span class="${ok ? 'barra-ok' : 'barra-ruim'}" data-largura="${Math.round(valor * 10)}"></span></div>`,
    barraPct: (pct, ok) => `<div class="barra" role="img" aria-label="${pct}%"><span class="${ok ? 'barra-ok' : 'barra-ruim'}" data-largura="${pct}"></span></div>`,
    larguras(raiz) { raiz.querySelectorAll('[data-largura]').forEach(el => { el.style.width = el.getAttribute('data-largura') + '%'; }); },
    mostrar(html) { const app = document.getElementById('app'); app.innerHTML = html; LT.ui.larguras(app); }
  };
})();
