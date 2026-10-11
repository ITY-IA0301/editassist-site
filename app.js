'use strict';
// Presentation only. No remote API, login, analytics, or user-file access.
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
