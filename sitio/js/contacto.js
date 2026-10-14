/*
 * Formulario de contacto (modal «[ escríbeme ]» del pie, estilo terminal de la maqueta A).
 *
 * Valida con jQuery y escribe el resultado en el registro (✗ por cada campo con problema, ✓ al enviar).
 * Envío:
 *   - si el formulario tiene data-formspree="<id>", lo manda por Formspree (POST con respuesta JSON);
 *   - si no, abre el programa de correo del visitante con el mensaje ya escrito (mailto).
 * El campo _gotcha está oculto: si un robot lo llena, Formspree descarta el mensaje.
 */
window.Portafolio = window.Portafolio || {};

Portafolio.Contacto = (function () {
  const CORREO = 'ffdalsu.dev@gmail.com';
  const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const MENSAJES = {
    nombre: 'nombre: escribe cómo te llamas',
    correo: 'correo: escribe uno válido, como nombre@dominio.com',
    mensaje: 'mensaje: cuéntame un poco más (mínimo 10 caracteres)'
  };

  const api = {
    /** Abre el programa de correo; está aparte para que las pruebas lo puedan reemplazar. */
    abrirCorreo: function (url) { window.location.href = url; }
  };

  function validar(datos) {
    return {
      nombre: datos.nombre.length > 0,
      correo: CORREO_VALIDO.test(datos.correo),
      mensaje: datos.mensaje.length >= 10
    };
  }

  function registrar($log, lineas) {
    $log.empty();
    lineas.forEach(function (l) { $('<span>').addClass(l.tipo).text(l.texto).appendTo($log).after('\n'); });
  }

  $(function () {
    const $form = $('#form-contacto');
    if (!$form.length) return;
    const $log = $('#log-contacto');
    const $boton = $form.find('button[type=submit]');

    // cualquier [ escríbeme ] abre el modal (pie de las tres páginas y llamado a contacto del inicio)
    $('.abrir-contacto').on('click', function () { $('#modal-contacto').modal('show'); });
    $('#modal-contacto').on('shown.bs.modal', function () { $('#contacto-nombre').trigger('focus'); });

    $form.on('submit', function (e) {
      e.preventDefault();
      if ($boton.prop('disabled')) return;   // ya hay un envío en curso
      const datos = {
        nombre: $.trim($('#contacto-nombre').val()),
        correo: $.trim($('#contacto-correo').val()),
        mensaje: $.trim($('#contacto-mensaje').val())
      };
      const ok = validar(datos);
      const errores = [];
      Object.keys(ok).forEach(function (campo) {
        $form.find('[data-campo=' + campo + ']').toggleClass('mal', !ok[campo]);
        if (!ok[campo]) errores.push({ tipo: 'error', texto: '✗ ' + MENSAJES[campo] });
      });
      if (errores.length) { registrar($log, errores); return; }

      const id = $.trim($form.attr('data-formspree') || '');
      if (!id) {
        const asunto = encodeURIComponent('Contacto desde el portafolio · ' + datos.nombre);
        const cuerpo = encodeURIComponent(datos.mensaje + '\n\n— ' + datos.nombre + ' (' + datos.correo + ')');
        api.abrirCorreo('mailto:' + CORREO + '?subject=' + asunto + '&body=' + cuerpo);
        registrar($log, [{ tipo: 'ok', texto: '✓ se abrió tu programa de correo con el mensaje listo para enviar' }]);
        return;
      }

      $boton.prop('disabled', true);
      registrar($log, [{ tipo: 'tenue', texto: '→ enviando…' }]);
      $.ajax({
        url: 'https://formspree.io/f/' + encodeURIComponent(id),
        method: 'POST',
        dataType: 'json',
        headers: { Accept: 'application/json' },
        data: { nombre: datos.nombre, email: datos.correo, mensaje: datos.mensaje, _gotcha: $('#contacto-gotcha').val() }
      }).done(function () {
        registrar($log, [{ tipo: 'ok', texto: '✓ mensaje enviado. Te respondo pronto a ' + datos.correo }]);
        $form[0].reset();
      }).fail(function (xhr) {
        registrar($log, [{ tipo: 'error', texto: '✗ no se pudo enviar (' + (xhr.status || 'sin conexión') + '). Escríbeme directo a ' + CORREO }]);
      }).always(function () { $boton.prop('disabled', false); });
    });
  });

  return api;
})();
