/* MMA Masters · Salvador — comportamento do site.
   Cenas de rolagem: "Entrada no octógono" (capa presa) e "card de luta" (modalidades em rolagem horizontal presa).
   Progresso 0→1 pela rolagem: GSAP ScrollTrigger quando carregou; senão, cálculo próprio. prefers-reduced-motion = sem cena. */
(function () {
  'use strict';
  var C = MM.CASA, esc = MM.esc;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var pagina = document.body.getAttribute('data-pagina') || '';
  var escolhidas = [];   // modalidades do "por que escolher só uma?"
  var reduz = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var SINO = '<svg class="sino" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6 6 0 0 0-6 6v4.2L4 17h16l-2-3.8V9a6 6 0 0 0-6-6zm0 18a2.4 2.4 0 0 0 2.3-2h-4.6A2.4 2.4 0 0 0 12 21z" fill="currentColor"/></svg>';

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

  /* ---------------- rodapé: uma assinatura, não três colunas ---------------- */
  function rodape() {
    var el = $('#rodape'); if (!el) return;
    el.className = 'rodape';
    el.innerHTML = '<div class="embrulho">' +
      '<p class="assina">MMA <span>Masters</span></p>' +
      '<p class="valores-linha">' + C.valores.join(' · ') + '</p>' +
      '<p class="contato">' + (C.endereco ? esc(C.endereco) + ' · ' : '') + (C.bairro ? esc(C.bairro) + ' · ' : '') + esc(C.cidade) +
      ' · <a href="' + MM.linkMapa() + '" target="_blank" rel="noopener">Abrir no mapa</a>' +
      ' · <a href="' + MM.linkWa('Olá! Quero saber mais sobre a MMA Masters.') + '" target="_blank" rel="noopener">WhatsApp da recepção</a>' +
      ' · <a href="https://instagram.com/' + C.instagram + '" target="_blank" rel="noopener">@' + C.instagram + '</a></p>' +
      '<p class="fim"><a href="aluno.html">Área do aluno</a> · <a href="admin.html">Painel da academia</a> · Demonstração feita pela Zync</p></div>';
  }

  /* ---------------- levar escolhas para a ficha de pesagem ---------------- */
  function levarParaFicha(mods, turma) {
    var f = $('#form-exp form'); if (!f) return false;
    if (mods) $$('input[name=mods]', f).forEach(function (c) { c.checked = mods.indexOf(c.value) >= 0; });
    if (turma) { var r = f.querySelector('input[name=turma][value="' + turma + '"]'); if (r) { r.checked = true; r.dispatchEvent(new Event('change')); } }
    var alvo = $('#experimental');
    alvo.scrollIntoView({ behavior: reduz ? 'auto' : 'smooth', block: 'start' });
    setTimeout(function () { var n = $('#x-nome'); if (n) n.focus({ preventScroll: true }); }, reduz ? 0 : 700);
    return true;
  }
  function ligaLeva() {
    $$('[data-leva-mod],[data-leva-turma]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var m = a.getAttribute('data-leva-mod'), t = a.getAttribute('data-leva-turma');
        if (levarParaFicha(m ? [m] : null, t)) e.preventDefault();
      });
    });
  }

  /* ---------------- modalidades: card de luta (tale of the tape) ---------------- */
  function modalidades() {
    var el = $('#trilho'); if (!el) return;
    var MED = [['pe', 'Em pé'], ['queda', 'Queda'], ['chao', 'Chão'], ['kimono', 'Kimono']];
    el.innerHTML = MM.MODALIDADES.map(function (m) {
      var foto = m.foto ? '<img src="' + m.foto + '" alt="' + esc(m.fotoAlt) + '" loading="lazy">' : '<div class="lut-sem" aria-hidden="true"><span>' + m.nome + '</span></div>';
      return '<article class="lutador" id="mod-' + m.id + '">' +
        '<div class="lut-foto">' + foto + '<span class="lut-canto">' + MED.slice(0, 3).filter(function (x) { return m.tape[x[0]]; }).map(function (x) { return x[1]; }).join(' + ') + '</span></div>' +
        '<div class="lut-corpo"><h3>' + m.nome + '</h3><p>' + esc(m.desc) + '</p>' +
        '<dl class="medidas">' + MED.map(function (x) { var s = m.tape[x[0]]; return '<div class="' + (s ? 'sim' : 'nao') + '"><dt>' + x[1] + '</dt><dd>' + (s ? 'sim' : '—') + '</dd></div>'; }).join('') + '</dl>' +
        (m.feminino ? '<p class="lut-fem">Tem turma feminina</p>' : '') +
        '<div class="lut-acoes"><a class="seta" href="horarios.html?mod=' + m.id + '">Horários</a><a class="bt bt-vermelho" href="?mod=' + m.id + '#experimental" data-leva-mod="' + m.id + '">Experimentar</a></div>' +
        '</div></article>';
    }).join('');
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
      '<a class="bt bt-vermelho bt-largo" href="#experimental" id="levar-combo">' + (n ? 'Levar para a ficha' : 'Quero uma aula experimental') + '</a>';
    $('#levar-combo').addEventListener('click', function (e) { if (levarParaFicha(escolhidas.slice(), null)) e.preventDefault(); });
  }

  /* ---------------- rounds ---------------- */
  function hora(h) { return h.replace(':00', 'h'); }
  function rounds(aulas, dia) {
    var hj = new Date(), proxima = -1;
    if (dia === hj.getDay()) {
      var agora = String(hj.getHours()).padStart(2, '0') + ':' + String(hj.getMinutes()).padStart(2, '0');
      aulas.some(function (a, i) { if (a.hora > agora) { proxima = i; return true; } return false; });
    }
    return '<ol class="rounds">' + aulas.map(function (a, i) {
      return '<li class="round' + (i === proxima ? ' proximo' : '') + '">' +
        '<span class="r-n">' + SINO + 'Round ' + (i + 1) + (i === proxima ? ' <em>próximo</em>' : '') + '</span>' +
        '<span class="r-h">' + hora(a.hora) + '</span><b>' + MM.mod(a.mod).nome + '</b>' +
        '<span class="t ' + a.turma + '">' + MM.turma(a.turma) + '</span>' + (a.prof ? '<span class="r-p">' + esc(a.prof) + '</span>' : '') + '</li>';
    }).join('') + '</ol>';
  }
  function roundsHoje() {
    var el = $('#rounds-hoje'); if (!el) return;
    var g = MM.grade(), d = new Date().getDay();
    var hoje = g.filter(function (a) { return a.dia === d; });
    if (hoje.length) { el.innerHTML = '<p class="hoje-dia">' + MM.DIAS_L[d] + ' · ' + hoje.length + (hoje.length === 1 ? ' round' : ' rounds') + '</p>' + rounds(hoje, d); return; }
    for (var k = 1; k < 7; k++) {
      var dd = (d + k) % 7, l = g.filter(function (a) { return a.dia === dd; });
      if (l.length) { el.innerHTML = '<p class="hoje-dia">Hoje não tem aula na grade. Próximos rounds: ' + MM.DIAS_L[dd] + '</p>' + rounds(l, dd); return; }
    }
    el.innerHTML = '<p class="hoje-dia">A grade ainda não foi cadastrada.</p>';
  }

  /* ---------------- página de horários: abas por dia ---------------- */
  function grade() {
    var el = $('#grade'); if (!el) return;
    var qs = new URLSearchParams(location.search);
    var hj = new Date().getDay(), ordem = [1, 2, 3, 4, 5, 6, 0];
    var f = { mod: qs.get('mod') || '', turma: qs.get('turma') || '', dia: (f0(qs.get('dia'))) };
    function f0(v) { if (v === 'semana') return 'semana'; var n = parseInt(v, 10); return n >= 0 && n <= 6 ? n : hj; }
    var fm = $('#filtro-mod'), ft = $('#filtro-turma'), ab = $('#abas-dia');
    if (f.mod || f.turma) { var det = $('details.filtrar'); if (det) det.open = true; }
    ab.innerHTML = ordem.map(function (d) { return '<button type="button" role="tab" data-d="' + d + '">' + MM.DIAS[d] + (d === hj ? '<small>hoje</small>' : '') + '</button>'; }).join('') + '<button type="button" role="tab" data-d="semana">Semana</button>';
    fm.innerHTML = '<button type="button" data-v="" aria-pressed="true">Todas</button>' + MM.MODALIDADES.map(function (m) { return '<button type="button" data-v="' + m.id + '" aria-pressed="false">' + m.nome + '</button>'; }).join('');
    ft.innerHTML = '<button type="button" data-v="" aria-pressed="true">Todas as turmas</button>' + MM.TURMAS.map(function (t) { return '<button type="button" data-v="' + t.id + '" aria-pressed="false">' + t.nome + '</button>'; }).join('');
    function marca(box, v) { $$('button', box).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-v') === v); }); }
    $$('button', fm).forEach(function (b) { b.addEventListener('click', function () { f.mod = b.getAttribute('data-v'); desenha(); }); });
    $$('button', ft).forEach(function (b) { b.addEventListener('click', function () { f.turma = b.getAttribute('data-v'); desenha(); }); });
    $$('button', ab).forEach(function (b) { b.addEventListener('click', function () { var v = b.getAttribute('data-d'); f.dia = v === 'semana' ? 'semana' : +v; desenha(); }); });
    function desenha() {
      marca(fm, f.mod); marca(ft, f.turma);
      $$('button', ab).forEach(function (b) { var v = b.getAttribute('data-d'); b.setAttribute('aria-selected', String(v === String(f.dia))); b.classList.toggle('hoje', v === String(hj)); });
      var g = MM.grade().filter(function (a) { return (!f.mod || a.mod === f.mod) && (!f.turma || a.turma === f.turma); });
      var vazio = '<p class="vazio">Sem aula' + (f.mod || f.turma ? ' neste filtro' : '') + '.</p>';
      if (f.dia === 'semana') {
        el.innerHTML = '<div class="semana-toda">' + ordem.map(function (d) {
          var aulas = g.filter(function (a) { return a.dia === d; });
          return '<div class="dia' + (d === hj ? ' hoje' : '') + '"><h3>' + MM.DIAS_L[d] + (d === hj ? ' <small>hoje</small>' : '') + '</h3>' + (aulas.length ? rounds(aulas, d) : vazio) + '</div>';
        }).join('') + '</div>';
      } else {
        var aulas = g.filter(function (a) { return a.dia === f.dia; });
        el.innerHTML = '<h2 class="dia-tit">' + MM.DIAS_L[f.dia] + (f.dia === hj ? ' <span class="vermelho">· hoje</span>' : '') + '</h2>' + (aulas.length ? rounds(aulas, f.dia) : vazio);
      }
    }
    desenha();
  }

  /* ---------------- aula experimental: ficha de pesagem ---------------- */
  function experimental() {
    var el = $('#form-exp'); if (!el) return;
    var qs = new URLSearchParams(location.search);
    var hojeTxt = MM.dataCurta(MM.hoje()).split(' ')[1];
    el.innerHTML = '<form class="ficha" novalidate>' +
      '<div class="ficha-cab"><span>MMA Masters · ' + esc(C.cidade) + '</span><b>Ficha de pesagem</b><span>Aula experimental · ' + hojeTxt + '</span></div>' +
      '<div class="ficha-l"><label for="x-nome">Atleta</label><input type="text" id="x-nome" autocomplete="name" placeholder="seu nome"></div>' +
      '<fieldset class="ficha-l"><legend>Modalidade(s)</legend><div class="marcas">' +
      MM.MODALIDADES.map(function (m) { return '<label><input type="checkbox" name="mods" value="' + m.id + '"' + (qs.get('mod') === m.id ? ' checked' : '') + '><span>' + m.nome + '</span></label>'; }).join('') + '</div></fieldset>' +
      '<fieldset class="ficha-l"><legend>Categoria</legend><div class="marcas">' +
      MM.TURMAS.map(function (t) { return '<label><input type="radio" name="turma" value="' + t.id + '"' + ((qs.get('turma') || 'adulto') === t.id ? ' checked' : '') + '><span>' + t.nome + '</span></label>'; }).join('') + '</div></fieldset>' +
      '<div class="ficha-l" data-kids><label for="x-idade">Idade da criança</label><input type="number" id="x-idade" min="3" max="17" inputmode="numeric" placeholder="anos"></div>' +
      '<div class="ficha-par">' +
      '<div class="ficha-l"><label for="x-quando">Turno</label><select id="x-quando"><option>Manhã</option><option>Meio-dia</option><option>Tarde</option><option selected>Noite</option><option>Sábado</option></select></div>' +
      '<div class="ficha-l"><label for="x-data">A partir de</label><input type="date" id="x-data" min="' + MM.hoje() + '" value="' + MM.soma(MM.hoje(), 1) + '"></div>' +
      '</div>' +
      '<div class="ficha-l"><label for="x-obs">Cartel <span class="opc">(já treinou alguma luta? opcional)</span></label><input type="text" id="x-obs" placeholder="ex.: nunca treinei / 1 ano de jiu-jítsu"></div>' +
      '<button class="bt bt-vermelho bt-largo" type="submit">Mandar a ficha no WhatsApp</button>' +
      '<p class="ficha-nota">A mensagem abre pronta no WhatsApp da recepção, que confirma o dia e o horário com você.</p>' +
      (C.whatsappPlaceholder ? '<span class="placeholder-wa">Demonstração: número de WhatsApp provisório</span>' : '') +
      '<div class="saida" aria-live="polite"></div>' +
      '<div class="carimbo" aria-hidden="true" hidden>Liberado<br>p/ o tatame</div></form>';
    var f = $('form', el);
    function kids() { var k = f.querySelector('input[name=turma]:checked').value === 'kids'; $('[data-kids]', f).hidden = !k; $('label[for=x-nome]', f).textContent = k ? 'Responsável' : 'Atleta'; }
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
      saida.innerHTML = '<div class="ok">Ficha anotada. Se o WhatsApp não abriu, <a href="' + link + '" target="_blank" rel="noopener">toque aqui</a>.</div>';
      var c = $('.carimbo', f); c.hidden = false; c.classList.remove('bate'); void c.offsetWidth; c.classList.add('bate');
      window.open(link, '_blank', 'noopener');
    });
    var en = $('[data-wa-en]'); if (en) en.href = MM.linkWa('Hi! I would like to book a trial class at MMA Masters.');
  }

  /* =================== cenas de rolagem =================== */
  function liso(a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

  // chama fn(p) com o progresso 0→1 de uma seção presa (topo da seção no topo da tela → fim da seção no fim da tela)
  var usaGsap = !!(window.gsap && window.ScrollTrigger);
  if (usaGsap) gsap.registerPlugin(ScrollTrigger);
  var semGsap = [];
  function cena(el, fn) {
    fn(0);
    if (usaGsap) {
      var o = { p: 0 };
      gsap.to(o, { p: 1, ease: 'none', onUpdate: function () { fn(o.p); }, scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.35, invalidateOnRefresh: true } });
    } else semGsap.push([el, fn]);
  }
  function rodaSemGsap() {
    if (!semGsap.length) return;
    var pend = false;
    function tick() {
      pend = false;
      semGsap.forEach(function (c) { var r = c[0].getBoundingClientRect(), tot = r.height - window.innerHeight; c[1](tot > 0 ? Math.min(1, Math.max(0, -r.top / tot)) : 0); });
    }
    window.addEventListener('scroll', function () { if (!pend) { pend = true; requestAnimationFrame(tick); } }, { passive: true });
    window.addEventListener('resize', tick);
    tick();
  }

  /* ---- Entrada no octógono ---- */
  function cenaOctogono() {
    var sec = $('#octogono'); if (!sec) return;
    var palco = $('.palco', sec), foto = $('#oct-foto'), veu = $('#oct-veu'), svg = $('#oct-grade'), tela = $('#oct-tela');
    var falas = $$('.fala', sec), selo = $('#selo-giro'), porta = $('#oct-porta');
    var A = [], i, R = 90, CO = Math.cos(Math.PI / 8);
    for (i = 0; i < 8; i++) { var ang = (22.5 + 45 * i) * Math.PI / 180; A.push([Math.cos(ang), Math.sin(ang)]); }
    function pts(r, ox, oy) { return A.map(function (v) { return (ox + v[0] * r).toFixed(1) + ',' + (oy + v[1] * r).toFixed(1); }); }
    // desenho fixo da grade (viewBox -100..100, raio 90). Porta = lado de baixo (vértices 1→2), dobradiça no vértice 1.
    var p90 = pts(R, 0, 0);
    $('#oct-dentro').setAttribute('points', pts(R - 1, 0, 0).join(' '));
    var contorno = [2, 3, 4, 5, 6, 7, 0, 1].map(function (k) { return p90[k]; }).join(' ');
    $('#oct-borda').setAttribute('points', contorno);
    $('#oct-acolch').setAttribute('points', [2, 3, 4, 5, 6, 7, 0, 1].map(function (k) { var v = A[k]; return (v[0] * (R - 4)).toFixed(1) + ',' + (v[1] * (R - 4)).toFixed(1); }).join(' '));
    var h = A[1], d = A[2];
    ['#porta-linha', '#porta-acolch'].forEach(function (s, j) {
      var rr = j ? R - 4 : R, l = $(s);
      l.setAttribute('x1', (h[0] * rr).toFixed(1)); l.setAttribute('y1', (h[1] * rr).toFixed(1));
      l.setAttribute('x2', (d[0] * rr).toFixed(1)); l.setAttribute('y2', (d[1] * rr).toFixed(1));
    });
    var hx = (h[0] * R).toFixed(1), hy = (h[1] * R).toFixed(1);
    $('#oct-postes').innerHTML = p90.map(function (p) { var c = p.split(','); return '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="3.2"/>'; }).join('');

    var W, H, cx, cy, R0, RMAX;
    function mede() {
      W = palco.clientWidth; H = palco.clientHeight; cx = W / 2; cy = H * 0.5;
      R0 = Math.min(W, H) * (W < 600 ? 0.4 : 0.34);
      RMAX = Math.sqrt(cx * cx + Math.max(cy, H - cy) * Math.max(cy, H - cy)) / CO * 1.04;
      var lado = R0 * 200 / R;
      svg.style.width = svg.style.height = lado + 'px';
      svg.style.left = (cx - lado / 2) + 'px'; svg.style.top = (cy - lado / 2) + 'px';
    }
    mede();
    var ultimo = 0;
    function desenha(p) {
      ultimo = p;
      var g = liso(0.3, 0.86, p), r = R0 + (RMAX - R0) * g * g;
      foto.style.clipPath = 'polygon(' + pts(r * 0.995, cx, cy).map(function (s) { return s.replace(',', 'px ') + 'px'; }).join(',') + ')';
      svg.style.transform = 'scale(' + (r / R0).toFixed(4) + ')';
      svg.style.opacity = (1 - liso(0.74, 0.9, p)).toFixed(3);
      tela.style.opacity = (1 - liso(0.26, 0.55, p)).toFixed(3);
      porta.setAttribute('transform', 'rotate(' + (-108 * liso(0.12, 0.36, p)).toFixed(1) + ' ' + hx + ' ' + hy + ')');
      veu.style.opacity = (0.8 - 0.42 * liso(0.3, 0.8, p)).toFixed(3);
      if (selo) selo.style.transform = 'rotate(' + (p * 300).toFixed(1) + 'deg)';
      falas.forEach(function (f) {
        var de = parseFloat(f.getAttribute('data-de')), ate = parseFloat(f.getAttribute('data-ate'));
        var ent = de < 0 ? 1 : liso(de, de + 0.07, p), sai = liso(ate - 0.07, ate, p);
        var a = ent * (1 - sai);
        f.style.opacity = a.toFixed(3);
        f.style.transform = 'translate3d(0,' + ((1 - ent) * 40 - sai * 40).toFixed(1) + 'px,0)';
        f.style.visibility = a < 0.02 ? 'hidden' : 'visible';
      });
    }
    window.addEventListener('resize', function () { mede(); desenha(ultimo); });
    cena(sec, desenha);
  }

  /* ---- Card de luta: rolagem horizontal presa ---- */
  function cenaTape() {
    var sec = $('#modalidades'), trilho = $('#trilho'), barra = $('#tape-prog'); if (!sec || !trilho) return;
    var dist = 0, ultimo = 0;
    function mede() {
      dist = Math.max(0, trilho.scrollWidth - trilho.parentElement.clientWidth);
      sec.style.height = (window.innerHeight + dist) + 'px';
    }
    mede();
    function desenha(p) { ultimo = p; trilho.style.transform = 'translate3d(' + (-dist * p).toFixed(1) + 'px,0,0)'; if (barra) barra.style.transform = 'scaleX(' + p.toFixed(3) + ')'; }
    window.addEventListener('resize', function () { mede(); desenha(ultimo); if (usaGsap) ScrollTrigger.refresh(); });
    cena(sec, desenha);
  }

  function cenas() {
    if (reduz || !$('#octogono')) return;
    document.documentElement.classList.add('cena-on');
    cenaOctogono();
    cenaTape();
    rodaSemGsap();
    if (usaGsap) window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  topo();
  rodape();
  modalidades();
  combo();
  roundsHoje();
  grade();
  experimental();
  ligaLeva();
  cenas();
})();
