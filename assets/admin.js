/* Painel da MMA Masters — modo demo (localStorage). Login é só porta de vitrine. */
(function () {
  'use strict';
  var esc = MM.esc;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var corpo = $('#corpo');
  var est = { aba: new URLSearchParams(location.search).get('aba') || 'experimentais', fExp: 'abertas', fAl: 'ativos', editAl: null, editAula: null };

  function entrar() { $('#tela-login').hidden = true; $('#tela-painel').hidden = false; aba(est.aba); }
  try { if (sessionStorage.getItem('mm_logado')) entrar(); } catch (e) { /* */ }
  $('#form-login').addEventListener('submit', function (e) {
    e.preventDefault();
    if ($('#l-user').value.trim().toLowerCase() === 'recepcao' && $('#l-senha').value === 'masters') { try { sessionStorage.setItem('mm_logado', '1'); } catch (er) { /* */ } entrar(); }
    else $('#login-erro').innerHTML = '<p class="erro">Usuário ou senha não conferem. Use os dados de demonstração acima.</p>';
  });
  $('#sair').addEventListener('click', function () { try { sessionStorage.removeItem('mm_logado'); } catch (e) { /* */ } location.reload(); });
  $$('.adm-abas button').forEach(function (b) { b.addEventListener('click', function () { aba(b.getAttribute('data-aba')); }); });
  function aba(id) {
    est.aba = id;
    $$('.adm-abas button').forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-aba') === id); });
    ({ experimentais: experimentais, alunos: alunos, horarios: horarios, avisos: avisos, ajustes: ajustes }[id] || experimentais)();
    window.scrollTo(0, 0);
  }
  function mods(l) { return (l || []).map(function (m) { return MM.mod(m).nome; }).join(' + '); }
  function wa(tel) { tel = String(tel || '').replace(/\D/g, ''); return tel.length <= 11 ? '55' + tel : tel; }

  /* ---------- aulas experimentais ---------- */
  var STX = { nova: 'Nova', agendada: 'Agendada', veio: 'Veio', matriculou: 'Matriculou', faltou: 'Não veio' };
  function experimentais() {
    var todas = MM.experimentais();
    var lista = todas.filter(function (x) {
      if (est.fExp === 'abertas') return ['nova', 'agendada', 'veio'].indexOf(x.status) >= 0;
      if (est.fExp === 'fechadas') return ['matriculou', 'faltou'].indexOf(x.status) >= 0;
      return true;
    }).sort(function (a, b) { return a.data.localeCompare(b.data); });
    var conta = function (s) { return todas.filter(function (x) { return x.status === s; }).length; };
    var feitas = conta('veio') + conta('matriculou');
    corpo.innerHTML = '<h2>Aulas experimentais</h2>' +
      '<div class="resumo"><div><b>' + conta('nova') + '</b>novas para responder</div><div><b>' + conta('agendada') + '</b>agendadas</div><div><b>' + feitas + '</b>vieram treinar</div><div><b>' + (feitas ? Math.round(conta('matriculou') / feitas * 100) : 0) + '%</b>viraram matrícula</div></div>' +
      '<div class="filtros">' + [['abertas', 'Em aberto'], ['fechadas', 'Concluídas'], ['todas', 'Todas']].map(function (f) { return '<button type="button" data-f="' + f[0] + '" aria-pressed="' + (est.fExp === f[0]) + '">' + f[1] + '</button>'; }).join('') + '</div>' +
      '<div class="caixa">' + (lista.length ? lista.map(function (x) {
        var nome = x.nome.replace(/ \(exemplo\)$/, '');
        var msg = 'Olá, ' + nome + '! Aqui é da MMA Masters. Recebemos seu pedido de aula experimental de ' + mods(x.mods) + '. Qual dia fica melhor para você?';
        return '<div class="linha-adm"><div><div class="t">' + esc(x.nome) + ' · ' + mods(x.mods) + ' <span class="st st-' + x.status + '">' + STX[x.status] + '</span></div>' +
          '<div class="s">Turma ' + MM.turma(x.turma) + (x.idade ? ' (' + esc(x.idade) + ' anos)' : '') + ' · ' + esc(x.quando) + ' · a partir de ' + MM.dataCurta(x.data) + (x.obs ? '<br>' + esc(x.obs) : '') + (!x.tel ? '<br><i>Veio pelo site: o contato chega no WhatsApp da recepção.</i>' : '') + '</div></div>' +
          '<div class="acoes">' + Object.keys(STX).filter(function (s) { return s !== x.status && s !== 'nova'; }).map(function (s) { return '<button class="mini-bt' + (s === 'matriculou' ? ' forte' : s === 'faltou' ? ' perigo' : '') + '" data-st="' + s + '" data-id="' + x.id + '">' + STX[s] + '</button>'; }).join('') +
          (x.tel ? '<a class="mini-bt" target="_blank" rel="noopener" href="https://wa.me/' + wa(x.tel) + '?text=' + encodeURIComponent(msg) + '">WhatsApp</a>' : '') + '</div></div>';
      }).join('') : '<p>Nada por aqui.</p>') + '</div>';
    $$('[data-f]').forEach(function (b) { b.addEventListener('click', function () { est.fExp = b.getAttribute('data-f'); experimentais(); }); });
    $$('[data-st]').forEach(function (b) {
      b.addEventListener('click', function () {
        var st = b.getAttribute('data-st'), id = b.getAttribute('data-id'), l = MM.experimentais(), x;
        l.forEach(function (i) { if (i.id === id) { i.status = st; x = i; } });
        MM.grava('experimentais', l);
        if (st === 'matriculou' && x && confirm('Cadastrar ' + x.nome + ' como aluno agora?')) {
          var al = MM.alunos(); al.push({ id: MM.novoId(), nome: x.nome, tel: x.tel || '', turma: x.turma, mods: x.mods.slice(), desde: MM.hoje(), ativo: true, presencas: [] }); MM.grava('alunos', al);
        }
        experimentais();
      });
    });
  }

  /* ---------- alunos ---------- */
  function alunos() {
    var todos = MM.alunos(), h = MM.hoje(), mes = h.slice(0, 7), ed = est.editAl;
    var lista = todos.filter(function (a) {
      if (est.fAl === 'ativos') return a.ativo;
      if (est.fAl === 'sumidos') return a.ativo && !a.presencas.some(function (d) { return d >= MM.soma(h, -14); });
      if (MM.TURMAS.some(function (t) { return t.id === est.fAl; })) return a.ativo && a.turma === est.fAl;
      return true;
    });
    var al = ed === 'novo' ? { id: '', nome: '', tel: '', turma: 'adulto', mods: [], desde: h, ativo: true, presencas: [] } : todos.filter(function (a) { return a.id === ed; })[0];
    corpo.innerHTML = '<h2>Alunos</h2>' +
      '<div class="resumo"><div><b>' + todos.filter(function (a) { return a.ativo; }).length + '</b>ativos</div>' + MM.TURMAS.map(function (t) { return '<div><b>' + todos.filter(function (a) { return a.ativo && a.turma === t.id; }).length + '</b>' + t.nome.toLowerCase() + '</div>'; }).join('') + '</div>' +
      (al ? formAluno(al) : '<p><button class="bt bt-vermelho" id="novo-al" type="button">Cadastrar aluno</button></p>') +
      '<div class="filtros">' + [['ativos', 'Ativos'], ['sumidos', 'Sem treinar há 14 dias'], ['adulto', 'Adulto'], ['kids', 'Kids'], ['feminino', 'Feminino'], ['todos', 'Todos']].map(function (f) { return '<button type="button" data-f="' + f[0] + '" aria-pressed="' + (est.fAl === f[0]) + '">' + f[1] + '</button>'; }).join('') + '</div>' +
      '<div class="caixa">' + (lista.length ? lista.map(function (a) {
        var noMes = a.presencas.filter(function (d) { return d.slice(0, 7) === mes; }).length;
        var ult = a.presencas.slice().sort().pop();
        var veioHoje = a.presencas.indexOf(h) >= 0;
        return '<div class="linha-adm"><div><div class="t">' + esc(a.nome) + (a.ativo ? '' : ' <span class="st st-faltou">inativo</span>') + (a.id === 'demo' ? ' <span class="st st-agendada">login da área do aluno</span>' : '') + '</div>' +
          '<div class="s">' + MM.turma(a.turma) + ' · ' + mods(a.mods) + ' · ' + noMes + ' treino(s) no mês' + (ult ? ' · último ' + MM.dataCurta(ult) : ' · ainda não treinou') + '</div></div>' +
          '<div class="acoes"><button class="mini-bt' + (veioHoje ? '' : ' forte') + '" data-pres="' + a.id + '">' + (veioHoje ? 'Tirar presença' : 'Presença hoje') + '</button><button class="mini-bt" data-ed="' + a.id + '">Editar</button>' +
          (a.tel ? '<a class="mini-bt" target="_blank" rel="noopener" href="https://wa.me/' + wa(a.tel) + '">WhatsApp</a>' : '') + '</div></div>';
      }).join('') : '<p>Nenhum aluno neste filtro.</p>') + '</div>';
    var n = $('#novo-al'); if (n) n.addEventListener('click', function () { est.editAl = 'novo'; alunos(); });
    $$('[data-f]').forEach(function (b) { b.addEventListener('click', function () { est.fAl = b.getAttribute('data-f'); alunos(); }); });
    $$('[data-ed]').forEach(function (b) { b.addEventListener('click', function () { est.editAl = b.getAttribute('data-ed'); alunos(); }); });
    $$('[data-pres]').forEach(function (b) {
      b.addEventListener('click', function () {
        var l = MM.alunos(); l.forEach(function (a) { if (a.id === b.getAttribute('data-pres')) { var i = a.presencas.indexOf(h); if (i >= 0) a.presencas.splice(i, 1); else a.presencas.push(h); } });
        MM.grava('alunos', l); alunos();
      });
    });
    var f = $('#f-al');
    if (f) {
      $('#cancela-al').addEventListener('click', function () { est.editAl = null; alunos(); });
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var nome = $('#a-nome').value.trim(); if (!nome) { $('#a-nome').focus(); return; }
        var novo = Object.assign({}, al, { nome: nome, tel: $('#a-tel').value.replace(/\D/g, ''), turma: $('#a-turma').value, mods: $$('input[name=a-mod]:checked', f).map(function (c) { return c.value; }), ativo: $('#a-ativo').checked });
        var l = MM.alunos();
        if (!novo.id) { novo.id = MM.novoId(); l.push(novo); } else l = l.map(function (a) { return a.id === novo.id ? novo : a; });
        MM.grava('alunos', l); est.editAl = null; alunos();
      });
    }
  }
  function formAluno(a) {
    return '<div class="caixa"><h3>' + (a.id ? 'Editar aluno' : 'Novo aluno') + '</h3><form class="form-adm" id="f-al">' +
      '<div class="campo"><label for="a-nome">Nome</label><input type="text" id="a-nome" value="' + esc(a.nome) + '"></div>' +
      '<div class="campo"><label for="a-tel">WhatsApp</label><input type="tel" id="a-tel" inputmode="numeric" value="' + esc(a.tel) + '"></div>' +
      '<div class="campo"><label for="a-turma">Turma</label><select id="a-turma">' + MM.TURMAS.map(function (t) { return '<option value="' + t.id + '"' + (t.id === a.turma ? ' selected' : '') + '>' + t.nome + '</option>'; }).join('') + '</select></div>' +
      '<div class="campo"><label class="checks" style="margin-top:34px"><input type="checkbox" id="a-ativo"' + (a.ativo ? ' checked' : '') + '> Aluno ativo</label></div>' +
      '<div class="campo todo"><label>Modalidades</label><div class="checks">' + MM.MODALIDADES.map(function (m) { return '<label><input type="checkbox" name="a-mod" value="' + m.id + '"' + (a.mods.indexOf(m.id) >= 0 ? ' checked' : '') + '> ' + m.nome + '</label>'; }).join('') + '</div></div>' +
      '<div class="todo" style="display:flex;gap:10px;flex-wrap:wrap"><button class="bt bt-vermelho" type="submit">Salvar</button><button class="mini-bt" type="button" id="cancela-al">Cancelar</button></div></form></div>';
  }

  /* ---------- horários (grade) ---------- */
  function horarios() {
    var g = MM.grade(), ed = est.editAula, ordem = [1, 2, 3, 4, 5, 6, 0];
    var au = ed === 'novo' ? { id: '', dia: 1, hora: '19:00', mod: 'mma', turma: 'adulto', prof: '' } : g.filter(function (x) { return x.id === ed; })[0];
    corpo.innerHTML = '<h2>Grade de horários</h2><p>O que muda aqui aparece na página de horários e na área do aluno. <b>A grade inicial é de exemplo:</b> troque pelos horários reais.</p>' +
      (au ? '<div class="caixa"><h3>' + (au.id ? 'Editar aula' : 'Nova aula') + '</h3><form class="form-adm" id="f-aula">' +
        '<div class="campo"><label for="g-dia">Dia</label><select id="g-dia">' + ordem.map(function (d) { return '<option value="' + d + '"' + (d === au.dia ? ' selected' : '') + '>' + MM.DIAS_L[d] + '</option>'; }).join('') + '</select></div>' +
        '<div class="campo"><label for="g-hora">Hora (ex.: 19:00)</label><input type="text" id="g-hora" value="' + au.hora + '" inputmode="numeric"></div>' +
        '<div class="campo"><label for="g-mod">Modalidade</label><select id="g-mod">' + MM.MODALIDADES.map(function (m) { return '<option value="' + m.id + '"' + (m.id === au.mod ? ' selected' : '') + '>' + m.nome + '</option>'; }).join('') + '</select></div>' +
        '<div class="campo"><label for="g-turma">Turma</label><select id="g-turma">' + MM.TURMAS.map(function (t) { return '<option value="' + t.id + '"' + (t.id === au.turma ? ' selected' : '') + '>' + t.nome + '</option>'; }).join('') + '</select></div>' +
        '<div class="campo todo"><label for="g-prof">Professor (opcional)</label><input type="text" id="g-prof" value="' + esc(au.prof) + '"></div>' +
        '<div class="todo" style="display:flex;gap:10px;flex-wrap:wrap"><button class="bt bt-vermelho" type="submit">Salvar</button><button class="mini-bt" type="button" id="cancela-aula">Cancelar</button>' + (au.id ? '<button class="mini-bt perigo" type="button" id="exclui-aula">Excluir aula</button>' : '') + '</div></form></div>'
        : '<p><button class="bt bt-vermelho" id="nova-aula" type="button">Adicionar aula</button></p>') +
      ordem.map(function (d) {
        var aulas = g.filter(function (x) { return x.dia === d; });
        return '<div class="caixa"><h3>' + MM.DIAS_L[d] + '</h3>' + (aulas.length ? aulas.map(function (x) {
          return '<div class="linha-adm"><div><div class="t">' + x.hora + ' · ' + MM.mod(x.mod).nome + '</div><div class="s">Turma ' + MM.turma(x.turma) + (x.prof ? ' · ' + esc(x.prof) : '') + '</div></div><div class="acoes"><button class="mini-bt" data-aula="' + x.id + '">Editar</button></div></div>';
        }).join('') : '<p class="s">Sem aula.</p>') + '</div>';
      }).join('');
    var n = $('#nova-aula'); if (n) n.addEventListener('click', function () { est.editAula = 'novo'; horarios(); });
    $$('[data-aula]').forEach(function (b) { b.addEventListener('click', function () { est.editAula = b.getAttribute('data-aula'); horarios(); }); });
    var f = $('#f-aula');
    if (f) {
      $('#cancela-aula').addEventListener('click', function () { est.editAula = null; horarios(); });
      var ex = $('#exclui-aula'); if (ex) ex.addEventListener('click', function () { if (!confirm('Excluir esta aula da grade?')) return; MM.grava('grade', MM.grade().filter(function (x) { return x.id !== au.id; })); est.editAula = null; horarios(); });
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var hora = $('#g-hora').value.trim().replace('h', ':').replace(/^(\d)(:)/, '0$1$2');
        if (!/^\d{2}:\d{2}$/.test(hora)) hora = /^\d{1,2}$/.test(hora) ? String(hora).padStart(2, '0') + ':00' : '';
        if (!hora) { $('#g-hora').focus(); return; }
        var novo = Object.assign({}, au, { dia: +$('#g-dia').value, hora: hora, mod: $('#g-mod').value, turma: $('#g-turma').value, prof: $('#g-prof').value.trim() });
        var l = MM.grade();
        if (!novo.id) { novo.id = MM.novoId(); l.push(novo); } else l = l.map(function (x) { return x.id === novo.id ? novo : x; });
        MM.grava('grade', l); est.editAula = null; horarios();
      });
    }
  }

  /* ---------- avisos ---------- */
  function avisos() {
    var av = MM.avisos();
    corpo.innerHTML = '<h2>Avisos</h2><p>Aparecem na área do aluno, do mais novo para o mais antigo.</p>' +
      '<div class="caixa"><form class="form-adm" id="f-av"><div class="campo todo"><label for="v-txt">Novo aviso</label><textarea id="v-txt" placeholder="Ex.: sábado tem treino especial de MMA às 9h"></textarea></div><div class="todo"><button class="bt bt-vermelho" type="submit">Publicar aviso</button></div></form></div>' +
      '<div class="caixa">' + (av.length ? av.map(function (x) { return '<div class="linha-adm"><div><div class="s">' + MM.dataCurta(x.data) + '</div><div>' + esc(x.texto) + '</div></div><div class="acoes"><button class="mini-bt perigo" data-del="' + x.id + '">Apagar</button></div></div>'; }).join('') : '<p>Nenhum aviso.</p>') + '</div>';
    $('#f-av').addEventListener('submit', function (e) {
      e.preventDefault(); var t = $('#v-txt').value.trim(); if (!t) return;
      var l = MM.avisos(); l.push({ id: MM.novoId(), data: MM.hoje(), texto: t }); MM.grava('avisos', l); avisos();
    });
    $$('[data-del]').forEach(function (b) { b.addEventListener('click', function () { MM.grava('avisos', MM.avisos().filter(function (x) { return x.id !== b.getAttribute('data-del'); })); avisos(); }); });
  }

  /* ---------- ajustes ---------- */
  function ajustes() {
    var C = MM.CASA;
    corpo.innerHTML = '<h2>Ajustes</h2><div class="caixa"><h3>Dados da academia</h3><p><b>WhatsApp da recepção:</b> ' + (C.whatsappPlaceholder ? '<span class="st st-nova">provisório, falta o número real</span>' : C.whatsapp) +
      '<br><b>Endereço:</b> ' + (C.endereco || '<i>a confirmar</i>') + '<br><b>Instagram:</b> @' + C.instagram + '</p><p class="s">Para mudar estes dados, peça à Zync (ficam em assets/dados.js).</p></div>' +
      '<div class="caixa"><h3>Modo demonstração</h3><p>Tudo fica só neste aparelho. Na versão final, alunos, grade e experimentais ficam num banco na nuvem e o painel e a área do aluno funcionam em qualquer celular.</p><button class="mini-bt perigo" id="reset" type="button">Voltar aos dados de exemplo</button></div>';
    $('#reset').addEventListener('click', function () { if (confirm('Apagar o que foi feito e voltar aos exemplos?')) { MM.semear(true); aba('experimentais'); } });
  }
})();
