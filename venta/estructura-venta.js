/* =====================================================================
   estructura-venta.js — CAPA DE ESTRUCTURA DE VENTA (drop-in)
   Obra: estructura-venta-motos · 2026-10-10
   Orden de Esteban: "yo me encargo del diseño, tú encárgate de hacer toda
   la estructura para que esa página venda."

   QUE HACE ESTA CAPA (y qué NO):
     SI  — por dónde se paga, cuántas veces se puede pagar, qué mide el
           píxel, qué objeción se mata antes del botón, de qué anuncio
           vino el que pagó.
     NO  — paleta, tipografía, videos, imágenes, encuadres. Cero.
           Esta capa no define ni un color. Reutiliza las clases que ya
           existen en el HTML (.btn, .cta-note, .buybar) y nada más.

   ARCHIVO AUTOCONTENIDO: 2 líneas de include y listo. Las ediciones de
   diseño de Esteban nunca chocan con esta capa.
   ===================================================================== */
(function () {
'use strict';

/* =====================================================================
   ===================  EL ÚNICO BLOQUE QUE SE EDITA  ==================
   =====================================================================
   Todo lo que es PLATA vive acá arriba y lo firma Esteban. Cambiar el
   canal de venta de toda la página es UNA palabra.
   ===================================================================== */
var EV = window.EV = {

  /* ---------------------------------------------------------------
     canal: 'whatsapp'  → el único camino que YA cobra hoy.
                          Medido 2026-10-10: el flow MOTOS está ACTIVO
                          en Mongo (id 6a1c47e7dca02b894df8dac5),
                          trigger "QUIERO INFO MOTOS", nodo payment con
                          amounts:[15000] COP, y entrega
                          utec-motos.pages.dev.
            'stripe'    → USD con checkout propio. NO se puede activar
                          todavía: EV.links está vacío porque crear un
                          payment link es plata y es firma de Esteban
                          (medido 2026-10-10: 38 payment links en las 3
                          cuentas, 0 de motos).
     --------------------------------------------------------------- */
  canal: 'whatsapp',

  /* WhatsApp — número y disparador copiados del camino probado que ya
     corre en la raíz de esta misma landing (index.html:369). El
     disparador tiene que coincidir LETRA POR LETRA con el trigger del
     flow o el bot no arranca y el clic pagado se cae al vacío. */
  wa: { numero: '573132579097', disparador: 'QUIERO INFO MOTOS' },

  /* Precio POR CANAL. Publicar dólares para cobrar en pesos es mentirle
     al cliente: si el botón va a WhatsApp, el precio que se muestra
     tiene que ser el que el bot va a pedir. */
  precio: {
    whatsapp: { bumps: false, base: '$15.000', nota: 'pago único · COP' },
    stripe:   { bumps: true,
                base: 'US$12.99', a: 'US$14.98', b: 'US$14.98', ab: 'US$16.97',
                nota: 'pago único · USD' }
  },

  /* Payment links de Stripe. VACÍOS A PROPÓSITO. Mientras estén vacíos
     el canal 'stripe' se niega a arrancar y la capa cae a WhatsApp con
     un aviso en consola: un botón que apunta a '#' es un clic pagado
     tirado a la basura. */
  links: { base: '', a: '', b: '', ab: '' },

  /* Píxel. VACÍO = la página NO carga fbevents.js: cero peticiones
     externas. Candidatos medidos el 2026-10-10 en la cuenta:
        1372300278375775  pixel "WH"      — last_fired_time: NUNCA disparó
        1476648010591444  dataset "WH ... Event Data" — vivo, pero es el
                          que hoy mide las conversaciones de WhatsApp por
                          CAPI: meterle eventos de web mezcla dos cosas.
     Cuál se usa lo decide Esteban. Heredar el de melamina o el de CapCut
     mediría otro producto. */
  pixel: '',

  metodos: {
    whatsapp: ['Nequi', 'Daviplata', 'Llaves', 'Bancolombia'],
    stripe:   null   /* null = se dejan los logos que puso el diseño */
  },

  /* Un solo verbo en TODOS los botones. Medido en /nueva/ el 2026-10-10:
     4 botones con 4 textos distintos. */
  verbo: 'QUIERO EL PACK',

  /* C1 — VERBO CORTO PARA LA BARRA DE ARRIBA.
     Medido en lo SERVIDO el 2026-10-10 a 360 px: el botón del nav con el
     verbo largo ocupaba 174 px de los 360 (48% del ancho), se partía en
     3 LÍNEAS, estiraba la barra a 65 px de alto y quedaba pegado al logo
     con 0 px de aire — "MOTOS PRO" ilegible. El verbo corto va sin precio
     y sin flecha: una sola línea. Reversa: poner '' y vuelve el largo. */
  verbo_corto: '',

  /* Inyecciones de estructura (CTA repetido + chip de garantía arriba
     del pliegue). REVERSA DE UNA PALABRA: poner false. */
  inyectar: true
};

/* =====================================================================
   =========================  FIN DE LO EDITABLE  ======================
   ===================================================================== */

function log(m){ try{ console.log('[estructura-venta] '+m); }catch(e){} }
function $(s,r){ return (r||document).querySelector(s); }
function $$(s,r){ return [].slice.call((r||document).querySelectorAll(s)); }

/* ---------------------------------------------------------------------
   0. CANAL EFECTIVO — fail-safe hacia el camino que cobra.
   Si alguien pone canal:'stripe' sin pegar los links, la capa NO deja
   la página sin cobrar: cae a WhatsApp y grita en consola. El fallo
   abre hacia el único camino probado, nunca hacia '#'.
   --------------------------------------------------------------------- */
var canal = EV.canal;
if (canal === 'stripe' && !EV.links.base) {
  log('AVISO: canal="stripe" pero EV.links.base está vacío. Cayendo a WhatsApp.');
  canal = 'whatsapp';
}
var PR = EV.precio[canal] || EV.precio.whatsapp;

/* ---------------------------------------------------------------------
   1. ATRIBUCIÓN (E5) — de qué anuncio vino el que pagó.
   Se lee del querystring, se guarda en sessionStorage (sobrevive el
   rebote a WhatsApp y la vuelta), y se arma UN token corto.
   Si no hay nada que leer, el token es 'none' EXPLÍCITO. Jamás una
   etiqueta quemada: ese es el error que dejó a melamina con
   AD1MELAMINACURSO fijo y la atribución muerta.
   --------------------------------------------------------------------- */
var TRIGGERS_AJENOS = ["audiolibros","biblioteca","carpinteria","carpintería","carros",
"comics","condorito","disenos sublimacion","diseños","hacer muebles","info autos",
"info carros","info libros","info libros audiolibros","info melamina","info muebles",
"info revistas","info sublimacion","kaliman","libros","mecanica de carros","megapack retro",
"melamina","muebles","pack sublimacion","peliculas gratis","planos de muebles","playboy",
"quiero info aluminio","quiero info arduino","quiero info barberia","quiero info barbería",
"quiero info capcut","quiero info carros","quiero info claude","quiero info claude code",
"quiero info libros","quiero info melamina","quiero info muebles",
"quiero info muebles industriales","quiero info pintura","quiero info programacion",
"quiero info programación","quiero info revistas","quiero info revistas y peliculas",
"quiero info revistas y películas","quiero info sst","quiero info sublimacion",
"quiero info sublimación","quiero melamina","revistas","revistas retro","serigrafia",
"sublimacion","sublimación","vinil textil"];

/* true si el texto le robaría el lead a otro flujo */
function secuestra(txt) {
  var l = String(txt || '').toLowerCase();
  for (var i = 0; i < TRIGGERS_AJENOS.length; i++) {
    if (l.indexOf(TRIGGERS_AJENOS[i]) !== -1) return TRIGGERS_AJENOS[i];
  }
  return '';
}

var ATRIB = (function () {
  var limpio = function (v) {
    return v ? String(v).replace(/[^A-Za-z0-9_.-]/g, '').slice(0, 40) : '';
  };
  var out = { ad: '', camp: '', fuente: '', token: 'none', origen: 'ninguno', saneado: '' };
  try {
    var q = new URLSearchParams(location.search);
    out.ad     = limpio(q.get('ad')     || q.get('utm_content')  || q.get('adname'));
    out.camp   = limpio(q.get('camp')   || q.get('utm_campaign'));
    out.fuente = limpio(q.get('fuente') || q.get('utm_source'));

    if (!out.fuente) {
      if (q.get('fbclid')) out.fuente = 'meta';
      else if (/facebook\.com|instagram\.com/.test(document.referrer || '')) out.fuente = 'meta';
    }

    if (out.ad || out.camp || out.fuente) {
      /* se descarta SEGMENTO POR SEGMENTO: si la campaña se llama
         "UTEC_CARROS_X" se tira la campaña, no toda la atribución. */
      var seg = [out.camp, out.ad, out.fuente], malos = [];
      for (var i = 0; i < seg.length; i++) {
        var m = secuestra(seg[i]);
        if (m) { malos.push(seg[i] + '~' + m); seg[i] = ''; }
      }
      out.saneado = malos.join(',');
      if (malos.length) {
        out.camp = seg[0]; out.ad = seg[1]; out.fuente = seg[2];
        log('AVISO atribución: ' + out.saneado + ' contenía un disparador de otro flujo y se descartó ' +
            '(habría mandado el lead al producto equivocado).');
      }
      if (out.camp || out.ad || out.fuente) {
        out.token = [out.camp || 'sincamp', out.ad || 'sinad', out.fuente || 'directo'].join('-');
        /* reja final: el token armado tampoco puede secuestrar */
        var m2 = secuestra(out.token);
        if (m2) { out.token = 'none'; out.saneado += (out.saneado ? ',' : '') + 'token~' + m2; }
      }
      out.origen = (out.token === 'none') ? 'descartado' : 'querystring';
      if (out.token !== 'none') sessionStorage.setItem('evAtrib', JSON.stringify(out));
    } else {
      var g = sessionStorage.getItem('evAtrib');
      if (g) { out = JSON.parse(g); out.origen = 'sesion'; }
    }
  } catch (e) { log('atribución no legible: ' + e); }
  return out;
})();
window.__evAtrib = ATRIB;
window.__evSecuestra = secuestra;

/* ---------------------------------------------------------------------
   2. DESTINO ÚNICO — una sola función resuelve a dónde va CADA botón.
   Una sola fuente: nadie puede editar un botón y dejar el otro
   apuntando a otro lado (el bug que ya pasó en esta landing).
   --------------------------------------------------------------------- */
function destino(combo) {
  if (canal === 'whatsapp') {
    var t = EV.wa.disparador;
    if (ATRIB.token && ATRIB.token !== 'none') t += ' · ' + ATRIB.token;
    return 'https://wa.me/' + EV.wa.numero + '?text=' + encodeURIComponent(t);
  }
  var u = EV.links[combo] || EV.links.base;
  if (!u) return '';
  var ref = (ATRIB.token && ATRIB.token !== 'none') ? ATRIB.token : 'none';
  return u + (u.indexOf('?') < 0 ? '?' : '&') + 'client_reference_id=' + encodeURIComponent(ref);
}

/* ---------------------------------------------------------------------
   3. PÍXEL (E4) — con EV.pixel vacío NO se carga fbevents.js.
   Y se neutraliza el fbq que el HTML ya trae con 'PIXEL_ID_PENDIENTE':
   hoy esa línea pide fbevents.js en cada visita y manda PageView e
   InitiateCheckout a un dataset que no existe. Cero medición y una
   petición externa por visita.
   --------------------------------------------------------------------- */
var PIX = (function () {
  var activo = !!EV.pixel;
  if (!activo) {
    /* el stub se queda: tragar los track() que el HTML ya dispara, sin
       red y sin romper nada que llame a fbq */
    if (!window.fbq) { window.fbq = function(){}; window.fbq.queue = []; }
    log('píxel APAGADO (EV.pixel vacío): 0 peticiones a connect.facebook.net');
    return { on: false, track: function () {} };
  }
  if (!window.fbq || !window.fbq.loaded) {
    !function(f,b,e,v,n,t,s){if(f.fbq&&f.fbq.loaded)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=n.queue||[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
  }
  window.fbq('init', EV.pixel);
  /* eventID estable: el mismo clic no se cuenta dos veces si el usuario
     vuelve atrás, y el servidor puede deduplicar contra este id. */
  var sid = (function () {
    try {
      var s = sessionStorage.getItem('evSid');
      if (!s) { s = 'ev' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); sessionStorage.setItem('evSid', s); }
      return s;
    } catch (e) { return 'ev' + Date.now().toString(36); }
  })();
  var vistos = {};
  function track(ev, data, unaVez) {
    var id = 'ev_' + ev + '_' + sid;
    if (unaVez) { if (vistos[ev]) return; vistos[ev] = 1; }
    window.fbq('track', ev, data || {}, { eventID: id });
  }
  track('PageView', {}, true);
  track('ViewContent', { content_name: 'MOTOS PRO', content_type: 'product' }, true);
  log('píxel ON (' + EV.pixel + '): PageView + ViewContent');
  return { on: true, track: track };
})();

/* ---------------------------------------------------------------------
   4. PRECIO Y BUMPS SEGÚN EL CANAL
   Los dos bumps de +US$1.99 YA ESTÁN DENTRO de la zona de entrega que
   recibe el que paga 15.000 COP hoy (medido el 2026-10-10 en
   utec-motos.pages.dev: "Curso Polarizado de Autos", "Aire
   Acondicionado Automotriz", "Curso Mecanica para Bicicleta", "Bono:
   Cuatrimoto, Torito Bajaj y Motocarro", "Reparacion de Plastico y
   Pintura" — los 5 items de los 2 bumps, uno por uno).
   Cobrarlos aparte cuando el cliente de hoy los recibe gratis es
   venderle dos veces lo mismo. En canal WhatsApp se muestran como
   INCLUIDO: misma caja, mismo lugar, sin checkbox y sin suma.
   --------------------------------------------------------------------- */
var comboActual = 'base';
function comboDeChecks() {
  var a = $('#bump-a input'), b = $('#bump-b input');
  if (!a || !b) return 'base';
  return a.checked && b.checked ? 'ab' : a.checked ? 'a' : b.checked ? 'b' : 'base';
}
function precioDe(combo) { return PR[combo] || PR.base; }

function pintaBumps() {
  if (PR.bumps) return;                       /* stripe: se dejan como están */
  $$('#bump-a, #bump-b').forEach(function (el) {
    var chk = $('input', el);
    if (chk) { chk.checked = false; chk.disabled = true; }
    el.setAttribute('data-ev-incluido', '1');
    var p = $('.bp', el);
    if (p) p.textContent = 'INCLUIDO';
    var bx = $('.bx', el);
    if (bx) bx.textContent = '✓';
  });
  var nota = $('#bump-nota');
  if (nota) nota.innerHTML = 'Los dos bonos <b>ya vienen incluidos</b> en el pack.';
}

function pintaPrecio() {
  var t = precioDe(comboActual);
  window.__precioUSD = (canal === 'stripe') ? String(t).replace(/[^0-9.]/g, '') : '';
  window.__precioMostrado = t;
  ['#precio-grande', '#buybar-precio', '#faq-precio'].forEach(function (s) {
    var el = $(s); if (el) el.textContent = t;
  });
  $$('[data-ev-precio]').forEach(function (el) { el.textContent = t; });
  /* la nota de precio tiene que decir la moneda real del canal */
  $$('.price-per, .buybar .p small').forEach(function (el) {
    if (/pago único/i.test(el.textContent)) {
      el.innerHTML = (canal === 'whatsapp')
        ? 'pago único · <b>acceso de por vida</b>'
        : el.innerHTML;
    }
  });
}

/* ---------------------------------------------------------------------
   5. UN SOLO VERBO Y UN SOLO DESTINO EN TODOS LOS BOTONES (E2)
   Se marcan con data-ev-cta para poder contarlos después y para que la
   reja sepa cuáles son botones de compra y cuáles son navegación.
   --------------------------------------------------------------------- */
function botones() {
  /* Todo .btn de la página es un botón de compra en esta landing: los 4
     que hay hoy apuntan a #comprar o a #STRIPE-PENDIENTE. Ninguno es
     navegación real. */
  return $$('a.btn, button.btn, a[data-buy], a[data-wa]');
}

function pintaBotones() {
  var t = precioDe(comboActual);
  var u = destino(comboActual);
  botones().forEach(function (b) {
    b.setAttribute('data-ev-cta', '1');
    b.setAttribute('data-ev-combo', comboActual);
    if (u) { b.setAttribute('href', u); b.setAttribute('rel', 'noopener'); }
    /* C1: en el nav manda el verbo corto (ver EV.verbo_corto) */
    var angosto = EV.verbo_corto && b.closest && b.closest('nav');
    if (angosto) {
      b.setAttribute('data-ev-corto', '1');
      b.textContent = EV.verbo_corto;
      return;
    }
    /* el verbo: uno solo, con el precio pegado. Los iconos que el
       diseño ya puso dentro del botón se respetan. */
    /* EL VERBO ES UNO SOLO. Lo que cambia es si lleva el precio pegado:
       en los botones grandes si; en el nav y en la barra fija NO, porque
       esos dos ya muestran el precio al lado y el texto largo se desborda
       a 360 px — medido en la captura: el boton del nav tapaba el logo. */
    var compacto = !!(b.closest && (b.closest('nav') || b.closest('#buybar')));
    var svg = b.querySelector('svg');
    var etiqueta = compacto ? EV.verbo : (EV.verbo + ' · ' + t + ' →');
    if (svg) {
      var textos = [].filter.call(b.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); });
      if (textos.length) { textos[0].textContent = ' ' + etiqueta; textos.slice(1).forEach(function (n) { n.textContent = ''; }); }
      else b.appendChild(document.createTextNode(' ' + etiqueta));
    } else {
      b.textContent = etiqueta;
    }
  });
}

/* ---------------------------------------------------------------------
   6. EVENTO AL CLIC — lo que el anuncio puede optimizar.
   WhatsApp: 'Contact' (el cobro ocurre en el chat, no acá).
   Stripe:   'InitiateCheckout' con el valor real del combo.
   PROHIBIDO un Purchase de navegador: contarle a Meta una venta que
   esta página no vio envenena la optimización (regla firmada).
   --------------------------------------------------------------------- */
document.addEventListener('click', function (ev) {
  var b = ev.target.closest ? ev.target.closest('[data-ev-cta]') : null;
  if (!b) return;
  if (canal === 'whatsapp') {
    PIX.track('Contact', { content_name: 'MOTOS PRO', canal: 'whatsapp' });
  } else {
    PIX.track('InitiateCheckout', {
      value: parseFloat(window.__precioUSD) || 12.99,
      currency: 'USD',
      content_name: 'MOTOS PRO ' + comboActual
    });
  }
}, true);

/* ---------------------------------------------------------------------
   7. QUE SE PUEDA PAGAR EN TODO MOMENTO (E2)
   a) la barra fija que la página ya tiene deja de mandar a un ancla y
      manda al pago: hoy cuesta un toque extra desde cualquier punto
      del scroll.
   b) se repite el CTA después de cada bloque que mata una objeción
      (garantía y FAQ), no 2 en toda la página.
   Las dos cosas usan las clases que el diseño ya definió. Reversa:
   EV.inyectar = false.
   --------------------------------------------------------------------- */
function barraFija() {
  var bar = $('#buybar'); if (!bar) return;
  /* C2 — UN SOLO DUEÑO DE LA BARRA.
     El diseño trae su propio script inline que también escribe
     bar.style.display, y escribe '' (cae a la hoja de estilo, que apaga
     la barra arriba de 720 px). Medido en lo SERVIDO el 2026-10-10:
     a 1280 px la barra estaba display:none en TODO el scroll — los dos
     scripts se pisaban y ganaba el de atrás. Reemplazar el nodo por su
     clon deja los IntersectionObserver del script viejo apuntando a un
     nodo DESCOLGADO: siguen corriendo, ya no mandan. Reversa: borrar
     este bloque y la barra vuelve a tener dos dueños. */
  if (bar.parentNode) {
    var clon = bar.cloneNode(true);
    bar.parentNode.replaceChild(clon, bar);
    bar = clon;
  }
  document.documentElement.setAttribute('data-ev-barra', '1');
  var h = document.querySelector('header');
  var c = $('#comprar');
  var enHero = true, enPrecio = false;
  /* con canal WhatsApp la sección #comprar ya NO es el destino del
     dinero: esconder la barra ahí esconde el único botón alcanzable sin
     scrollear. Con canal Stripe sí, porque ahí está el checkout. */
  var ocultaEnPrecio = (canal !== 'whatsapp');
  function pinta() {
    bar.style.display = (enHero || (ocultaEnPrecio && enPrecio)) ? 'none' : 'flex';
  }
  pinta();
  if ('IntersectionObserver' in window) {
    if (h) new IntersectionObserver(function (e) { enHero = e[0].isIntersecting; pinta(); }).observe(h);
    if (c) new IntersectionObserver(function (e) { enPrecio = e[0].isIntersecting; pinta(); }).observe(c);
  } else { enHero = false; }
  setTimeout(pinta, 60);
}

function ctaRepetido() {
  if (!EV.inyectar) return;
  var anclas = [];
  /* C3 — un CTA DESPUÉS DE CADA BLOQUE DE PRUEBA, no 2 en toda la página.
     El orden de venta rápida es promesa → prueba → precio → objeciones, y
     cada prueba termina con la puerta de compra abierta. */
  var dp = $('#despiece');            if (dp) anclas.push(dp);          /* prueba 1: el despiece */
  var fx = $('.fx-note');             if (fx) anclas.push(fx.parentNode);/* prueba 2: los clips del pack */
  var g  = $('.guar');                if (g)  anclas.push(g.parentNode); /* después de la garantía */
  var f  = $('#faq .acc');            if (f)  anclas.push(f);            /* después del FAQ */
  anclas.forEach(function (host, i) {
    if (!host || host.querySelector('[data-ev-inyectado]')) return;
    var d = document.createElement('div');
    d.setAttribute('data-ev-inyectado', 'cta' + i);
    d.style.cssText = 'text-align:center;margin-top:30px';
    var a = document.createElement('a');
    a.className = 'btn big';
    a.setAttribute('data-ev-cta', '1');
    a.textContent = EV.verbo;
    d.appendChild(a);
    var n = document.createElement('div');
    n.className = 'cta-note';
    n.style.cssText = 'margin-top:10px';
    n.textContent = 'Garantía de 7 días · acceso inmediato';
    d.appendChild(n);
    host.appendChild(d);
  });
}

function chipGarantia() {
  if (!EV.inyectar) return;
  /* reversión de riesgo ARRIBA DEL PLIEGUE. El texto NO se inventa: se
     toma del bloque de garantía que la propia página ya publica. */
  var hero = $('#btn-hero'); if (!hero || $('[data-ev-inyectado="chip"]')) return;
  var c = document.createElement('div');
  c.setAttribute('data-ev-inyectado', 'chip');
  c.className = 'cta-note';
  c.style.cssText = 'margin-top:12px;display:flex;gap:7px;align-items:center;flex-wrap:wrap';
  c.innerHTML = '<span>🛡️ Garantía de 7 días — te devolvemos el 100%</span>' +
                '<span aria-hidden="true">·</span><span>Acceso inmediato</span>';
  if (hero.parentNode) hero.parentNode.insertBefore(c, hero.nextSibling);
}

function metodosDePago() {
  if (!EV.inyectar) return;
  var lista = EV.metodos && EV.metodos[canal];
  if (!lista || !lista.length) return;          /* stripe: no se toca */
  var row = $('.pay-row'); if (!row || row.getAttribute('data-ev-metodos')) return;
  row.setAttribute('data-ev-metodos', canal);
  row.innerHTML = '';
  lista.forEach(function (m) {
    var s = document.createElement('span');
    s.className = 'pay-chip';
    s.textContent = m;
    row.appendChild(s);
  });
}

/* ---------------------------------------------------------------------
   8. EL AVISO QUE MATA LA VENTA
   "Página en preparación: el pago todavía no está conectado" se queda
   SÓLO si de verdad no hay por dónde pagar. Con un canal resuelto es
   una mentira que frena el impulso.
   --------------------------------------------------------------------- */
function avisoCheckout() {
  var a = $('#aviso-checkout'); if (!a) return;
  if (destino(comboActual)) a.style.display = 'none';
  else a.textContent = 'El pago todavía no está conectado.';
}

/* ---------------------------------------------------------------------
   9. ARRANQUE
   --------------------------------------------------------------------- */
function repinta() {
  comboActual = PR.bumps ? comboDeChecks() : 'base';
  pintaPrecio(); pintaBotones(); avisoCheckout();
}

function arranca() {
  pintaBumps();
  metodosDePago();
  chipGarantia();
  ctaRepetido();
  barraFija();
  repinta();
  $$('#bump-a input, #bump-b input').forEach(function (c) {
    c.addEventListener('change', repinta);
  });
  /* el JS original de la página también repinta el botón al marcar un
     bump; se vuelve a pasar por encima en el siguiente tick para que la
     última palabra sea de esta capa (un solo verbo, un solo destino). */
  document.addEventListener('change', function () { setTimeout(repinta, 0); }, true);

  log('canal=' + canal + ' · precio=' + precioDe(comboActual) +
      ' · destino=' + (destino(comboActual) || 'NINGUNO') +
      ' · botones=' + $$('[data-ev-cta]').length +
      ' · atrib=' + ATRIB.token + ' (' + ATRIB.origen + ')');
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arranca);
else arranca();

/* autodiagnóstico: lo que la reja de la obra lee desde el navegador */
window.__evDiag = function () {
  return {
    canal: canal,
    precio: precioDe(comboActual),
    destino: destino(comboActual),
    botones: $$('[data-ev-cta]').length,
    verbos: (function () {
      var m = {}; $$('[data-ev-cta]').forEach(function (b) { m[b.textContent.trim()] = 1; });
      return Object.keys(m);
    })(),
    hrefs: (function () {
      var m = {}; $$('[data-ev-cta]').forEach(function (b) { m[b.getAttribute('href') || '(sin href)'] = 1; });
      return Object.keys(m);
    })(),
    pixel_on: PIX.on,
    atribucion: ATRIB,
    bumps_cobrables: !!PR.bumps,
    inyectados: $$('[data-ev-inyectado]').length
  };
};
})();
