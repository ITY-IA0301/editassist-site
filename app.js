'use strict';
// Subtitle demo and optional registration. No login, analytics, or user-file access.
const fullText = 'まずは、伝えたい内容を短く整理してみましょう。読みやすい位置で区切ると、字幕の内容が伝わりやすくなります。';
const splitText = ['まずは、伝えたい内容を短く整理してみましょう。', '読みやすい位置で区切ると、字幕の内容が伝わりやすくなります。'];
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
  if (line.checked) value = value.replace('伝えたい内容を', '伝えたい内容を\n').replace('読みやすい位置で区切ると、', '読みやすい位置で区切ると、\n');
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

function followLegacyRegistrationLink() {
  if (!['#preregister','#registration-privacy'].includes(location.hash)) return;
  location.replace(new URL('preregister/' + (location.hash === '#registration-privacy' ? location.hash : ''),location.href).href);
}
followLegacyRegistrationLink();
addEventListener('hashchange',followLegacyRegistrationLink);

