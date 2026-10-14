/*
 * Pie de página: reloj con la hora de Medellín (America/Bogota), que se actualiza cada 15 segundos.
 */
window.Portafolio = window.Portafolio || {};

Portafolio.Reloj = (function () {
  function hora() {
    return new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Bogota' });
  }
  $(function () {
    const reloj = document.getElementById('reloj');
    if (!reloj) return;
    const pintar = () => { reloj.textContent = hora(); };
    pintar();
    setInterval(pintar, 15000);
  });
  return { hora: hora };
})();
