/*
 * Registro de páginas (F13): cada módulo dice qué hacer al montar una página y qué al desmontarla.
 *
 *   Portafolio.Paginas.montar(fn)      fn se ejecuta al cargar la página y cada vez que js/navegacion.js cambia de
 *                                      página sin recargar (debe buscar sus elementos en el DOM de ese momento).
 *   Portafolio.Paginas.desmontar(fn)   fn se ejecuta antes de cambiar de página: detiene bucles, intervalos y
 *                                      observadores para que no se acumulen.
 *
 * Lo que es de toda la visita (el audio, los oyentes en document o window) se registra una sola vez y no pasa por aquí.
 */
window.Portafolio = window.Portafolio || {};

Portafolio.Paginas = (function () {
  const montadores = [];
  const desmontadores = [];
  let listo = false;
  let montajes = 0;

  function montarTodo() {
    montajes++;
    montadores.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } });
  }

  function desmontarTodo() {
    desmontadores.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } });
  }

  $(function () { listo = true; montarTodo(); });

  return {
    montar: function (fn) { montadores.push(fn); if (listo) fn(); },
    desmontar: function (fn) { desmontadores.push(fn); },
    montarTodo: montarTodo,
    desmontarTodo: desmontarTodo,
    estado: function () { return { montajes: montajes, pagina: (document.querySelector('main') || {}).dataset ? document.querySelector('main').dataset.pagina : null }; }
  };
})();
