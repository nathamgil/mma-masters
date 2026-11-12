/* =====================================================================
   MMA Masters · Salvador/BA — dados da academia + "banco" do modo demo.
   ÚNICO lugar com informação da academia. Site, área do aluno e painel leem daqui.
   Modo demo: tudo fica no navegador (localStorage, prefixo mm_).
   Regra: nada de preço, telefone, equipe, ano ou endereço inventado.
   ===================================================================== */
(function () {
  'use strict';

  var CASA = {
    nome: 'MMA Masters',
    cidade: 'Salvador · Bahia',
    bairro: '',                  // A CONFIRMAR: a triagem aponta Nazaré. Vazio = o site mostra só a cidade.
    endereco: '',                // A CONFIRMAR
    mapa: 'MMA Masters Salvador BA',
    // >>> PLACEHOLDER — NÃO É O NÚMERO DA ACADEMIA. Trocar pelo WhatsApp real da recepção antes de publicar. <<<
    whatsapp: '5571900000000',
    whatsappPlaceholder: true,
    instagram: 'mmamastersssa',
    lema: 'Treinando Campeões',                                          // bio
    valores: ['Respeito', 'Família', 'Integridade', 'Honra', 'Lealdade', 'Disciplina'] // selo da marca (foto de perfil)
  };

  // As 7 modalidades da bio. Descrições são do esporte em geral, não da academia.
  // tape = "card de luta": o que cada esporte usa (fato do esporte, não da academia).
  // pe = golpes em pé · queda = projeção/queda · chao = luta no chão · kimono · foto = foto real do @mmamastersssa que combina.
  var MODALIDADES = [
    { id: 'mma',    nome: 'MMA',        desc: 'Artes marciais mistas: em pé, na grade e no chão, tudo no mesmo treino.', tape: { pe: 1, queda: 1, chao: 1, kimono: 0 }, foto: 'fotos/treino-tatame.jpg', fotoAlt: 'Treino no tatame preto com o logo MMA Masters no chão' },
    { id: 'bjj',    nome: 'BJJ',        desc: 'Jiu-jítsu brasileiro, de kimono: raspagem, passagem, finalização.', tape: { pe: 0, queda: 1, chao: 1, kimono: 1 }, foto: 'fotos/bjj-kimono.jpg', fotoAlt: 'Dois alunos de kimono treinando jiu-jítsu no chão' },
    { id: 'muay',   nome: 'Muay Thai',  desc: 'A arte das oito armas: socos, chutes, joelhadas e cotoveladas.', tape: { pe: 1, queda: 0, chao: 0, kimono: 0 }, foto: 'fotos/sparring-jr-elefante.jpg', fotoAlt: 'Sparring de luvas em pé em frente à parede com a marca MMA Masters' },
    { id: 'wrestling', nome: 'Wrestling', desc: 'Queda, controle e base. O que decide quem fica por cima.', tape: { pe: 0, queda: 1, chao: 1, kimono: 0 }, foto: 'fotos/luta-em-pe.jpg', fotoAlt: 'Dois alunos treinando queda no tatame vermelho' },
    { id: 'kick',   nome: 'Kickboxing', desc: 'Socos e chutes em ritmo de round. Condicionamento lá em cima.', tape: { pe: 1, queda: 0, chao: 0, kimono: 0 }, foto: '', fotoAlt: '' },
    { id: 'judo',   nome: 'Judô',       desc: 'Projeção, equilíbrio e pegada. Disciplina desde a primeira aula.', tape: { pe: 0, queda: 1, chao: 1, kimono: 1 }, foto: '', fotoAlt: '' },
    { id: 'boxe',   nome: 'Boxe',       desc: 'Base, guarda, esquiva e combinação. Tem turma feminina.', tape: { pe: 1, queda: 0, chao: 0, kimono: 0 }, feminino: true, foto: 'fotos/feminino-boxe.jpg', fotoAlt: 'Aluna de costas com a camisa vermelha da MMA Masters' }
  ];

  var TURMAS = [
    { id: 'adulto',   nome: 'Adulto' },
    { id: 'kids',     nome: 'Kids' },
    { id: 'feminino', nome: 'Feminino' }
  ];

  var DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  var DIAS_L = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  // GRADE DE EXEMPLO — horários inventados para a demo. A academia confirma e edita no painel.
  var GRADE_EXEMPLO = [
    [1, '07:00', 'muay', 'adulto'], [3, '07:00', 'muay', 'adulto'], [5, '07:00', 'muay', 'adulto'],
    [1, '12:00', 'bjj', 'adulto'], [3, '12:00', 'bjj', 'adulto'], [5, '12:00', 'bjj', 'adulto'],
    [2, '12:00', 'wrestling', 'adulto'], [4, '12:00', 'wrestling', 'adulto'],
    [1, '17:00', 'judo', 'kids'], [3, '17:00', 'judo', 'kids'], [2, '17:00', 'bjj', 'kids'], [4, '17:00', 'bjj', 'kids'],
    [2, '18:00', 'boxe', 'feminino'], [4, '18:00', 'boxe', 'feminino'],
    [1, '19:00', 'mma', 'adulto'], [3, '19:00', 'mma', 'adulto'], [5, '19:00', 'mma', 'adulto'],
    [2, '19:00', 'kick', 'adulto'], [4, '19:00', 'kick', 'adulto'],
    [1, '20:00', 'boxe', 'adulto'], [3, '20:00', 'boxe', 'adulto'],
    [6, '09:00', 'mma', 'adulto'], [6, '10:00', 'bjj', 'adulto']
  ];

  /* ---------------- datas ---------------- */
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function deIso(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2], 12); }
  function hoje() { return iso(new Date()); }
  function soma(s, n) { var d = deIso(s); d.setDate(d.getDate() + n); return iso(d); }
  function dataCurta(s) { var d = deIso(s); return DIAS[d.getDay()].toLowerCase() + ' ' + String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0'); }

  /* ---------------- armazenamento ---------------- */
  var PFX = 'mm_';
  function le(k, pad) { try { var v = localStorage.getItem(PFX + k); return v ? JSON.parse(v) : pad; } catch (e) { return pad; } }
  function grava(k, v) { try { localStorage.setItem(PFX + k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function novoId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  /* ---------------- dados de exemplo ---------------- */
  function semear(forcar) {
    var VERSAO = 'semeado_v1';
    if (!forcar) { try { if (localStorage.getItem(PFX + VERSAO)) return; } catch (e) { return; } }
    var h = hoje(), t = new Date().toISOString();
    grava('grade', GRADE_EXEMPLO.map(function (g) { return { id: novoId(), dia: g[0], hora: g[1], mod: g[2], turma: g[3], prof: '' }; }));
    // alunos de EXEMPLO (fictícios). O aluno "demo" é o da área do aluno.
    grava('alunos', [
      { id: 'demo', nome: 'Aluno Demo (exemplo)', tel: '71900000010', turma: 'adulto', mods: ['muay', 'bjj'], desde: soma(h, -120), ativo: true, presencas: [soma(h, -1), soma(h, -3), soma(h, -6), soma(h, -8), soma(h, -10)] },
      { id: novoId(), nome: 'Carla M. (exemplo)', tel: '71900000011', turma: 'feminino', mods: ['boxe'], desde: soma(h, -40), ativo: true, presencas: [soma(h, -2), soma(h, -5)] },
      { id: novoId(), nome: 'Pedro, 9 anos (exemplo)', tel: '71900000012', turma: 'kids', mods: ['judo', 'bjj'], desde: soma(h, -200), ativo: true, presencas: [soma(h, -1), soma(h, -4), soma(h, -7)] },
      { id: novoId(), nome: 'Rafael S. (exemplo)', tel: '71900000013', turma: 'adulto', mods: ['mma', 'wrestling'], desde: soma(h, -15), ativo: true, presencas: [soma(h, -2)] },
      { id: novoId(), nome: 'Juliana P. (exemplo)', tel: '71900000014', turma: 'adulto', mods: ['kick'], desde: soma(h, -300), ativo: false, presencas: [] }
    ]);
    grava('experimentais', [
      { id: novoId(), nome: 'Lucas (exemplo)', tel: '71900000020', mods: ['mma', 'muay'], turma: 'adulto', idade: '', quando: 'Noite', data: soma(h, 1), status: 'nova', obs: 'Nunca treinou.', criado: t },
      { id: novoId(), nome: 'Ana (exemplo)', tel: '71900000021', mods: ['boxe'], turma: 'feminino', idade: '', quando: 'Noite', data: soma(h, 2), status: 'agendada', obs: '', criado: t },
      { id: novoId(), nome: 'Mãe do Davi (exemplo)', tel: '71900000022', mods: ['judo'], turma: 'kids', idade: '7', quando: 'Tarde', data: h, status: 'veio', obs: 'Gostou, quer saber de valores.', criado: t },
      { id: novoId(), nome: 'Mike (exemplo)', tel: '1555000000', mods: ['bjj'], turma: 'adulto', idade: '', quando: 'Manhã', data: soma(h, 3), status: 'nova', obs: 'Visitante estrangeiro, fala inglês.', criado: t }
    ]);
    grava('avisos', [
      { id: novoId(), data: h, texto: 'Grade de horários em atualização: confira com a recepção antes de vir. (exemplo)' },
      { id: novoId(), data: soma(h, -3), texto: 'Treino especial no sábado: tragam um amigo para a aula experimental. (exemplo)' }
    ]);
    try { localStorage.setItem(PFX + VERSAO, '1'); } catch (e) { /* */ }
  }

  /* ---------------- consultas ---------------- */
  function grade() { return le('grade', []).slice().sort(function (a, b) { return a.dia - b.dia || a.hora.localeCompare(b.hora); }); }
  function alunos() { return le('alunos', []); }
  function experimentais() { return le('experimentais', []); }
  function avisos() { return le('avisos', []).slice().sort(function (a, b) { return b.data.localeCompare(a.data); }); }
  function addExperimental(x) { var l = experimentais(); x.id = novoId(); x.status = 'nova'; x.criado = new Date().toISOString(); l.push(x); grava('experimentais', l); return x; }
  function mod(id) { return MODALIDADES.filter(function (m) { return m.id === id; })[0] || { id: id, nome: id }; }
  function turma(id) { return (TURMAS.filter(function (t) { return t.id === id; })[0] || { nome: id }).nome; }
  function linkWa(txt, numero) { return 'https://wa.me/' + (numero || CASA.whatsapp) + '?text=' + encodeURIComponent(txt); }
  function linkMapa() { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(CASA.mapa); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  semear(false);

  window.MM = {
    CASA: CASA, MODALIDADES: MODALIDADES, TURMAS: TURMAS, DIAS: DIAS, DIAS_L: DIAS_L,
    iso: iso, deIso: deIso, hoje: hoje, soma: soma, dataCurta: dataCurta,
    le: le, grava: grava, novoId: novoId, semear: semear,
    grade: grade, alunos: alunos, experimentais: experimentais, avisos: avisos, addExperimental: addExperimental,
    mod: mod, turma: turma, linkWa: linkWa, linkMapa: linkMapa, esc: esc
  };
})();
