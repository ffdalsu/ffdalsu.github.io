/*
 * Modal de video de los proyectos (requisito de la guía: se abre con jQuery).
 *
 * Cada botón «ver video» lleva data-video-id (el ID de YouTube) y data-titulo. Al abrir, el iframe recibe
 * la URL de youtube-nocookie con reproducción automática; al cerrar, la URL se vacía para que el video se
 * detenga. Si el proyecto aún no tiene video, el modal muestra una pantalla de estática ASCII.
 */
window.Portafolio = window.Portafolio || {};

Portafolio.Proyectos = (function () {
  const reducir = window.matchMedia('(prefers-reduced-motion: reduce)');
  let animandoEstatica = false;

  /** URL de inserción de un video de YouTube, sin cookies de seguimiento y sin videos sugeridos al final. */
  function urlVideo(id) {
    return 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
  }

  /** Estática de televisión en caracteres, mientras el proyecto no tenga video. */
  function estatica(canvas) {
    const r = Portafolio.Rejilla(canvas, { tamFuente: 12 });
    const ruido = ' .·:-=+';
    animandoEstatica = true;
    (function cuadro() {
      if (!animandoEstatica) return;
      const lineas = [];
      for (let f = 0; f < r.filas; f++) {
        let s = '';
        for (let c = 0; c < r.cols; c++) s += ruido[Math.floor(Math.random() * (Math.random() < 0.9 ? 3 : ruido.length))];
        lineas.push(s);
      }
      r.limpiar();
      r.capas(lineas, getComputedStyle(document.documentElement).getPropertyValue('--tenue').trim());
      if (!reducir.matches) setTimeout(() => requestAnimationFrame(cuadro), 70);
    })();
  }

  $(function () {
    const $modal = $('#modal-video');
    const $iframe = $modal.find('iframe');
    const $pantalla = $modal.find('.video-pendiente');

    $('.boton-video').on('click', function () {
      const id = $(this).data('video-id');
      const titulo = $(this).data('titulo');
      $('#modal-video-titulo').text('video · ' + String(titulo).toLowerCase());
      if (id) {
        $iframe.attr('src', urlVideo(id)).attr('title', 'Video de ' + titulo).prop('hidden', false);
        $pantalla.prop('hidden', true);
      } else {
        $iframe.removeAttr('src').prop('hidden', true);
        $pantalla.prop('hidden', false);
      }
      $modal.modal('show');
    });

    $modal.on('shown.bs.modal', function () { if (!$pantalla.prop('hidden')) estatica($pantalla.find('canvas')[0]); });
    // al empezar a cerrar se vacía el iframe: el video deja de sonar en ese instante, sin esperar la animación
    $modal.on('hide.bs.modal', function () { $iframe.removeAttr('src'); animandoEstatica = false; });

    // al llegar desde una isla del inicio (projects.html#slug) el proyecto se resalta un momento
    if (location.hash) {
      const destino = document.querySelector(location.hash);
      if (destino && destino.classList.contains('proyecto')) destino.classList.add('resaltado');
    }
  });

  return { urlVideo: urlVideo };
})();
