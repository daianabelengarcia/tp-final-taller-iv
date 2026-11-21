import { h, render, Component } from './vendor/preact.module.js';
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

class App extends Component {
  constructor() {
    super();
    let sound = true;
    try { sound = localStorage.getItem('combinacion-sound') !== 'off'; } catch (e) {}
    this.state = { screen: 'title', sound };
    this.start = this.start.bind(this);
    this.onKey = (e) => { if (this.state.screen === 'title' && !e.repeat) { e.preventDefault(); this.start(); } };
  }
  componentDidMount() { window.addEventListener('keydown', this.onKey); if (this.titleEl) this.titleEl.focus(); }
  componentWillUnmount() { window.removeEventListener('keydown', this.onKey); }
  start() {
    if (this.state.screen !== 'title') return;
    this.setState({ screen: 'game' }, () => {
      // el juego abre con el celular: el próximo gesto habilita el audio y arranca
      if (this.logic) this.logic.focus();
    });
  }
  toggleSound(e) {
    e.stopPropagation(); e.preventDefault();
    const sound = !this.state.sound;
    try { localStorage.setItem('combinacion-sound', sound ? 'on' : 'off'); } catch (err) {}
    this.setState({ sound });
    if (this.logic) this.logic.focus();
  }
  render(_, s) {
    const mute = h('button', { class: 'mute', 'aria-label': s.sound ? 'Silenciar' : 'Activar sonido', onPointerDown: (e) => e.stopPropagation(), onClick: (e) => this.toggleSound(e) }, SPEAKER(s.sound));
    if (s.screen === 'game') {
      return h('x-frag', null,
        h(DC, { key: 'Recorrido', name: 'Recorrido', props: { sound: s.sound, volume: 0.55 }, onLogic: (l) => { this.logic = l; window.combinacion = l; } }),
        mute);
    }
    return h('x-frag', null,
      h('img', { src: 'assets/img/tramo0.png', alt: '', style: 'position:absolute;inset:0;width:1280px;height:720px;image-rendering:pixelated;filter:brightness(.45) saturate(.8)' }),
      h('div', { style: 'position:absolute;inset:0;background:linear-gradient(90deg,rgba(7,7,5,.85) 0,rgba(7,7,5,.35) 55%,rgba(7,7,5,.1) 100%)' }),
      h('div', { class: 'title', tabIndex: 0, ref: (el) => { this.titleEl = el; }, onClick: this.start, role: 'button', 'aria-label': 'Empezar a jugar' },
        h('div', { style: 'position:absolute;left:70px;top:150px;display:flex;flex-direction:column;gap:22px' },
          h('div', { class: 'logo' }, 'COMBI', h('br'), 'NACIÓN'),
          h('div', { style: 'display:flex;align-items:center' },
            h('div', { class: 'badge', style: 'background:#3bb3e6' }, 'A'),
            h('div', { style: 'width:70px;height:6px;background:repeating-linear-gradient(90deg,#bdb795 0 8px,transparent 8px 14px)' }),
            h('div', { class: 'badge', style: 'background:#f2c200' }, 'H')),
          h('div', { class: 'tagline' }, 'Tenés 10 minutos para llegar al trabajo. En el camino pasan cosas que nadie mira.')),
        h('div', { class: 'prompt', style: 'position:absolute;left:880px;top:300px;display:flex;flex-direction:column;align-items:center;gap:18px' },
          h('div', { style: 'display:flex;gap:16px;align-items:flex-end' },
            h('div', { class: 'key', style: 'width:96px;height:34px;padding-bottom:8px' }, h('div', { style: 'width:60px;height:5px;background:#10110c' })),
            h('svg', { width: 34, height: 46, viewBox: '0 0 8 11', 'shape-rendering': 'crispEdges', 'aria-hidden': 'true' },
              h('rect', { x: 0, y: 0, width: 8, height: 11, fill: '#070705' }), h('rect', { x: 1, y: 1, width: 6, height: 9, fill: '#e6dfc0' }), h('rect', { x: 1, y: 1, width: 3, height: 4, fill: '#e8b33a' }), h('rect', { x: 4, y: 1, width: 1, height: 4, fill: '#070705' }))),
          h('div', { style: "font-family:'Silkscreen',monospace;font-size:14px;letter-spacing:3px;color:#e6dfc0" }, 'JUGAR')),
        h('div', { class: 'credit' }, 'flechas o mouse · espacio o clic sostenido')),
      mute);
  }
}

Promise.all(['Inicio', 'Recorrido', 'FinalTarde', 'FinalChoque'].map(loadDC)).then(() => render(h(App), stage));
