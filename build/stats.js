// Genera la tarjeta de estadísticas con datos reales de la API de GitHub.
// Uso: GITHUB_TOKEN=... node build/stats.js <usuario> <archivo-salida>
// La corre el workflow a diario; reemplaza a github-readme-stats y streak-stats.
const fs = require('fs');
const { W, C, frame, card, odometer, esc } = require('./lib');

const [user = 'brianacevedo2001-lab', outFile = 'dist/stats.svg'] = process.argv.slice(2);
const token = process.env.GITHUB_TOKEN;
if (!token) { console.error('Falta GITHUB_TOKEN'); process.exit(1); }

const QUERY = `query($login:String!){user(login:$login){
  contributionsCollection{totalCommitContributions totalPullRequestContributions
    contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}
  repositories(ownerAffiliations:OWNER,isFork:false,privacy:PUBLIC,first:100){totalCount
    nodes{stargazerCount languages(first:10,orderBy:{field:SIZE,direction:DESC}){edges{size node{name color}}}}}}}`;

(async () => {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'profile-stats' },
    body: JSON.stringify({ query: QUERY, variables: { login: user } }),
  });
  const json = await res.json();
  if (!json.data?.user) { console.error(JSON.stringify(json)); process.exit(1); }
  const u = json.data.user, cc = u.contributionsCollection;

  // Rachas a partir del calendario. Si hoy aún no hay aportes, la racha actual cuenta desde ayer.
  const days = cc.contributionCalendar.weeks.flatMap(w => w.contributionDays);
  let longest = 0, run = 0;
  days.forEach(d => { run = d.contributionCount ? run + 1 : 0; longest = Math.max(longest, run); });
  let i = days.length - 1, current = 0;
  if (i >= 0 && !days[i].contributionCount) i--;
  for (; i >= 0 && days[i].contributionCount; i--) current++;

  const langs = {};
  u.repositories.nodes.forEach(r => r.languages.edges.forEach(e => {
    langs[e.node.name] ??= { size: 0, color: e.node.color || C.dim };
    langs[e.node.name].size += e.size;
  }));
  const totalBytes = Object.values(langs).reduce((a, l) => a + l.size, 0) || 1;
  const top = Object.entries(langs).sort((a, b) => b[1].size - a[1].size).slice(0, 5);
  const stars = u.repositories.nodes.reduce((a, r) => a + r.stargazerCount, 0);

  const PAD = 48, GAP = 24, cy = 124, ch = 268, cw = (W - 2 * PAD - 2 * GAP) / 3;
  const X = k => PAD + k * (cw + GAP);

  // Panel 1: actividad
  const rows = [
    ['Contribuciones (año)', cc.contributionCalendar.totalContributions, C.cyan],
    ['Commits (año)', cc.totalCommitContributions, C.violet],
    ['Pull requests', cc.totalPullRequestContributions, C.green],
    ['Repos públicos', u.repositories.totalCount, C.amber],
    ['Estrellas', stars, C.soft],
  ];
  const p1 = rows.map(([label, val, col], k) => {
    const y = cy + 74 + k * 40;
    return `<g class="rise" style="--d:${0.4 + k * 0.1}s">
      <circle cx="${X(0) + 34}" cy="${y - 6}" r="5" fill="${col}"/>
      <text x="${X(0) + 52}" y="${y}" font-size="18" font-weight="500" fill="${C.soft}">${esc(label)}</text>
      ${odometer({ x: X(0) + cw - 30 - String(val).length * 13.2, y, value: val, size: 22, color: C.text, d: 0.5 + k * 0.1, anchor: 'start' })}
    </g>`;
  }).join('');

  // Panel 2: lenguajes
  const bw = cw - 60;
  const p2 = top.map(([name, l], k) => {
    const pct = (l.size / totalBytes) * 100, y = cy + 78 + k * 38;
    return `<g class="rise" style="--d:${0.5 + k * 0.1}s">
      <text x="${X(1) + 30}" y="${y}" font-size="17" font-weight="500" fill="${C.soft}">${esc(name)}</text>
      <text x="${X(1) + cw - 30}" y="${y}" text-anchor="end" class="mono" font-size="14" fill="${C.dim}">${pct.toFixed(1)}%</text>
      <rect x="${X(1) + 30}" y="${y + 9}" width="${bw}" height="6" rx="3" fill="${C.faint}" fill-opacity=".5"/>
      <rect x="${X(1) + 30}" y="${y + 9}" width="${Math.max(6, (bw * pct) / 100)}" height="6" rx="3" fill="${l.color}"
            style="transform-box:fill-box;transform-origin:left;animation:grow 1.6s cubic-bezier(.2,.7,.2,1) ${0.7 + k * 0.12}s both"/>
    </g>`;
  }).join('') || `<text x="${X(1) + cw / 2}" y="${cy + 150}" text-anchor="middle" fill="${C.dim}" font-size="17">Sin repos públicos aún</text>`;

  // Panel 3: racha (anillo que se dibuja)
  const rx = X(2) + cw / 2, ry = cy + 140, rr = 62, circ = 2 * Math.PI * rr;
  const p3 = `
    <circle cx="${rx}" cy="${ry}" r="${rr}" fill="none" stroke="${C.faint}" stroke-opacity=".5" stroke-width="8"/>
    <circle cx="${rx}" cy="${ry}" r="${rr}" fill="none" stroke="url(#gBrand)" stroke-width="8" stroke-linecap="round"
            transform="rotate(-90 ${rx} ${ry})" class="draw" style="--len:${circ.toFixed(1)};--dur:2s;--d:.6s"/>
    <circle cx="${rx}" cy="${ry}" r="${rr + 14}" fill="none" stroke="${C.cyan}" stroke-opacity=".25" class="breathe"/>
    ${odometer({ x: rx, y: ry + 16, value: current, size: 46, color: C.text, d: 0.7 })}
    <text x="${rx}" y="${ry + rr + 44}" text-anchor="middle" font-size="18" font-weight="700" fill="${C.cyan}" class="fade" style="--d:1s">Racha actual · días</text>
    <text x="${rx}" y="${ry + rr + 70}" text-anchor="middle" class="mono fade" font-size="14" fill="${C.dim}" style="--d:1.1s">MÁS LARGA: ${longest} · TOTAL: ${cc.contributionCalendar.totalContributions}</text>`;

  const titles = ['ACTIVIDAD', 'LENGUAJES', 'RACHA'].map((t, k) =>
    `<text x="${k === 2 ? X(2) + cw / 2 : X(k) + 30}" y="${cy + 38}" ${k === 2 ? 'text-anchor="middle"' : ''} class="mono" font-size="14" letter-spacing="3" fill="${C.dim}">${t}</text>`).join('');

  const today = new Date().toISOString().slice(0, 10);
  const svg = frame({
    h: cy + ch + 44, kicker: `ESTADÍSTICAS DE GITHUB · ${today}`, title: 'Actividad pública en GitHub',
    css: '@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}',
    body: [0, 1, 2].map(k => `<g class="rise" style="--d:${0.2 + k * 0.15}s">${card({ x: X(k), y: cy, w: cw, h: ch, d: k })}</g>`).join('')
      + `<g class="fade" style="--d:.3s">${titles}</g>` + p1 + p2 + p3,
  });
  fs.mkdirSync(require('path').dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, svg);
  console.log(`stats → ${outFile} (racha ${current}, más larga ${longest}, ${top.length} lenguajes)`);
})();
