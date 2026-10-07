// Piezas compartidas por las tarjetas SVG: paleta, fuentes incrustadas y marco.
// Las fuentes van en base64 porque GitHub muestra los SVG como <img>, que no
// carga recursos externos; sin esto el texto caería a la fuente del sistema.
const fs = require('fs');
const path = require('path');

const W = 1280;
const C = {
  bg0: '#070a12', bg1: '#0c1322', card: '#0f1729',
  text: '#eef2ff', soft: '#c7d2fe', dim: '#8b95b5', faint: '#3a4566',
  cyan: '#22d3ee', violet: '#a78bfa', green: '#34d399', amber: '#fbbf24',
};

const font = f => fs.readFileSync(path.join(__dirname, 'fonts', f)).toString('base64');
const FONTS = `
@font-face{font-family:SG;font-weight:500;src:url(data:font/woff2;base64,${font('space-grotesk-latin-500-normal.woff2')}) format('woff2')}
@font-face{font-family:SG;font-weight:700;src:url(data:font/woff2;base64,${font('space-grotesk-latin-700-normal.woff2')}) format('woff2')}
@font-face{font-family:JB;font-weight:500;src:url(data:font/woff2;base64,${font('jetbrains-mono-latin-500-normal.woff2')}) format('woff2')}`;

// Animaciones reutilizables. --d es el retraso de cada elemento (cascada).
const BASE_CSS = `
${FONTS}
text{font-family:SG,'Segoe UI',sans-serif}
.mono{font-family:JB,Consolas,monospace}
.rise{opacity:0;animation:rise .9s cubic-bezier(.2,.8,.2,1) var(--d,0s) both}
.pop{opacity:0;transform-box:fill-box;transform-origin:center;animation:pop .7s cubic-bezier(.3,1.5,.5,1) var(--d,0s) both}
.fade{opacity:0;animation:fade 1s ease var(--d,0s) both}
.draw{stroke-dasharray:var(--len);stroke-dashoffset:var(--len);animation:draw var(--dur,1.6s) cubic-bezier(.6,0,.2,1) var(--d,0s) forwards}
.orbit{animation:orbit 6s linear var(--d,0s) infinite}
.breathe{animation:breathe 3.2s ease-in-out var(--d,0s) infinite}
.blink{animation:blink 1.4s steps(2) var(--d,0s) infinite}
.floaty{transform-box:fill-box;animation:floaty 4s ease-in-out var(--d,0s) infinite}
@keyframes rise{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
@keyframes pop{0%{opacity:0;transform:scale(.4)}100%{opacity:1;transform:scale(1)}}
@keyframes fade{to{opacity:1}}
@keyframes draw{to{stroke-dashoffset:0}}
@keyframes orbit{to{stroke-dashoffset:calc(var(--len) * -1)}}
@keyframes breathe{0%,100%{opacity:.35}50%{opacity:1}}
@keyframes blink{0%{opacity:1}100%{opacity:.15}}
@keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-iteration-count:1!important}}`;

const DEFS = `
<linearGradient id="gBrand" x1="0" x2="1"><stop offset="0" stop-color="${C.cyan}"/><stop offset="1" stop-color="${C.violet}"/></linearGradient>
<linearGradient id="gBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.bg0}"/><stop offset="1" stop-color="${C.bg1}"/></linearGradient>
<radialGradient id="gGlowC"><stop offset="0" stop-color="${C.cyan}" stop-opacity=".16"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></radialGradient>
<radialGradient id="gGlowV"><stop offset="0" stop-color="${C.violet}" stop-opacity=".14"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></radialGradient>
<pattern id="pDots" width="32" height="32" patternUnits="userSpaceOnUse"><rect x="16" y="16" width="1.5" height="1.5" fill="${C.dim}" fill-opacity=".12"/></pattern>
<filter id="fGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>`;

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Lienzo completo con el mismo fondo del encabezado y un título de sección.
function frame({ h, kicker, title, body, css = '', defs = '' }) {
  const head = kicker ? `
  <g class="rise" style="--d:0s">
    <rect x="48" y="40" width="3" height="52" rx="1.5" fill="url(#gBrand)"/>
    <text x="68" y="58" class="mono" font-size="15" letter-spacing="3" fill="${C.cyan}">${esc(kicker)}</text>
    <text x="68" y="90" font-size="30" font-weight="700" fill="${C.text}">${esc(title)}</text>
  </g>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}" role="img" aria-label="${esc(title || kicker || '')}">
<style>${BASE_CSS}${css}</style>
<defs>${DEFS}${defs}</defs>
<rect width="${W}" height="${h}" rx="20" fill="url(#gBg)"/>
<rect width="${W}" height="${h}" rx="20" fill="url(#pDots)"/>
<ellipse cx="${W - 180}" cy="${h / 2}" rx="420" ry="${h}" fill="url(#gGlowC)" class="breathe"/>
<ellipse cx="160" cy="0" rx="380" ry="${h * 0.8}" fill="url(#gGlowV)" class="breathe" style="--d:1.6s"/>
<rect x=".5" y=".5" width="${W - 1}" height="${h - 1}" rx="20" fill="none" stroke="${C.violet}" stroke-opacity=".18"/>
${head}
${body}
</svg>`;
}

// Tarjeta interna con borde por el que corre una luz en bucle.
function card({ x, y, w, h, d = 0, r = 16 }) {
  const len = 2 * (w + h);
  return `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${C.card}" fill-opacity=".85" stroke="${C.violet}" stroke-opacity=".22"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="url(#gBrand)" stroke-width="1.6"
        pathLength="${len}" stroke-dasharray="${len * 0.16} ${len * 0.84}" class="orbit" style="--len:${len};--d:${-d * 1.5}s"/>`;
}

// Icono de simple-icons (viewBox 24) escalado a `size`.
function icon(name, x, y, size, color) {
  const svg = fs.readFileSync(path.join(__dirname, 'icons', name + '.svg'), 'utf8');
  const d = svg.match(/ d="([^"]+)"/)[1];
  return `<path transform="translate(${x} ${y}) scale(${size / 24})" d="${d}" fill="${color}"/>`;
}

// Contador tipo odómetro: cada dígito es una columna 0–9 (x2) que se desliza.
let odoId = 0;
function odometer({ x, y, value, size, color = C.text, d = 0, prefix = '', anchor = 'middle' }) {
  const str = String(value), cw = size * 0.6, lh = size * 1.6, win = size * 0.92;
  const total = (prefix.length + str.length) * cw;
  let cx = anchor === 'middle' ? x - total / 2 : x;
  const id = `odo${odoId++}`;
  // Un <svg> anidado recorta su contenido siempre (overflow hidden por defecto);
  // con clipPath, Chromium dejaba ver los dígitos vecinos durante la animación.
  const top = y - size * 0.8, base = size * 0.8; // línea base dentro de la ventana
  let out = `<svg x="${cx - 4}" y="${top}" width="${total + 8}" height="${win}" overflow="hidden"><g class="mono" font-size="${size}" font-weight="500" fill="${color}">`;
  let lx = 4;
  for (const ch of prefix) { out += `<text x="${lx}" y="${base}" class="mono fade" style="--d:${d}s">${esc(ch)}</text>`; lx += cw; }
  [...str].forEach((ch, i) => {
    const steps = 10 + +ch;
    const col = Array.from({ length: 20 }, (_, k) => `<tspan x="${lx}" y="${base + k * lh}">${k % 10}</tspan>`).join('');
    out += `<text class="mono" style="animation:${id}_${i} ${1.4 + i * 0.25}s cubic-bezier(.2,.7,.2,1) ${d}s both">${col}</text>
    <style>@keyframes ${id}_${i}{from{transform:translateY(0)}to{transform:translateY(${-steps * lh}px)}}</style>`;
    lx += cw;
  });
  return out + '</g></svg>';
}

module.exports = { W, C, frame, card, icon, odometer, esc };
