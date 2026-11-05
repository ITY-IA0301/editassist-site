/* Email handoff only. No HTTP submission, storage, telemetry or delivery claims. */
(() => {
  const $ = id => document.getElementById(id);
  const form = $('feedbackForm');
  if (!form) return;
  const en = document.documentElement.lang === 'en';
  const t = (ja, english) => en ? english : ja;
  const product = document.querySelector('[data-feedback-product]').dataset.feedbackProduct;
  const recipient = $('feedbackRecipient').value;
  const review = $('feedbackReview'), preview = $('feedbackPreview'), status = $('feedbackStatus');
  let draft = '', revision = 0;
  function invalidate() {
    const hadDraft = Boolean(draft);
    revision++;
    draft = '';
    review.hidden = true;
    preview.value = '';
    $('feedbackEmail').removeAttribute('href');
    status.textContent = hadDraft ? t('入力が変わりました。もう一度、送る内容を確認してください。', 'Your input changed. Review the message again.') : '';
  }
  form.addEventListener('input', invalidate);
  form.addEventListener('change', invalidate);
  form.addEventListener('reset', invalidate);
  form.addEventListener('submit', event => {
    event.preventDefault();
    invalidate();
    if (!form.reportValidity()) return;
    const text = $('feedbackText').value.trim();
    if (!text || text.length > 2000) {
      status.textContent = t('本文を1〜2,000文字で入力してください。', 'Enter a message of 1–2,000 characters.');
      $('feedbackText').focus();
      return;
    }
    const selected = id => $(id).selectedOptions[0].textContent;
    const stage = $('feedbackStage').value;
    const basis = stage === 'used' ? t('利用経験あり（利用範囲は本文で確認）', 'Product experience reported (see message for scope)') : stage === 'not_used' ? t('利用前の意見・期待', 'Pre-use opinion / expectation') : t('未回答（利用済みとは扱わない）', 'Unanswered (not evidence of actual use)');
    draft = [product + t('へのご意見・ご要望', ' — feedback & requests'), t('受付経路：紹介サイト', 'Source: introduction website'), t('分類：', 'Category: ') + selected('feedbackKind'), t('本体の利用経験：', 'Product experience: ') + selected('feedbackStage'), t('意見の区分：', 'Feedback basis: ') + basis, t('現時点の利用意向：', 'Current interest: ') + selected('feedbackIntention'), '', t('【本文】', '[Message]'), text].join('\n');
    preview.value = draft;
    const href = 'mailto:' + recipient + '?subject=' + encodeURIComponent(product + t('へのご意見・ご要望', ' — feedback & requests')) + '&body=' + encodeURIComponent(draft);
    // Mail apps have different URL limits. Long text remains intact in the copy route.
    const long = href.length > 6000;
    $('feedbackEmail').hidden = long;
    if (!long) $('feedbackEmail').href = href;
    $('feedbackMailHint').textContent = long ? t('文章が長いため、本文の欠落を避けるにはコピーしてメールへ貼り付けてください。', 'For this longer message, copy and paste it into email to avoid a truncated draft.') : '';
    review.hidden = false;
    status.textContent = t('送る内容を確認してください。まだ送信していません。', 'Review the message. Nothing has been sent.');
    $('feedbackReviewTitle').focus();
  });
  $('feedbackEmail').addEventListener('click', event => {
    if (!draft) { event.preventDefault(); return; }
    status.textContent = t('メール作成画面で確認し、ご自身で送信してください。送信・到着は確認できません。本文が入らない場合はコピーしてください。', 'Check and send it yourself in your email app. Sending and delivery cannot be confirmed here. Copy the message if it is missing.');
  });
  async function copy(field, isMessage) {
    if (isMessage && !draft) return;
    const text = field.value, currentRevision = revision;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      status.textContent = isMessage && currentRevision !== revision ? t('入力が変わりました。コピーしたのは前の内容です。もう一度内容を確認してください。', 'Your input changed. The copied text was the previous version. Review again.') : t('コピーしました。まだ送信していません。メールに貼り付け、ご自身で送信してください。', 'Copied. Nothing has been sent. Paste it into email and send it yourself.');
    } catch {
      if (isMessage && currentRevision !== revision) return;
      field.focus(); field.select();
      status.textContent = t('コピーできませんでした。選択した文章をCtrl+C／⌘C、または長押しで手動コピーしてください。まだ送信していません。', 'Copying failed. Copy the selected text manually with Ctrl+C / ⌘C, or touch and hold. Nothing has been sent.');
    }
  }
  $('feedbackCopy').addEventListener('click', () => copy(preview, true));
  $('feedbackCopyRecipient').addEventListener('click', () => copy($('feedbackRecipient'), false));
  window.addEventListener('pageshow', invalidate);
  $('feedbackConfirm').disabled = false;
  $('feedbackCopyRecipient').hidden = false;
})();
