'use strict';
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




const privacyDialog = document.getElementById('registration-privacy');
let privacyOpener = null;
function openPrivacy(opener) {
  privacyOpener = opener;
  if (!privacyDialog.open) privacyDialog.showModal();
  document.documentElement.classList.add('privacy-is-open');
}
document.querySelectorAll('a[href="#registration-privacy"]').forEach(link => {
  link.setAttribute('aria-haspopup','dialog');
  link.setAttribute('aria-controls','registration-privacy');
  link.addEventListener('click',event => { event.preventDefault(); openPrivacy(link); });
});
privacyDialog.querySelector('[data-close-privacy]').addEventListener('click',()=>privacyDialog.close());
privacyDialog.addEventListener('close',()=>{
  document.documentElement.classList.remove('privacy-is-open');
  if (privacyOpener?.isConnected) privacyOpener.focus({preventScroll:true});
});
if (location.hash === '#registration-privacy') openPrivacy(document.querySelector('a[href="#registration-privacy"]'));
