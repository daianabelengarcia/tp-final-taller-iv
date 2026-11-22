// Motor mínimo para correr las pantallas .dc.html del canvas como página común.
// Lee el marcado (con {{huecos}}, <sc-if>, <sc-for> y <dc-import>) y la clase Component
// de cada archivo, y lo dibuja con Preact.
import { h, Fragment, Component as PComponent } from './vendor/preact.module.js';

const defs = {};
const injected = new Set();

export class DCLogic {
  constructor(props) { this.props = props; this.state = {}; }
  setState(u) {
    const v = typeof u === 'function' ? u(this.state, this.props) : u;
    if (v) Object.assign(this.state, v);
    if (this._host) this._host.forceUpdate();
  }
  forceUpdate() { if (this._host) this._host.forceUpdate(); }
  renderVals() { return {}; }
}

export async function loadDC(name) {
  if (defs[name]) return defs[name];
  const res = await fetch(`dc/${name}.dc.html`);
  if (!res.ok) throw new Error(`No se pudo cargar dc/${name}.dc.html (${res.status})`);
  const src = await res.text();
  const doc = new DOMParser().parseFromString(src, 'text/html');
  const xdc = doc.querySelector('x-dc');
  const helmet = xdc.querySelector('helmet');
  const script = doc.querySelector('script[data-dc-script]');
  const meta = JSON.parse(script.getAttribute('data-props') || '{}');
  const defaults = {};
  for (const k in meta) if (k[0] !== '$' && meta[k] && 'default' in meta[k]) defaults[k] = meta[k].default;
  const Logic = new Function('DCLogic', script.textContent + '\nreturn Component;')(DCLogic);
  const nodes = [...xdc.childNodes].filter((n) => n !== helmet);
  if (helmet && !injected.has(name)) {
    injected.add(name);
    helmet.querySelectorAll('style, link').forEach((el) => document.head.appendChild(document.importNode(el, true)));
  }
  defs[name] = { name, Logic, defaults, nodes };
  return defs[name];
}

const HOLE = /\{\{\s*([\w.$]+)\s*\}\}/g;
const EXACT = /^\s*\{\{\s*([\w.$]+)\s*\}\}\s*$/;

function lookup(path, scope) {
  if (path === 'true') return true;
  if (path === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
  let v = scope;
  for (const part of path.split('.')) { if (v == null) return undefined; v = v[part]; }
  return v;
}
function interp(str, scope) {
  return str.replace(HOLE, (_, p) => { const v = lookup(p, scope); return v == null ? '' : String(v); });
}
function val(str, scope) {
  const m = str.match(EXACT);
  return m ? lookup(m[1], scope) : interp(str, scope);
}
const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

function conv(node, scope, key) {
  if (node.nodeType === 3) {
    const t = node.nodeValue;
    if (!t.trim()) return null;
    return interp(t, scope);
  }
  if (node.nodeType !== 1) return null;
  const name = node.localName;
  const kids = (sc) => [...node.childNodes].map((c, i) => conv(c, sc, i)).filter((x) => x !== null);
  if (name === 'sc-if') return lookup((node.getAttribute('value') || '').replace(/[{}\s]/g, ''), scope) ? h(Fragment, { key }, kids(scope)) : null;
  if (name === 'sc-for') {
    const list = lookup((node.getAttribute('list') || '').replace(/[{}\s]/g, ''), scope) || [];
    const as = node.getAttribute('as') || 'item';
    return h(Fragment, { key }, list.map((it, i) => h(Fragment, { key: i }, kids(Object.assign(Object.create(scope), { [as]: it, $index: i })))));
  }
  if (name === 'dc-import') {
    const props = {};
    for (const a of node.attributes) if (a.name !== 'name' && !a.name.startsWith('hint-')) props[camel(a.name)] = val(a.value, scope);
    return h(DC, { key, name: node.getAttribute('name'), props });
  }
  const props = { key };
  for (const a of node.attributes) {
    if (a.name.startsWith('hint-')) continue;
    const v = val(a.value, scope);
    if (a.name === 'ref') props.ref = v;
    else props[a.name] = v;
  }
  return h(name, props, kids(scope));
}

export class DC extends PComponent {
  constructor(p) {
    super(p);
    const def = defs[p.name];
    this.def = def;
    this.logic = new def.Logic(Object.assign({}, def.defaults, p.props));
    this.logic._host = this;
    if (p.onLogic) p.onLogic(this.logic);
  }
  componentDidMount() { if (this.logic.componentDidMount) this.logic.componentDidMount(); }
  componentWillUnmount() { if (this.logic.componentWillUnmount) this.logic.componentWillUnmount(); }
  render(p) {
    const prev = this.logic.props;
    this.logic.props = Object.assign({}, this.def.defaults, p.props);
    if (this.logic.componentDidUpdate && prev !== this.logic.props) {
      const changed = Object.keys(this.logic.props).some((k) => prev[k] !== this.logic.props[k]);
      if (changed) queueMicrotask(() => this.logic.componentDidUpdate(prev));
    }
    const vals = this.logic.renderVals();
    return h(Fragment, null, this.def.nodes.map((n, i) => conv(n, vals, i)).filter((x) => x !== null));
  }
}
