'use strict';
// Subtitle demo and optional registration. No login, analytics, or user-file access.
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

// Register only after an explicit form submission; no visitor information is sent on page load.
const registrationForm = document.getElementById('registration-form');
const registrationReceipts = new Map();
registrationForm.addEventListener('submit', async event => {
  event.preventDefault();
  const button = document.getElementById('registration-submit');
  if (button.disabled) return;
  const status = document.getElementById('registration-status');
  const receipt = document.getElementById('registration-receipt');
  const originalLabel = button.textContent;
  button.disabled = true;
  button.textContent = '送信しています…';
  status.hidden = false;
  status.classList.remove('registration-error');
  status.textContent = '登録を保存しています。';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const body = new URLSearchParams(new FormData(registrationForm));
    const email = body.get('email').trim().toLowerCase();
    if (!registrationReceipts.has(email)) registrationReceipts.set(email, Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join(''));
    body.set('receipt', registrationReceipts.get(email));
    const result = await fetch(registrationForm.action, {
      method: 'POST',
      headers: {Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded'},
      body,
      signal: controller.signal,
      credentials: 'omit',
    });
    const data = await result.json();
    if (!result.ok || !data.ok) throw new Error(data.error || '登録を保存できませんでした。時間をおいてお試しください。');
    const cancelUrl = new URL(data.cancelUrl);
    if (cancelUrl.origin !== new URL(registrationForm.action).origin || !/^#cancel=[a-f0-9]{64}$/.test(cancelUrl.hash)) throw new Error('受付結果を確認できませんでした。時間をおいてお試しください。');
    document.getElementById('registration-cancel').href = cancelUrl.href;
    receipt.hidden = false;
    registrationForm.hidden = true;
    status.textContent = '事前登録を受け付けました。ご入力ありがとうございます。すでに登録済みの場合は、重複して追加しません。';
    registrationForm.reset();
    status.focus();
  } catch (error) {
    status.classList.add('registration-error');
    status.textContent = error.name === 'AbortError' ? '応答を確認できませんでした。入力を残しているので、時間をおいて再度お試しください。重複して登録されることはありません。' : error instanceof TypeError ? '通信できませんでした。ネット接続を確認して、もう一度お試しください。' : error.message;
    status.focus();
  } finally {
    clearTimeout(timeout);
    button.disabled = false;
    button.textContent = originalLabel;
  }
});

document.querySelectorAll('a[href="#registration-privacy"]').forEach(link => {
  link.addEventListener('click', () => { document.getElementById('registration-privacy').open = true; });
});
