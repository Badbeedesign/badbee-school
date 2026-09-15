const buttons = document.querySelectorAll('[data-href]');
buttons.forEach(btn => btn.addEventListener('click', () => { window.location.href = btn.dataset.href; }));

document.querySelector('.menu-btn')?.addEventListener('click', () => {
  document.querySelector('.nav')?.classList.toggle('mobile-open');
});

const leadForm = document.getElementById('leadForm');
if (leadForm) {
  leadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const section = document.querySelector('.action-section');
    const mode = section?.dataset.mode || 'presale';
    const course = section?.dataset.course || 'курс';
    const amount = Number(section?.dataset.amount || 0);
    const status = document.getElementById('formStatus');
    const submit = leadForm.querySelector('button[type="submit"]');
    const data = Object.fromEntries(new FormData(leadForm).entries());

    if (mode === 'purchase') {
      const endpoint = window.BADBEE_CONFIG?.paymentEndpoint?.trim();
      if (!endpoint) {
        status.textContent = 'Оплата подготовлена. Для запуска нужно подключить платёжный сервис.';
        return;
      }

      submit.disabled = true;
      const originalText = submit.textContent;
      submit.textContent = 'Переходим к оплате…';
      status.textContent = '';

      try {
        const response = await fetch(endpoint, {
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

        if (!response.ok) throw new Error('Payment endpoint error');
        const result = await response.json();
        if (!result.checkoutUrl) throw new Error('checkoutUrl missing');
        window.location.href = result.checkoutUrl;
      } catch (error) {
        status.textContent = 'Не получилось открыть оплату. Попробуй ещё раз или напиши в Telegram @badbee_design.';
        submit.disabled = false;
        submit.textContent = originalText;
      }
      return;
    }

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
      leadForm.reset();
      status.textContent = 'Готово! Анкета отправлена. Мы свяжемся с тобой по указанному контакту.';
      submit.textContent = 'Анкета отправлена ✓';
    } catch (error) {
      status.textContent = 'Не получилось отправить анкету. Попробуй ещё раз или напиши в Telegram @badbee_design.';
      submit.disabled = false;
      submit.textContent = originalText;
    }
  });
}
