/* MMA Masters · Salvador — comportamento do site (topo, rodapé, combo, grade, aula experimental, rolagem). */
(function () {
  'use strict';
  var C = MM.CASA, esc = MM.esc;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var pagina = document.body.getAttribute('data-pagina') || '';
  var escolhidas = [];   // modalidades do "por que escolher só uma?"

  /* ---------------- topo ---------------- */
  function topo() {
    var el = $('#topo'); if (!el) return;
    var links = [['index.html#modalidades', 'Modalidades', 'inicio'], ['horarios.html', 'Horários', 'horarios'], ['aluno.html', 'Área do aluno', 'aluno']];
    el.innerHTML = '<a class="pular" href="#conteudo">Pular para o conteúdo</a><header class="topo"><div class="embrulho">' +
      '<a class="marca" href="index.html" aria-label="MMA Masters, início"><img src="fotos/selo.jpg" alt="" width="44" height="44"><span>MMA<b>Masters</b></span></a>' +
      '<button class="abre-menu" aria-expanded="false" aria-controls="menu">Menu</button>' +
      '<nav class="menu" id="menu" aria-label="Principal">' + links.map(function (l) { return '<a href="' + l[0] + '"' + (pagina === l[2] ? ' aria-current="page"' : '') + '>' + l[1] + '</a>'; }).join('') +
      '<a class="bt bt-vermelho" href="' + (pagina === 'inicio' ? '' : 'index.html') + '#experimental">Aula experimental</a></nav></div></header>';
    var bt = $('.abre-menu', el), menu = $('#menu', el);
    bt.addEventListener('click', function () { var ab = menu.classList.toggle('aberto'); bt.setAttribute('aria-expanded', ab); bt.textContent = ab ? 'Fechar' : 'Menu'; });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { menu.classList.remove('aberto'); bt.setAttribute('aria-expanded', false); bt.textContent = 'Menu'; }); });
  }

  function rodape() {
    var el = $('#rodape'); if (!el) return;
    el.className = 'rodape';
    el.innerHTML = '<div class="embrulho">' +
      '<div><h3>MMA <span class="vermelho">Masters</span></h3><p>' + esc(C.cidade) + '<br>' + MM.MODALIDADES.map(function (m) { return m.nome; }).join(' · ') + '<br>Kids e adulto · ' + esc(C.lema) + '</p></div>' +
      '<div><h3>Onde</h3><p>' + (C.endereco ? esc(C.endereco) + '<br>' : '') + (C.bairro ? esc(C.bairro) + ' · ' : '') + esc(C.cidade) + '<br><a href="' + MM.linkMapa() + '" target="_blank" rel="noopener">Abrir no mapa</a></p></div>' +
      '<div><h3>Fale com a gente</h3><p><a href="' + MM.linkWa('Olá! Quero saber mais sobre a MMA Masters.') + '" target="_blank" rel="noopener">WhatsApp da recepção</a><br>Instagram <a href="https://instagram.com/' + C.instagram + '" target="_blank" rel="noopener">@' + C.instagram + '</a></p></div>' +
      '<p class="fim">' + C.valores.join(' · ') + '<br><a href="aluno.html">Área do aluno</a> · <a href="admin.html">Painel da academia</a> · Demonstração feita pela Zync</p></div>';
  }

  /* ---------------- combo: por que escolher só uma? ---------------- */
  function combo() {
    var box = $('#botoes-mod'); if (!box) return;
    box.innerHTML = MM.MODALIDADES.map(function (m) { return '<button type="button" data-mod="' + m.id + '" aria-pressed="false">' + m.nome + '</button>'; }).join('');
    $$('button', box).forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-mod'), i = escolhidas.indexOf(id);
        if (i >= 0) escolhidas.splice(i, 1); else escolhidas.push(id);
        b.setAttribute('aria-pressed', i < 0);
        placar();
      });
    });
    placar();
  }
  function placar() {
    var el = $('#placar'); if (!el) return;
    var n = escolhidas.length;
    var nomes = escolhidas.map(function (id) { return MM.mod(id).nome; });
    el.innerHTML = '<div class="num">' + n + '<small>' + (n === 1 ? 'modalidade' : 'modalidades') + '</small></div>' +
      '<p>' + (n === 0 ? 'Toque nas modalidades que você quer experimentar.' : n === 1 ? 'Boa escolha: ' + nomes[0] + '. E por que escolher apenas uma?' : 'Seu treino: ' + nomes.join(' + ') + '.') + '</p>' +
      '<a class="bt bt-vermelho bt-largo" href="#experimental" id="levar-combo">' + (n ? 'Marcar aula experimental' : 'Quero uma aula experimental') + '</a>';
    $('#levar-combo').addEventListener('click', function () {
      $$('#experimental input[name=mods]').forEach(function (c) { c.checked = escolhidas.indexOf(c.value) >= 0; });
    });
  }

  /* ---------------- modalidades ---------------- */
  function modalidades() {
    var el = $('#lista-luta'); if (!el) return;
    el.innerHTML = MM.MODALIDADES.map(function (m, i) {
      return '<div class="luta entra-lado"><span class="n">' + String(i + 1).padStart(2, '0') + '</span><h3>' + m.nome + '</h3><div><p>' + esc(m.desc) + '</p><a class="ver" href="horarios.html?mod=' + m.id + '">Ver horários de ' + m.nome + '</a></div></div>';
    }).join('');
  }

  /* ---------------- grade ---------------- */
  function grade() {
    var el = $('#grade'); if (!el) return;
    var qs = new URLSearchParams(location.search);
    var f = { mod: qs.get('mod') || '', turma: qs.get('turma') || '' };
    var fm = $('#filtro-mod'), ft = $('#filtro-turma');
    fm.innerHTML = '<button type="button" data-v="" aria-pressed="true">Todas</button>' + MM.MODALIDADES.map(function (m) { return '<button type="button" data-v="' + m.id + '" aria-pressed="false">' + m.nome + '</button>'; }).join('');
    ft.innerHTML = '<button type="button" data-v="" aria-pressed="true">Todas as turmas</button>' + MM.TURMAS.map(function (t) { return '<button type="button" data-v="' + t.id + '" aria-pressed="false">' + t.nome + '</button>'; }).join('');
    function marca(box, v) { $$('button', box).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-v') === v); }); }
    $$('button', fm).forEach(function (b) { b.addEventListener('click', function () { f.mod = b.getAttribute('data-v'); desenha(); }); });
    $$('button', ft).forEach(function (b) { b.addEventListener('click', function () { f.turma = b.getAttribute('data-v'); desenha(); }); });
    function desenha() {
      marca(fm, f.mod); marca(ft, f.turma);
      var g = MM.grade().filter(function (a) { return (!f.mod || a.mod === f.mod) && (!f.turma || a.turma === f.turma); });
      var hj = new Date().getDay(), ordem = [1, 2, 3, 4, 5, 6, 0];
      el.innerHTML = ordem.map(function (d) {
        var aulas = g.filter(function (a) { return a.dia === d; });
        return '<div class="dia' + (d === hj ? ' hoje' : '') + '"><h3>' + MM.DIAS[d] + '</h3>' + (aulas.length ? aulas.map(function (a) {
          return '<div class="aula"><span class="h">' + a.hora.replace(':00', 'h') + '</span><b>' + MM.mod(a.mod).nome + '</b><span class="t ' + a.turma + '">' + MM.turma(a.turma) + '</span>' + (a.prof ? '<div class="h">' + esc(a.prof) + '</div>' : '') + '</div>';
        }).join('') : '<p class="vazio">Sem aula' + (f.mod || f.turma ? ' neste filtro' : '') + '</p>') + '</div>';
      }).join('');
    }
    desenha();
  }

  /* ---------------- aula experimental ---------------- */
  function experimental() {
    var el = $('#form-exp'); if (!el) return;
    var qs = new URLSearchParams(location.search);
    el.innerHTML = '<form class="ficha" novalidate>' +
      '<fieldset><legend>Quais modalidades você quer experimentar?</legend><div class="marcas">' +
      MM.MODALIDADES.map(function (m) { return '<label><input type="checkbox" name="mods" value="' + m.id + '"' + (qs.get('mod') === m.id ? ' checked' : '') + '><span>' + m.nome + '</span></label>'; }).join('') + '</div></fieldset>' +
      '<fieldset><legend>Para qual turma?</legend><div class="marcas">' +
      MM.TURMAS.map(function (t, i) { return '<label><input type="radio" name="turma" value="' + t.id + '"' + ((qs.get('turma') || 'adulto') === t.id ? ' checked' : '') + '><span>' + t.nome + '</span></label>'; }).join('') + '</div></fieldset>' +
      '<div class="campos">' +
      '<div class="campo"><label for="x-nome">Seu nome</label><input type="text" id="x-nome" autocomplete="name"></div>' +
      '<div class="campo" data-kids><label for="x-idade">Idade da criança</label><input type="number" id="x-idade" min="3" max="17" inputmode="numeric"></div>' +
      '<div class="campo"><label for="x-quando">Melhor período</label><select id="x-quando"><option>Manhã</option><option>Meio-dia</option><option>Tarde</option><option selected>Noite</option><option>Sábado</option></select></div>' +
      '<div class="campo"><label for="x-data">A partir de</label><input type="date" id="x-data" min="' + MM.hoje() + '" value="' + MM.soma(MM.hoje(), 1) + '"></div>' +
      '<div class="campo todo"><label for="x-obs">Já treinou alguma luta? <span class="aviso">(opcional)</span></label><input type="text" id="x-obs" placeholder="Ex.: nunca treinei / fiz 1 ano de jiu-jítsu"></div>' +
      '</div><button class="bt bt-vermelho bt-largo" type="submit">Marcar pelo WhatsApp</button>' +
      '<p class="aviso" style="margin:12px 0 0">A mensagem abre pronta no WhatsApp da recepção, que confirma o dia e o horário com você.</p>' +
      (C.whatsappPlaceholder ? '<span class="placeholder-wa">Demonstração: número de WhatsApp provisório</span>' : '') +
      '<div class="saida" aria-live="polite"></div></form>';
    var f = $('form', el);
    function kids() { var k = f.querySelector('input[name=turma]:checked').value === 'kids'; $('[data-kids]', f).hidden = !k; $('label[for=x-nome]', f).textContent = k ? 'Nome do responsável' : 'Seu nome'; }
    $$('input[name=turma]', f).forEach(function (r) { r.addEventListener('change', kids); }); kids();
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var saida = $('.saida', f), nome = $('#x-nome').value.trim();
      var mods = $$('input[name=mods]:checked', f).map(function (c) { return c.value; });
      if (!mods.length) { saida.innerHTML = '<p class="erro">Escolha pelo menos uma modalidade.</p>'; return; }
      if (!nome) { saida.innerHTML = '<p class="erro">Escreva seu nome.</p>'; $('#x-nome').focus(); return; }
      var turma = f.querySelector('input[name=turma]:checked').value;
      var x = MM.addExperimental({ nome: nome, tel: '', mods: mods, turma: turma, idade: turma === 'kids' ? $('#x-idade').value : '', quando: $('#x-quando').value, data: $('#x-data').value || MM.hoje(), obs: $('#x-obs').value.trim() });
      var msg = 'Olá! Quero fazer uma aula experimental na MMA Masters.\n\nModalidade' + (mods.length > 1 ? 's' : '') + ': ' + mods.map(function (m) { return MM.mod(m).nome; }).join(' + ') +
        '\nTurma: ' + MM.turma(turma) + (x.idade ? ' (' + x.idade + ' anos)' : '') + '\nNome: ' + nome + '\nMelhor período: ' + x.quando + '\nA partir de: ' + MM.dataCurta(x.data) + (x.obs ? '\nExperiência: ' + x.obs : '');
      var link = MM.linkWa(msg);
      saida.innerHTML = '<div class="ok">Pedido anotado. Se o WhatsApp não abriu, <a href="' + link + '" target="_blank" rel="noopener">toque aqui</a>.</div>';
      window.open(link, '_blank', 'noopener');
    });
  }

  /* ---------------- rolagem ---------------- */
  function rolagem() {
    var reduz = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } });
    }, { threshold: .15 }) : null;
    $$('.surge, .entra-lado').forEach(function (el) { if (io && !reduz) io.observe(el); else el.classList.add('visto'); });
    if (reduz) return;
    var desl = $$('[data-desliza]'), giros = $$('[data-gira]'), pend = false;
    function move() {
      pend = false;
      var vh = window.innerHeight, y = window.scrollY;
      desl.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var prog = (vh - r.top) / (vh + r.height);
        var vel = parseFloat(el.getAttribute('data-desliza')) || 1;
        var larg = Math.max(0, el.scrollWidth - el.parentElement.clientWidth);
        var x = vel > 0 ? -prog * larg : -(1 - prog) * larg;
        el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
      });
      giros.forEach(function (el) { el.style.transform = 'rotate(' + (y * (parseFloat(el.getAttribute('data-gira')) || .2)).toFixed(1) + 'deg)'; });
    }
    window.addEventListener('scroll', function () { if (!pend) { pend = true; requestAnimationFrame(move); } }, { passive: true });
    window.addEventListener('resize', move);
    move();
  }

  topo();
  rodape();
  combo();
  modalidades();
  grade();
  experimental();
  rolagem();
})();
