// Genera las tarjetas SVG animadas del perfil en assets/.
// Uso: node build/build.js
const fs = require('fs');
const path = require('path');
const { W, C, frame, card, icon, odometer, esc } = require('./lib');

const out = (name, svg) => fs.writeFileSync(path.join(__dirname, '..', 'assets', name), svg);
const PAD = 48, GAP = 24;

// Iconos dibujados a mano para "Sobre mí" (trazos simples, 48x48).
const glyph = {
  chart: (x, y) => `<g transform="translate(${x} ${y})" fill="url(#gBrand)">
    ${[[4, 26, 20], [16, 16, 30], [28, 8, 38], [40, 20, 26]].map(([bx, by, bh], i) =>
      `<rect x="${bx - 2}" y="${by}" width="7" height="${46 - by}" rx="2" style="transform-box:fill-box;transform-origin:bottom;animation:bars 2.4s ease-in-out ${i * 0.2}s infinite"/>`).join('')}
  </g>`,
  bot: (x, y) => `<g transform="translate(${x} ${y})">
    <rect x="6" y="12" width="36" height="28" rx="9" fill="none" stroke="url(#gBrand)" stroke-width="3"/>
    <line x1="24" y1="4" x2="24" y2="12" stroke="${C.cyan}" stroke-width="3"/><circle cx="24" cy="4" r="3.5" fill="${C.violet}" class="breathe"/>
    <circle cx="17" cy="26" r="3.5" fill="${C.cyan}" class="blink"/><circle cx="31" cy="26" r="3.5" fill="${C.cyan}" class="blink" style="--d:.2s"/>
  </g>`,
  server: (x, y) => `<g transform="translate(${x} ${y})">
    ${[4, 18, 32].map((sy, i) => `<rect x="4" y="${sy}" width="40" height="11" rx="3" fill="none" stroke="url(#gBrand)" stroke-width="2.5"/>
      <circle cx="12" cy="${sy + 5.5}" r="2.2" fill="${C.green}" class="blink" style="--d:${i * 0.45}s"/>
      <rect x="20" y="${sy + 4.5}" width="18" height="2" rx="1" fill="${C.dim}"/>`).join('')}
  </g>`,
};

// ─── Sobre mí ─────────────────────────────────────────────────────────────
{
  const items = [
    ['chart', 'Analítica de datos', ['Pipelines con Apache Airflow', 'que consolidan +10 reportes', 'diarios y alimentan Power BI.']],
    ['bot', 'Automatización con IA', ['Agentes con Claude Code y MCP,', 'RPA con Playwright y bots de', 'mensajería a escala.']],
    ['server', 'Infraestructura', ['Windows Server, bases de datos', 'SQL y despliegue de soluciones', 'en la nube.']],
  ];
  const cw = (W - 2 * PAD - 2 * GAP) / 3, cy = 124, ch = 236;
  const body = items.map(([g, title, lines], i) => {
    const x = PAD + i * (cw + GAP), d = 0.25 + i * 0.18;
    return `<g class="rise" style="--d:${d}s">
      ${card({ x, y: cy, w: cw, h: ch, d: i })}
      <circle cx="${x + 56}" cy="${cy + 58}" r="34" fill="${C.cyan}" fill-opacity=".07" stroke="${C.cyan}" stroke-opacity=".25"/>
      ${glyph[g](x + 32, cy + 34)}
      <text x="${x + 108}" y="${cy + 66}" font-size="24" font-weight="700" fill="${C.text}">${esc(title)}</text>
      ${lines.map((l, k) => `<text x="${x + 30}" y="${cy + 134 + k * 30}" font-size="19" font-weight="500" fill="${C.soft}">${esc(l)}</text>`).join('')}
    </g>`;
  }).join('');
  out('about.svg', frame({
    h: 396, kicker: 'SOBRE MÍ', title: 'Construyo soluciones que reducen carga operativa y ayudan a decidir mejor',
    css: '@keyframes bars{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.55)}}', body,
  }));
}

// ─── Logros ───────────────────────────────────────────────────────────────
{
  const items = [
    ['+', 10, 'reportes diarios', 'automatizados vía IMAP', C.cyan],
    ['', 121, 'encuestas analizadas', 'diagnóstico de gobernanza IA', C.violet],
    ['', 4, 'certificaciones', 'Anthropic · OpenAI · Scrum', C.green],
    ['', 12, 'tecnologías', 'en el stack del día a día', C.amber],
  ];
  const cw = (W - 2 * PAD - 3 * GAP) / 4, cy = 124, ch = 196;
  const body = items.map(([pre, val, l1, l2, col], i) => {
    const x = PAD + i * (cw + GAP), mid = x + cw / 2, d = 0.25 + i * 0.15;
    return `<g class="rise" style="--d:${d}s">
      ${card({ x, y: cy, w: cw, h: ch, d: i })}
      ${odometer({ x: mid, y: cy + 92, value: val, prefix: pre, size: 56, color: col, d: d + 0.2 })}
      <text x="${mid}" y="${cy + 136}" text-anchor="middle" font-size="21" font-weight="700" fill="${C.text}">${esc(l1)}</text>
      <text x="${mid}" y="${cy + 164}" text-anchor="middle" font-size="16" font-weight="500" fill="${C.dim}">${esc(l2)}</text>
      <rect x="${x + 28}" y="${cy + ch - 14}" width="${cw - 56}" height="3" rx="1.5" fill="${C.faint}" fill-opacity=".5"/>
      <rect x="${x + 28}" y="${cy + ch - 14}" width="${cw - 56}" height="3" rx="1.5" fill="${col}"
            style="transform-box:fill-box;transform-origin:left;animation:grow 1.8s cubic-bezier(.2,.7,.2,1) ${d + 0.3}s both"/>
    </g>`;
  }).join('');
  out('achievements.svg', frame({
    h: 360, kicker: 'IMPACTO', title: 'Números que salen de proyectos reales',
    css: '@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}', body,
  }));
}

// ─── Stack ────────────────────────────────────────────────────────────────
{
  const items = [
    ['python', 'Python', '#FFD43B'], ['php', 'PHP', '#8892BF'], ['microsoftsqlserver', 'SQL', '#E8483F'],
    ['apacheairflow', 'Airflow', '#00C7D4'], ['powerbi', 'Power BI', '#F2C811'], ['googlebigquery', 'BigQuery', '#669DF6'],
    ['powerautomate', 'Power Automate', '#4C9AFF'], ['claude', 'Claude Code', '#D97757'], ['modelcontextprotocol', 'MCP', '#EEF2FF'],
    ['playwright', 'Playwright', '#45BA4B'], [null, 'GLPI', '#23B3E7'], ['windows', 'Windows Server', '#3BA5F5'],
  ];
  const cols = 6, tw = (W - 2 * PAD - (cols - 1) * 16) / cols, th = 132, top = 124;
  const body = items.map(([ic, label, col], i) => {
    const r = Math.floor(i / cols), c = i % cols;
    const x = PAD + c * (tw + 16), y = top + r * (th + 16), mid = x + tw / 2, d = 0.2 + i * 0.07;
    const sym = ic ? icon(ic, mid - 22, y + 24, 44, col)
      : `<text x="${mid}" y="${y + 60}" text-anchor="middle" class="mono" font-size="26" font-weight="500" fill="${col}">GLPI</text>`;
    return `<g class="pop" style="--d:${d}s">
      <rect x="${x}" y="${y}" width="${tw}" height="${th}" rx="16" fill="${C.card}" fill-opacity=".85" stroke="${col}" stroke-opacity=".22"/>
      <rect x="${x}" y="${y}" width="${tw}" height="${th}" rx="16" fill="${col}" style="opacity:0;animation:wave 6s ease-in-out ${2 + (c + r) * 0.35}s infinite"/>
      <circle cx="${mid}" cy="${y + 46}" r="30" fill="${col}" fill-opacity=".12" filter="url(#fGlow)" class="breathe" style="--d:${i * 0.27}s"/>
      <g class="floaty" style="--d:${(i % 5) * 0.4}s">${sym}</g>
      <text x="${mid}" y="${y + 108}" text-anchor="middle" font-size="18" font-weight="700" fill="${C.text}">${esc(label)}</text>
    </g>`;
  }).join('');
  out('stack.svg', frame({
    h: 124 + 2 * th + 16 + 44, kicker: 'STACK', title: 'Herramientas con las que construyo',
    css: '@keyframes wave{0%,70%,100%{opacity:0}80%{opacity:.13}}', body,
  }));
}

// ─── Formación y certificaciones ──────────────────────────────────────────
{
  const edu = [['Técnico en Sistemas', 'SENA'], ['Tecnólogo en Sistemas', 'SENA'], ['Ingeniería de Sistemas', 'Comfamiliar']];
  const certs = [['Claude Code in Action', 'Anthropic', '#D97757'], ['IA aplicada', 'OpenAI', '#34d399'],
    ['Scrum Foundation', 'Certiprof', '#a78bfa'], ['Transformación Digital', 'CPE', '#22d3ee']];

  const ly = 196, x1 = PAD + 140, x2 = W - PAD - 140, len = x2 - x1;
  const nodes = edu.map(([t, s], i) => {
    const nx = x1 + (len * i) / (edu.length - 1), d = 0.5 + i * 0.55;
    return `<g class="pop" style="--d:${d}s"><circle cx="${nx}" cy="${ly}" r="13" fill="${C.bg1}" stroke="url(#gBrand)" stroke-width="3"/>
        <circle cx="${nx}" cy="${ly}" r="5" fill="${C.cyan}" class="breathe" style="--d:${i * 0.5}s"/></g>
      <g class="rise" style="--d:${d + 0.15}s">
        <text x="${nx}" y="${ly + 46}" text-anchor="middle" font-size="21" font-weight="700" fill="${C.text}">${esc(t)}</text>
        <text x="${nx}" y="${ly + 72}" text-anchor="middle" class="mono" font-size="15" letter-spacing="2" fill="${C.cyan}">${esc(s.toUpperCase())}</text>
      </g>`;
  }).join('');
  const track = `
    <line x1="${x1}" y1="${ly}" x2="${x2}" y2="${ly}" stroke="${C.faint}" stroke-width="3" stroke-linecap="round"/>
    <line x1="${x1}" y1="${ly}" x2="${x2}" y2="${ly}" stroke="url(#gBrand)" stroke-width="3" stroke-linecap="round" class="draw" style="--len:${len};--dur:1.8s;--d:.4s"/>
    <line x1="${x1}" y1="${ly}" x2="${x2}" y2="${ly}" stroke="#fff" stroke-width="3" stroke-linecap="round" filter="url(#fGlow)"
          pathLength="100" stroke-dasharray="8 92" style="animation:pulse 3.5s linear 2.4s infinite;stroke-dashoffset:8;opacity:0"/>`;

  const cy = 320, cw = (W - 2 * PAD - 3 * GAP) / 4, ch = 96;
  const certCards = certs.map(([t, by, col], i) => {
    const x = PAD + i * (cw + GAP), d = 2 + i * 0.15;
    return `<g class="rise" style="--d:${d}s">
      ${card({ x, y: cy, w: cw, h: ch, d: i })}
      <rect x="${x + 22}" y="${cy + 26}" width="6" height="44" rx="3" fill="${col}"/>
      <text x="${x + 44}" y="${cy + 46}" font-size="19" font-weight="700" fill="${C.text}">${esc(t)}</text>
      <text x="${x + 44}" y="${cy + 72}" class="mono" font-size="14" letter-spacing="1" fill="${col}">${esc(by)}</text>
    </g>`;
  }).join('');

  out('timeline.svg', frame({
    h: cy + ch + 44, kicker: 'FORMACIÓN Y CERTIFICACIONES', title: 'De técnico a ingeniero, aprendiendo siempre',
    css: '@keyframes pulse{0%{stroke-dashoffset:8;opacity:1}100%{stroke-dashoffset:-100;opacity:1}}',
    body: `<text x="${PAD + 20}" y="${ly + 6}" class="mono rise" font-size="13" letter-spacing="2" fill="${C.dim}" style="--d:.3s">EDUCACIÓN</text>
      ${track}${nodes}
      <text x="${PAD + 20}" y="${cy - 18}" class="mono rise" font-size="13" letter-spacing="2" fill="${C.dim}" style="--d:1.9s">CERTIFICACIONES</text>
      ${certCards}`,
  }));
}

// ─── Divisor ──────────────────────────────────────────────────────────────
{
  const h = 56, pts = [];
  for (let x = 0; x <= W; x += 16) pts.push(`${x},${(h / 2 + Math.sin(x / 70) * 9 + Math.sin(x / 23) * 4).toFixed(1)}`);
  const d = 'M' + pts.join(' L');
  out('divider.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}">
<style>.run{animation:run 4s linear infinite}@keyframes run{to{stroke-dashoffset:-1000}}
@media (prefers-reduced-motion:reduce){.run{animation:none}}</style>
<defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/><stop offset=".2" stop-color="${C.cyan}"/><stop offset=".8" stop-color="${C.violet}"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></linearGradient>
<filter id="b" x="-10%" y="-200%" width="120%" height="500%"><feGaussianBlur stdDeviation="3"/></filter></defs>
<path d="${d}" fill="none" stroke="url(#g)" stroke-opacity=".25" stroke-width="2"/>
<path d="${d}" fill="none" stroke="url(#g)" stroke-width="3" pathLength="1000" stroke-dasharray="90 410" class="run" filter="url(#b)"/>
<path d="${d}" fill="none" stroke="url(#g)" stroke-width="2.2" pathLength="1000" stroke-dasharray="90 410" class="run"/>
</svg>`);
}

console.log('SVG generados en assets/');
