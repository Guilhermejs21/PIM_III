/* LuminaTech - dados DEMONSTRATIVOS no localStorage do navegador.
   Não é banco de dados: não há servidor, API ou segurança real. */
(function (global) {
  'use strict';
  const CHAVE = 'luminatech.dados.v1';
  const SESSAO = 'luminatech.sessao.v1';
  const MAX_TENTATIVAS = 3;   // regra preservada do projeto anterior
  const NOTA_MINIMA = 6;      // regra preservada do projeto anterior
  const CURSOS = ['Lógica de Programação', 'Introdução ao C#', 'Banco de Dados com SQL Server', 'Fundamentos de UX e UI', 'Análise de Dados Básica'];
  let cache = null;

  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nota = n => (Math.round(n * 10) / 10).toFixed(1).replace('.', ',');
  const dois = n => String(n).padStart(2, '0');
  const data = iso => { const d = new Date(iso); return `${dois(d.getDate())}/${dois(d.getMonth() + 1)}/${d.getFullYear()} ${dois(d.getHours())}:${dois(d.getMinutes())}`; };

  function diasAtras(n, h) { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(h || 14, 20, 0, 0); return d.toISOString(); }
  const questao = (id, enunciado, certa, textos) => ({ id, enunciado, alternativas: textos.map((t, i) => ({ id: i + 1, texto: t, correta: i === certa })) });

  function avaliar(q, respostas) {
    let acertos = 0;
    q.questoes.forEach(qt => { const alt = qt.alternativas.find(a => a.id === respostas[qt.id]); if (alt && alt.correta) acertos++; });
    return { acertos, total: q.questoes.length, nota: q.questoes.length ? Math.round(acertos * 100 / q.questoes.length) / 10 : 0 };
  }

  function semente() {
    const professor = 2;
    const questionarios = [
      { id: 1, titulo: 'Avaliação de Lógica de Programação', curso: CURSOS[0], descricao: 'Conceitos básicos de algoritmos, variáveis e estruturas de controle.', status: 'aplicado', idProfessor: professor, criadoEm: diasAtras(30), questoes: [
        questao(101, 'Qual estrutura repete um bloco de código enquanto uma condição for verdadeira?', 1, ['if', 'while', 'switch', 'return']),
        questao(102, 'O que é uma variável?', 0, ['Um espaço da memória que guarda um valor', 'Um tipo de erro do compilador', 'Um comando de repetição', 'Um arquivo de texto']),
        questao(103, 'Qual é o resultado de 10 % 3 (resto da divisão)?', 2, ['3', '0', '1', '3,33']),
        questao(104, 'Qual operador lógico exige que as duas condições sejam verdadeiras?', 3, ['OU (||)', 'NÃO (!)', 'Igual (==)', 'E (&&)']),
        questao(105, 'Um algoritmo é:', 0, ['Uma sequência finita de passos para resolver um problema', 'Um tipo de hardware', 'Uma linguagem de programação específica', 'Um sistema operacional'])] },
      { id: 2, titulo: 'Avaliação de Introdução ao C#', curso: CURSOS[1], descricao: 'Classes, encapsulamento, herança e tipos de dados em C#.', status: 'aplicado', idProfessor: professor, criadoEm: diasAtras(28), questoes: [
        questao(201, 'Qual palavra-chave define uma classe em C#?', 2, ['namespace', 'interface', 'class', 'using']),
        questao(202, 'Qual conceito permite que uma classe reaproveite atributos e métodos de outra?', 0, ['Herança', 'Encapsulamento', 'Sobrecarga', 'Compilação']),
        questao(203, 'Qual modificador de acesso deixa um membro visível apenas dentro da própria classe?', 1, ['public', 'private', 'protected', 'internal']),
        questao(204, 'Qual tipo é mais adequado para armazenar um valor monetário em C#?', 3, ['int', 'bool', 'char', 'decimal']),
        questao(205, 'Qual método é a porta de entrada tradicional de um programa console em C#?', 0, ['Main', 'Start', 'Init', 'Run'])] },
      { id: 3, titulo: 'Avaliação de Banco de Dados com SQL Server', curso: CURSOS[2], descricao: 'Chaves, relacionamentos e comandos SQL básicos.', status: 'aplicado', idProfessor: professor, criadoEm: diasAtras(25), questoes: [
        questao(301, 'Qual comando SQL é usado para consultar dados de uma tabela?', 0, ['SELECT', 'INSERT', 'CREATE', 'GRANT']),
        questao(302, 'O que identifica de forma única cada registro de uma tabela?', 2, ['Chave estrangeira', 'Índice de texto', 'Chave primária', 'Visão (view)']),
        questao(303, 'Qual cláusula filtra os registros retornados por uma consulta?', 1, ['ORDER BY', 'WHERE', 'GROUP BY', 'FROM']),
        questao(304, 'Uma chave estrangeira serve para:', 3, ['Criptografar dados', 'Ordenar a tabela', 'Apagar registros', 'Relacionar uma tabela a outra']),
        questao(305, 'Qual comando remove registros de uma tabela?', 0, ['DELETE', 'SELECT', 'UPDATE', 'ALTER'])] }
    ];
    const usuarios = [
      { id: 1, nome: 'Administrador LuminaTech', email: 'admin@luminatech.com', senha: '123456', perfil: 'admin', ativo: true },
      { id: 2, nome: 'Marina Costa', email: 'professor@luminatech.com', senha: '123456', perfil: 'professor', ativo: true },
      { id: 3, nome: 'Aluno Demonstração', email: 'demo@luminatech.com', senha: '123456', perfil: 'aluno', ativo: true },
      { id: 4, nome: 'Ana Souza', email: 'ana@luminatech.com', senha: '123456', perfil: 'aluno', ativo: true },
      { id: 5, nome: 'Bruno Lima', email: 'bruno@luminatech.com', senha: '123456', perfil: 'aluno', ativo: true },
      { id: 6, nome: 'Carla Mendes', email: 'carla@luminatech.com', senha: '123456', perfil: 'aluno', ativo: true },
      { id: 7, nome: 'Diego Alves', email: 'diego@luminatech.com', senha: '123456', perfil: 'aluno', ativo: true }
    ];
    // [aluno, questionário, acertos, deslocamento, nº da tentativa, dias atrás]
    const planos = [[4, 1, 4, 0, 1, 20], [4, 2, 5, 1, 1, 14], [4, 3, 3, 2, 1, 9],
      [5, 1, 2, 1, 1, 19], [5, 1, 3, 2, 2, 16], [5, 2, 2, 3, 1, 12],
      [6, 1, 5, 0, 1, 18], [6, 3, 4, 3, 1, 8],
      [7, 1, 1, 0, 1, 17], [7, 1, 2, 4, 2, 15], [7, 1, 2, 2, 3, 13], [7, 2, 3, 0, 1, 6]];
    const tentativas = planos.map((p, i) => {
      const q = questionarios.find(x => x.id === p[1]); const n = q.questoes.length; const respostas = {};
      q.questoes.forEach((qt, k) => {
        const certa = ((k + p[3]) % n) < p[2];
        respostas[qt.id] = (certa ? qt.alternativas.find(a => a.correta) : qt.alternativas.find(a => !a.correta)).id;
      });
      const r = avaliar(q, respostas);
      return { id: i + 1, idAluno: p[0], idQuestionario: p[1], numero: p[4], nota: r.nota, acertos: r.acertos, total: r.total, data: diasAtras(p[5], 9 + i), aprovado: r.nota >= NOTA_MINIMA, respostas };
    });
    return { usuarios, questionarios, tentativas };
  }

  function dados() {
    if (cache) return cache;
    try { const t = localStorage.getItem(CHAVE); if (t) cache = JSON.parse(t); } catch (e) { /* segue com dados em memória */ }
    if (!cache) { cache = semente(); salvar(); }
    return cache;
  }
  function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(cache)); } catch (e) { /* sem localStorage: dados só nesta página */ } }
  const proximoId = lista => lista.reduce((m, x) => Math.max(m, x.id), 0) + 1;

  const LT = {
    MAX_TENTATIVAS, NOTA_MINIMA, CURSOS, esc, nota, data, avaliar,
    // ----- usuários e sessão -----
    usuarios: () => dados().usuarios,
    usuario: id => dados().usuarios.find(u => u.id === id),
    autenticar(email, senha) {
      const e = String(email).trim().toLowerCase();
      const u = dados().usuarios.find(x => x.email === e && x.senha === senha);
      if (!u) return { erro: 'E-mail ou senha incorretos.' };
      if (!u.ativo) return { erro: 'Este usuário está desativado. Procure o administrador.' };
      try { localStorage.setItem(SESSAO, String(u.id)); } catch (err) { /* ignora */ }
      return { usuario: u };
    },
    usuarioAtual() { try { const id = parseInt(localStorage.getItem(SESSAO), 10); const u = id ? LT.usuario(id) : null; return u && u.ativo ? u : null; } catch (e) { return null; } },
    sair() { try { localStorage.removeItem(SESSAO); } catch (e) { /* ignora */ } },
    cadastrarUsuario({ nome, email, senha, perfil }) {
      const d = dados(); const e = String(email).trim().toLowerCase();
      if (d.usuarios.some(u => u.email === e)) return { erro: 'Já existe um usuário com este e-mail.' };
      const u = { id: proximoId(d.usuarios), nome: String(nome).trim(), email: e, senha, perfil, ativo: true };
      d.usuarios.push(u); salvar(); return { usuario: u };
    },
    alternarAtivo(id) { const u = LT.usuario(id); if (u) { u.ativo = !u.ativo; salvar(); } },
    // ----- questionários -----
    questionarios: () => dados().questionarios,
    questionario: id => dados().questionarios.find(q => q.id === id),
    criarQuestionario({ titulo, curso, descricao, status, idProfessor, questoes }) {
      const d = dados(); let idQ = d.questionarios.reduce((m, q) => q.questoes.reduce((a, x) => Math.max(a, x.id), m), 0);
      const q = { id: proximoId(d.questionarios), titulo, curso, descricao, status, idProfessor, criadoEm: new Date().toISOString(),
        questoes: questoes.map(x => ({ id: ++idQ, enunciado: x.enunciado, alternativas: x.alternativas.map((a, i) => ({ id: i + 1, texto: a.texto, correta: a.correta })) })) };
      d.questionarios.push(q); salvar(); return q;
    },
    alterarStatus(id, status) { const q = LT.questionario(id); if (q) { q.status = status; salvar(); } },
    excluirQuestionario(id) {
      const d = dados(); if (d.tentativas.some(t => t.idQuestionario === id)) return false;
      d.questionarios = d.questionarios.filter(q => q.id !== id); salvar(); return true;
    },
    // ----- tentativas e respostas -----
    tentativas: () => dados().tentativas,
    tentativasDoAluno: id => dados().tentativas.filter(t => t.idAluno === id).sort((a, b) => b.data.localeCompare(a.data)),
    tentativa: id => dados().tentativas.find(t => t.id === id),
    contarTentativas: (idAluno, idQ) => dados().tentativas.filter(t => t.idAluno === idAluno && t.idQuestionario === idQ).length,
    registrarTentativa(idAluno, idQ, respostas) {
      const d = dados(); const q = LT.questionario(idQ);
      if (!q || q.status !== 'aplicado') return { erro: 'Este questionário não está disponível.' };
      const feitas = LT.contarTentativas(idAluno, idQ);
      if (feitas >= MAX_TENTATIVAS) return { erro: `Você atingiu o limite de ${MAX_TENTATIVAS} tentativas neste questionário.` };
      const r = avaliar(q, respostas);
      const t = { id: proximoId(d.tentativas), idAluno, idQuestionario: idQ, numero: feitas + 1, nota: r.nota, acertos: r.acertos, total: r.total, data: new Date().toISOString(), aprovado: r.nota >= NOTA_MINIMA, respostas };
      d.tentativas.push(t); salvar(); return { tentativa: t };
    },
    // Indicadores: regra fixa (média abaixo da nota mínima = precisa de apoio). Não é machine learning.
    indicadores(lista) {
      const n = lista.length; const ap = lista.filter(t => t.aprovado).length;
      const media = n ? Math.round(lista.reduce((s, t) => s + t.nota, 0) / n * 10) / 10 : 0;
      return { realizadas: n, aprovacoes: ap, reprovacoes: n - ap, media, taxa: n ? Math.round(ap * 100 / n) : 0, precisaApoio: n > 0 && media < NOTA_MINIMA };
    },
    restaurarDemo() { cache = semente(); salvar(); LT.sair(); }
  };
  global.LT = LT;
})(window);
