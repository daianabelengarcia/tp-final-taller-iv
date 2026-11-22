import { h, render, Component, Fragment } from './vendor/preact.module.js';
import { DC, loadDC } from './runtime.js';

const stage = document.getElementById('stage');

function fit() {
  const k = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
  stage.style.transform = `translate(-50%, -50%) scale(${k})`;
}
window.addEventListener('resize', fit);
fit();

const SPEAKER = (on) => h('svg', { width: 24, height: 24, viewBox: '0 0 12 12', 'shape-rendering': 'crispEdges', 'aria-hidden': 'true' },
  h('rect', { x: 1, y: 4, width: 3, height: 4, fill: '#e6dfc0' }),
  h('rect', { x: 4, y: 3, width: 1, height: 6, fill: '#e6dfc0' }),
  h('rect', { x: 5, y: 2, width: 1, height: 8, fill: '#e6dfc0' }),
  on ? [h('rect', { x: 8, y: 4, width: 1, height: 4, fill: '#e8b33a' }), h('rect', { x: 10, y: 3, width: 1, height: 6, fill: '#e8b33a' })]
     : [h('rect', { x: 8, y: 4, width: 1, height: 1, fill: '#e05a4a' }), h('rect', { x: 9, y: 5, width: 1, height: 2, fill: '#e05a4a' }), h('rect', { x: 10, y: 7, width: 1, height: 1, fill: '#e05a4a' }), h('rect', { x: 10, y: 4, width: 1, height: 1, fill: '#e05a4a' }), h('rect', { x: 8, y: 7, width: 1, height: 1, fill: '#e05a4a' })]);

// Sin pantalla de título: el juego abre directo en el celular.
class App extends Component {
  constructor() {
    super();
    let sound = true;
    try { sound = localStorage.getItem('combinacion-sound') !== 'off'; } catch (e) {}
    this.state = { sound };
  }
  toggleSound(e) {
    e.stopPropagation(); e.preventDefault();
    const sound = !this.state.sound;
    try { localStorage.setItem('combinacion-sound', sound ? 'on' : 'off'); } catch (err) {}
    this.setState({ sound });
    if (this.logic) this.logic.focus();
  }
  render(_, s) {
    return h(Fragment, null,
      h(DC, { key: 'Recorrido', name: 'Recorrido', props: { sound: s.sound, volume: 0.55 }, onLogic: (l) => { this.logic = l; window.combinacion = l; } }),
      h('button', { class: 'mute', 'aria-label': s.sound ? 'Silenciar' : 'Activar sonido', onPointerDown: (e) => e.stopPropagation(), onClick: (e) => this.toggleSound(e) }, SPEAKER(s.sound)));
  }
}

// Si el foco se va del escenario (por ejemplo, al hacer clic en el borde negro), las teclas siguen llegando al juego.
const inStage = (t) => t && t.closest && t.closest('.stage');
window.addEventListener('keydown', (e) => { const l = window.combinacion; if (l && !inStage(e.target) && l.onKeyDown) l.onKeyDown(e); });
window.addEventListener('keyup', (e) => { const l = window.combinacion; if (l && !inStage(e.target) && l.onKeyUp) l.onKeyUp(e); });
document.addEventListener('pointerdown', (e) => { const l = window.combinacion; if (l && !inStage(e.target) && !(e.target.closest && e.target.closest('button'))) l.focus(); });

Promise.all(['Inicio', 'Recorrido', 'FinalTarde', 'FinalChoque'].map(loadDC))
  .then(() => render(h(App), stage))
  .catch((err) => {
    console.error(err);
    stage.innerHTML = '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:60px;box-sizing:border-box;text-align:center;font-family:VT323,monospace;font-size:34px;color:#e6dfc0">No se pudo cargar el juego. Si abriste el archivo directamente, hace falta servirlo desde una página web (por ejemplo GitHub Pages).</div>';
  });
