const buttons = document.querySelectorAll('[data-href]');
buttons.forEach(btn => btn.addEventListener('click', () => { window.location.href = btn.dataset.href; }));

document.querySelector('.menu-btn')?.addEventListener('click', () => {
  document.querySelector('.nav')?.classList.toggle('mobile-open');
});

const leadForm = document.getElementById('leadForm');
if (leadForm) {
  leadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const section = leadForm.closest('.action-section, .purchase-section');
    const mode = section?.dataset.mode || 'presale';
    const course = section?.dataset.course || 'курс';
    const amount = Number(section?.dataset.amount || 0);
    const status = document.getElementById('formStatus');
    const submit = leadForm.querySelector('button[type="submit"]');
    const data = Object.fromEntries(new FormData(leadForm).entries());

    // Сначала ЛЮБАЯ анкета сохраняется в Google Sheets.
    // Для purchase (НЕЙРО / POINT) после сохранения запускается оплата,
    // когда paymentEndpoint будет подключён.

    const endpoint = window.BADBEE_CONFIG?.presaleEndpoint?.trim();
    if (!endpoint) {
      status.textContent = 'Анкета готова. Для отправки в Google Sheets нужно подключить URL Apps Script.';
      return;
    }

    const payload = {
      ...data,
      course,
      source: window.location.href,
      submittedAt: new Date().toISOString()
    };

    submit.disabled = true;
    const originalText = submit.textContent;
    submit.textContent = 'Отправляем…';
    status.textContent = '';

    try {
      await fetch(endpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      if (mode === 'purchase') {
        const paymentEndpoint = window.BADBEE_CONFIG?.paymentEndpoint?.trim();

        if (!paymentEndpoint) {
          leadForm.reset();
          status.textContent = 'Готово! Анкета отправлена. Оплату подключим следующим этапом.';
          submit.textContent = 'Анкета отправлена ✓';
          return;
        }

        submit.textContent = 'Переходим к оплате…';

        const paymentResponse = await fetch(paymentEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            course,
            amount,
            currency: 'RUB',
            source: window.location.href,
            successUrl: new URL('payment-success.html', window.location.href).href,
            cancelUrl: window.location.href
          })
        });

        if (!paymentResponse.ok) throw new Error('Payment endpoint error');
        const paymentResult = await paymentResponse.json();
        if (!paymentResult.checkoutUrl) throw new Error('checkoutUrl missing');
        window.location.href = paymentResult.checkoutUrl;
        return;
      }

      leadForm.reset();
      status.textContent = 'Готово! Анкета отправлена. Мы свяжемся с тобой по указанному контакту.';
      submit.textContent = 'Анкета отправлена ✓';
    } catch (error) {
      status.textContent = 'Не получилось отправить анкету. Попробуй ещё раз или напиши в Telegram @nastyapozdn.';
      submit.disabled = false;
      submit.textContent = originalText;
    }
  });
}
