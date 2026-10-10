'use strict';
// Presentation only. No remote API, login, analytics, or user-file access.
const commit = '88d622c2ad7022d9157df7d7888f75c7f2ef0f9e';
const project = 'https://github.com/ITY-IA0301/ymm4-editassist';
document.querySelectorAll('[data-doc]').forEach(link => {
  link.href = `${project}/blob/${commit}/${link.dataset.doc}`;
});
const fullText = '今日は、酒場と宿屋を兼ねた建物を作ります。まずは、木と石を組み合わせて外観を整えていきましょう。';
const splitText = ['今日は、酒場と宿屋を兼ねた建物を作ります。', 'まずは、木と石を組み合わせて外観を整えていきましょう。'];
let page = 0;
const split = document.getElementById('split');
const size = document.getElementById('size');
const line = document.getElementById('line');
const previous = document.getElementById('previous');
const next = document.getElementById('next');
function renderDemo() {
  const pages = split.checked ? splitText : [fullText];
  page = Math.min(page, pages.length - 1);
  let value = pages[page];
  if (line.checked) value = value.replace('酒場と宿屋を兼ねた', '酒場と宿屋を兼ねた\n').replace('木と石を組み合わせて', '木と石を組み合わせて\n');
  const text = document.getElementById('subtitle-text');
  text.textContent = value;
  text.classList.toggle('small', size.checked);
  document.getElementById('page-status').textContent = `${page + 1} / ${pages.length}`;
  previous.disabled = page === 0;
  next.disabled = page >= pages.length - 1;
}
[split, size, line].forEach(input => input.addEventListener('change', () => { page = 0; renderDemo(); }));
previous.addEventListener('click', () => { page -= 1; renderDemo(); });
next.addEventListener('click', () => { page += 1; renderDemo(); });
renderDemo();
async function loadReleases() {
  try {
    const response = await fetch('releases.json');
    if (!response.ok) throw new Error('release data');
    const data = await response.json();
    const raw = `https://raw.githubusercontent.com/ITY-IA0301/ymm4-editassist/${data.commit}/`;
    const latest = data.packages.find(item => item.path === 'archive/EditAssist/0.5.2/EditAssist-0.5.2-net10.ymme');
    const manager = data.packages.find(item => item.path.includes('VersionManager'));
    const source = data.packages.find(item => item.path === 'archive/EditAssist/0.5.2/YMM4-EditAssist-0.5.2-source.zip');
    for (const [id, item] of [['main-download', latest], ['manager-download', manager], ['source-download', source]]) {
      if (item) document.getElementById(id).href = raw + item.path;
    }
    document.getElementById('main-meta').textContent = `.ymme / Windows・.NET 10 / ${(latest.bytes / 1024).toFixed(0)} KB`;
    document.getElementById('manager-meta').textContent = `.ymme / 本体とは別に導入 / ${(manager.bytes / 1024).toFixed(0)} KB`;
    const list = document.getElementById('versions');
    list.replaceChildren();
    const packages = data.packages.filter(item => item.path.startsWith('archive/EditAssist/') && item.path.endsWith('.ymme')).reverse();
    for (const item of packages) {
      const row = document.createElement('div'); row.className = 'version-row';
      const version = document.createElement('strong'); version.textContent = item.path.split('/')[2];
      const download = document.createElement('a'); download.href = raw + item.path; download.textContent = '導入ファイル ↓'; download.setAttribute('aria-label', `EditAssist ${version.textContent} の導入ファイルをダウンロード`);
      const hash = document.createElement('code'); hash.textContent = `SHA-256: ${item.sha256.toLowerCase()}`;
      row.append(version, download, hash); list.append(row);
    }
  } catch (_) {
    // Static links remain usable when JSON cannot be fetched, e.g. file://.
  }
}
loadReleases();
