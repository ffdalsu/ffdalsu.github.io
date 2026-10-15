/*
 * Pie de página: reloj con la hora de Medellín (America/Bogota), que se actualiza cada 15 segundos.
 */
window.Portafolio = window.Portafolio || {};

Portafolio.Reloj = (function () {
  function hora() {
    return new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Bogota' });
  }
  // un solo intervalo para toda la visita; cada tic busca el reloj de la página que esté montada
  const pintar = () => { const reloj = document.getElementById('reloj'); if (reloj) reloj.textContent = hora(); };
  setInterval(pintar, 15000);
  Portafolio.Paginas.montar(pintar);
  return { hora: hora };
})();
