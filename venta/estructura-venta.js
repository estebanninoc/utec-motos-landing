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

  /* Píxel. VACÍO = la página NO carga fbevents.js: cero peticiones externas.
     CENSO POR API 2026-10-10 de act_1626304355673207 (LANDINGS USD, la cuenta
     que va a pautar esta landing). Los 3 pixeles compartidos con ella son de
     OTROS productos:
        1040771825513533  "Edicion PRO - Curso CapCut"   (EL MEGA BAZAR)
        1111081301276455  "MELAMINA - Planos y Curso"    (United States BASED)
        1076125914843182  "The Game Box"                 (EL MEGA BAZAR)
     act_2973319799675168 (WH INTERNATIONAL) devuelve {"data":[]}: CERO pixeles
     compartidos. Y 1372300278375775 / 1476648010591444 no son legibles con este
     token (error #200, sin permiso del dueño) ni estan compartidos con la cuenta.
     => NO existe un dataset de MOTOS. Meter esta landing en cualquiera de los 3
     mezcla productos y le ensucia la optimizacion al que ya corre. Crear el
     dataset es ESCRITURA DE ACTIVO: queda PROPUESTO para el dedo de Esteban
     (comando en el parte de motos-vende). Mientras esto siga vacio la pagina no
     mide nada, y es la razon por la que el conjunto nace optimizado a
     LANDING_PAGE_VIEWS y no a conversiones. */
  pixel: '',

  /* Un solo verbo en TODOS los botones. Medido en /nueva/ el 2026-10-10:
     4 botones con 4 textos distintos. */
  verbo: 'QUIERO EL PACK',

  /* C1 — VERBO CORTO PARA LA BARRA DE ARRIBA.
     Medido en lo SERVIDO el 2026-10-10 a 360 px: el botón del nav con el
     verbo largo ocupaba 174 px de los 360 (48% del ancho), se partía en
     3 LÍNEAS, estiraba la barra a 65 px de alto y quedaba pegado al logo
     con 0 px de aire — "MOTOS PRO" ilegible. El verbo corto va sin precio
     y sin flecha: una sola línea. Reversa: poner '' y vuelve el largo. */
  verbo_corto: 'COMPRAR',

  /* ===================================================================
     C5 — PRUEBA SOCIAL. NUMEROS MEDIDOS, CERO INVENTO.
     Medido por mi el 2026-10-10, y cada numero tiene su fuente:

     ventas = 278. Sale de finanzas.db de Helios (abierta mode=ro), tabla
       `ventas`, productos 'MOTOS' (n=274) + 'Curso Motos' (n=4) = 278.
       Las 2 `anulaciones` de motos NO se restan aparte: la tabla `ventas`
       YA VIENE NETA. La huella que lo prueba es un bucket en monto=0 n=0
       (2026-08-05 MEGA BAZAR REVISTAS, el unico de la tabla): una
       agregacion de ventas jamas escribe una fila con cero ventas, ese
       cero solo puede ser una resta. Restarlas otra vez descontaba dos
       veces — es el error que yo mismo publique primero (decia 276).
       ⚠️ CORRIJO EL TRASPASO: ahi decia "90 ventas + 4 = 94 compradores".
       El 90 y el 4 eran CANTIDAD DE FILAS (una fila = un dia), no ventas.
       La cantidad de ventas vive en la columna `n`. Comprobado por
       aritmetica: 4.091.620 COP / 274 = 14.933 COP de ticket medio, que
       es el precio de 15.000. Con 94 el ticket daria 43.528 COP, que
       nadie pago nunca. 'MOTOS' y 'Curso Motos' conviven en las mismas
       fechas (06-06, 06-07, 06-09, 06-10) => son dos productos en
       paralelo, no un renombre, asi que no se doble-cuentan.
       Rango real: 2026-06-05 -> 2026-10-07.
       Se dice "packs vendidos", NO "personas": una venta repetida del
       mismo cliente contaria dos veces y no puedo probar que no exista.

     reacciones = 2.900 (PISO, no la suma). El reel de motos devuelve
       2.988 reacciones / 119 comentarios. ⚠️ TRAMPA MEDIDA: los posts
       ...251697332331 y ...869481332331 son DOS reels distintos
       (983023084659732 y 1027163419981497) que devuelven los MISMOS 118
       comment_id (md5 identico) y los mismos contadores. Sumarlos daba
       6.707 reacciones: doble conteo. Se publica el piso del post mas
       grande, verificable por cualquiera que abra el reel.

     estrellas: NO VAN. No existe ninguna calificacion de motos en ningun
       lado. Publicar "4,9 estrellas" seria inventar.
     testimonios textuales: NO VAN. De los 129 comentarios reales, CERO
       son post-compra (son 'me interesa', 'cuanto vale', pedidos de
       modelos). Y la API devuelve `from` sin nombre en 128/128: no hay
       nombre publico que citar aunque lo hubiera.
     REVERSA DE UNA PALABRA: mostrar: false.
     =================================================================== */
  prueba: {
    mostrar: true,
    ventas: 278,
    desde: 'junio',
    reacciones: 2900,
    comentarios: 119
  },

  /* C6 — UN SOLO VERBO DE VERDAD (los 7 botones, el del nav incluido).
     Medido en lo SERVIDO el 2026-10-10 a 360 px: NO eran 3 textos como
     decia el traspaso (eso es el HTML crudo), eran 2 en el DOM pintado:
     'QUIERO EL PACK · $15.000 →' y 'COMPRAR' (este ultimo lo pone
     EV.verbo_corto a proposito, porque el largo rompia la barra).
     Para llegar a UNO sin romper el nav el precio sale del TEXTO del
     boton: la etiqueta queda 'QUIERO EL PACK' en los 7, y el precio
     sigue a la vista en #precio-grande, en la barra fija y en el FAQ,
     que ya lo pintan. Reversa: poner false y vuelve verbo+precio+verbo_corto. */
  un_solo_verbo: true,

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
var ATRIB = (function () {
  var limpio = function (v) {
    return v ? String(v).replace(/[^A-Za-z0-9_.-]/g, '').slice(0, 40) : '';
  };
  var out = { ad: '', camp: '', fuente: '', token: 'none', origen: 'ninguno' };
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
      out.token = [out.camp || 'sincamp', out.ad || 'sinad', out.fuente || 'directo'].join('-');
      out.origen = 'querystring';
      sessionStorage.setItem('evAtrib', JSON.stringify(out));
    } else {
      var g = sessionStorage.getItem('evAtrib');
      if (g) { out = JSON.parse(g); out.origen = 'sesion'; }
    }
  } catch (e) { log('atribución no legible: ' + e); }
  return out;
})();
window.__evAtrib = ATRIB;

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
  $$('[data-ev-precio], [data-ev-precio-top]').forEach(function (el) { el.textContent = t; });
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
    /* C1: en el nav manda el verbo corto (ver EV.verbo_corto).
       C6: con un_solo_verbo el nav YA NO es excepcion — la etiqueta
       pierde el precio y entra en una sola linea, asi que los 7 botones
       dicen lo mismo. */
    var angosto = !EV.un_solo_verbo && EV.verbo_corto && b.closest && b.closest('nav');
    if (angosto) {
      b.setAttribute('data-ev-corto', '1');
      b.textContent = EV.verbo_corto;
      return;
    }
    /* el verbo: uno solo, con el precio pegado. Los iconos que el
       diseño ya puso dentro del botón se respetan. */
    var svg = b.querySelector('svg');
    var etiqueta = EV.un_solo_verbo ? EV.verbo : (EV.verbo + ' · ' + t + ' →');
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
  /* C4 — desde el rebase sobre pack-scroll la garantia va EN EL HTML (en el
     .cta-note del hero), para que siga visible con el JS bloqueado. Si ya esta
     escrita, este chip la repetiria. Reversa: borrar estas 2 lineas. */
  var cont = (hero.closest && hero.closest('.hero-copy')) || (hero.parentNode && hero.parentNode.parentNode) || hero.parentNode;
  var nota = cont && cont.querySelector ? cont.querySelector('.cta-note') : null;
  if (nota && /[Gg]arant/.test(nota.textContent)) return;
  var c = document.createElement('div');
  c.setAttribute('data-ev-inyectado', 'chip');
  c.className = 'cta-note';
  c.style.cssText = 'margin-top:12px;display:flex;gap:7px;align-items:center;flex-wrap:wrap';
  c.innerHTML = '<span>🛡️ Garantía de 7 días — te devolvemos el 100%</span>' +
                '<span aria-hidden="true">·</span><span>Acceso inmediato</span>';
  if (hero.parentNode) hero.parentNode.insertBefore(c, hero.nextSibling);
}

/* ---------------------------------------------------------------------
   7bis. PRUEBA SOCIAL (C5) — la pagina tenia CERO.
   Medido en lo servido el 2026-10-10: 0 resenas, 0 estrellas, 0
   testimonios, 0 numeros de venta. Un pack de 15.000 sin una sola senal
   de que alguien ya lo compro se lee como tienda vacia.
   LO QUE SE PUBLICA ES SOLO LO MEDIDO (ver EV.prueba): packs vendidos y
   la reaccion real del anuncio. SIN estrellas y SIN citas, porque no
   existen. La banda se inyecta en DOS lugares y nada mas: bajo el hero
   (la promesa necesita respaldo inmediato) y pegada al precio (es donde
   se decide). Reversa: EV.prueba.mostrar = false.
   --------------------------------------------------------------------- */
function bandaPrueba(id) {
  var P = EV.prueba;
  var d = document.createElement('div');
  d.setAttribute('data-ev-inyectado', id);
  d.setAttribute('data-ev-prueba', '1');
  d.className = 'ev-prueba';
  var piezas = [];
  if (P.ventas) {
    piezas.push('<b>' + P.ventas.toLocaleString('es-CO') + '</b> packs vendidos' +
                (P.desde ? ' desde ' + P.desde : ''));
  }
  if (P.reacciones) {
    piezas.push('<b>+' + P.reacciones.toLocaleString('es-CO') + '</b> reacciones' +
                (P.comentarios ? ' y <b>' + P.comentarios + '</b> comentarios en el anuncio' : ''));
  }
  d.innerHTML = piezas.map(function (t) { return '<span class="ev-pz">' + t + '</span>'; })
                      .join('<span class="ev-sep" aria-hidden="true">·</span>');
  return d;
}

/* ---------------------------------------------------------------------
   7pre. QUE LO INYECTADO SIGA LA ALINEACION DEL DISENO (C8)
   MEDIDO el 2026-10-10 mirando la captura, no el numero: a 1280 px el
   hero de Esteban es alineado a la IZQUIERDA (el h1 arranca en x=120)
   pero mis bloques salian CENTRADOS (x=224, x=141, x=140) porque el
   padre .cta-row es flex y un 'margin:0 auto' ahi centra. A 360 px el
   mismo padre centra, asi que el bug solo se ve en escritorio.
   No se adivina el breakpoint del diseno: se LEE su text-align
   computado y se copia. Si manana Esteban mueve el breakpoint, esto lo
   sigue solo. Reversa: borrar esta funcion y las 3 llamadas. */
function alinearComoElPadre(el) {
  if (!el || !el.parentNode) return;
  function ajusta() {
    var ta = getComputedStyle(el.parentNode).textAlign;
    var izq = (ta === 'start' || ta === 'left');
    el.style.marginLeft = izq ? '0' : 'auto';
    el.style.marginRight = 'auto';
    el.style.textAlign = izq ? 'left' : 'center';
    if (getComputedStyle(el).display.indexOf('flex') >= 0) {
      el.style.justifyContent = izq ? 'flex-start' : 'center';
    }
  }
  ajusta();
  window.addEventListener('resize', ajusta);
}

/* ---------------------------------------------------------------------
   7quater. EL PRECIO VUELVE AL PLIEGUE (C6b)
   REGRESION QUE YO MISMO CAUSE Y MEDI: al dejar un solo verbo, la
   etiqueta perdio el '· $15.000 →', y con eso el precio dejo de verse
   sobre el pliegue (medido: primer '$15.000' visible pasaba al 75% de
   la pagina; #buybar-precio existe pero esta display:none en el hero).
   En este pack el precio es ARGUMENTO, no friccion: 15.000 COP es la
   razon por la que se compra de impulso. Asi que vuelve, pero AL LADO
   del boton y no DENTRO: el verbo sigue siendo uno solo.
   El numero NO se escribe a mano: sale de precioDe(), la misma fuente
   que pinta #precio-grande y la barra fija. Reversa: EV.un_solo_verbo
   = false (este bloque no corre si el precio ya va en el boton). */
function precioArriba() {
  if (!EV.inyectar || !EV.un_solo_verbo) return;
  var hero = $('#btn-hero');
  if (!hero || $('[data-ev-inyectado="precio-top"]')) return;
  var d = document.createElement('div');
  d.setAttribute('data-ev-inyectado', 'precio-top');
  d.className = 'ev-precio-top';
  d.innerHTML = '<b data-ev-precio-top="1">' + precioDe(comboActual) + '</b>' +
                '<span>pago único · acceso de por vida</span>';
  if (hero.parentNode) hero.parentNode.insertBefore(d, hero);
  alinearComoElPadre(d);
}

function pruebaSocial() {
  if (!EV.inyectar || !EV.prueba || !EV.prueba.mostrar) return;
  if (!EV.prueba.ventas && !EV.prueba.reacciones) return;   /* sin dato medido, no se inventa nada */

  /* a) bajo el hero, despues del CTA y de su nota */
  var hero = $('#btn-hero');
  if (hero && !$('[data-ev-inyectado="prueba-hero"]')) {
    var cont = (hero.closest && hero.closest('.hero-copy')) || hero.parentNode;
    var ref = hero;
    var nota = cont && cont.querySelector ? cont.querySelector('.cta-note') : null;
    if (nota && nota.parentNode === hero.parentNode) ref = nota;
    if (ref.parentNode) {
      var bh = bandaPrueba('prueba-hero');
      ref.parentNode.insertBefore(bh, ref.nextSibling);
      alinearComoElPadre(bh);
    }
  }

  /* b) pegada al precio, ARRIBA del boton de pago: la senal llega antes
     de que el ojo toque el numero, no despues. */
  var btn = $('#btn-pago');
  if (btn && btn.parentNode && !$('[data-ev-inyectado="prueba-precio"]')) {
    btn.parentNode.insertBefore(bandaPrueba('prueba-precio'), btn);
  }
}

/* ---------------------------------------------------------------------
   7ter. LA URGENCIA, ARRIBA (C7)
   El contador YA EXISTE y anda (#reloj-d, 15 min por sesion). El
   problema medido no es que falte: es DONDE esta. En lo servido el
   2026-10-10 arrancaba al 78% de la pagina (9.214 px de 11.775 a 360
   px), o sea solo lo ve quien ya bajo casi todo. Se agrega un SEGUNDO
   tiro sobre el pliegue.
   UN SOLO DEADLINE: este espejo NO calcula nada ni escribe
   sessionStorage. Copia el texto del #reloj-d original en cada tick, asi
   que es IMPOSIBLE que los dos se desincronicen — no hay dos relojes,
   hay un reloj y un espejo. Si el original no existe, el espejo no se
   inyecta (nunca un contador fantasma). Reversa: EV.inyectar = false.
   --------------------------------------------------------------------- */
function relojArriba() {
  if (!EV.inyectar) return;
  var orig = document.getElementById('reloj-d');
  if (!orig) { log('AVISO: no hay #reloj-d; no se inyecta el espejo de arriba'); return; }
  var hero = $('#btn-hero');
  if (!hero || $('[data-ev-inyectado="reloj-arriba"]')) return;

  var d = document.createElement('div');
  d.setAttribute('data-ev-inyectado', 'reloj-arriba');
  d.className = 'reloj ev-reloj-top';
  var et = document.createElement('span');
  et.className = 'rl';
  /* el rotulo se copia del que la pagina ya publica, no se inventa otro */
  var rotuloOrig = orig.parentNode ? orig.parentNode.querySelector('.rl') : null;
  et.textContent = (rotuloOrig && rotuloOrig.textContent.trim()) || 'La oferta termina en';
  var b = document.createElement('b');
  b.setAttribute('data-ev-reloj-d', '1');
  b.textContent = orig.textContent;
  d.appendChild(et); d.appendChild(b);

  /* va ARRIBA del CTA del hero: primero el reloj, despues el boton */
  var ref = hero;
  var cont = (hero.closest && hero.closest('.hero-copy')) || hero.parentNode;
  var chip = cont && cont.querySelector ? cont.querySelector('[data-ev-inyectado="prueba-hero"]') : null;
  if (ref.parentNode) ref.parentNode.insertBefore(d, ref);
  alinearComoElPadre(d);

  function espeja() { b.textContent = orig.textContent; }
  espeja();
  if (window.MutationObserver) {
    new MutationObserver(espeja).observe(orig, { childList: true, characterData: true, subtree: true });
  }
  setInterval(espeja, 500);   /* cinturon: si el original se repinta sin mutar el nodo */
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
  chipGarantia();
  pruebaSocial();
  precioArriba();
  relojArriba();
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
      ' · prueba=' + $$('[data-ev-prueba]').length +
      ' · relojes=' + (document.querySelectorAll('#reloj-d, [data-ev-reloj-d]').length) +
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
