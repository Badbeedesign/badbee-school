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
    const endpoint = window.BADBEE_CONFIG?.presaleEndpoint?.trim();

    if (!endpoint) {
      status.textContent = 'Не подключён адрес Google Sheets.';
      return;
    }

    submit.disabled = true;
    const originalText = submit.textContent;
    submit.textContent = 'Отправляем…';
    status.textContent = '';

    const body = new URLSearchParams({
      course,
      format: data.format || '',
      name: data.name || '',
      phone: data.phone || '',
      contact: data.contact || '',
      comment: data.comment || '',
      source: window.location.href,
      submittedAt: new Date().toISOString()
    });

    try {
      // no-cors нужен для Google Apps Script с GitHub Pages.
      // Запрос считается отправленным только если fetch не завершился сетевой ошибкой.
      await fetch(endpoint, { method: 'POST', mode: 'no-cors', body });

      if (mode === 'purchase') {
        const paymentEndpoint = window.BADBEE_CONFIG?.paymentEndpoint?.trim();
        if (!paymentEndpoint) {
          leadForm.reset();
          status.textContent = 'Анкета отправлена. Мы свяжемся с тобой по указанным контактам.';
          submit.textContent = 'Анкета отправлена ✓';
          return;
        }
        submit.textContent = 'Переходим к оплате…';
        const paymentResponse = await fetch(paymentEndpoint, {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({...data, course, amount, currency:'RUB', source:window.location.href,
            successUrl:new URL('payment-success.html', window.location.href).href, cancelUrl:window.location.href})
        });
        if (!paymentResponse.ok) throw new Error('Payment endpoint error');
        const paymentResult = await paymentResponse.json();
        if (!paymentResult.checkoutUrl) throw new Error('checkoutUrl missing');
        window.location.href = paymentResult.checkoutUrl;
        return;
      }

      leadForm.reset();
      status.textContent = 'Готово! Анкета отправлена. Мы свяжемся с тобой по указанным контактам.';
      submit.textContent = 'Анкета отправлена ✓';
    } catch (error) {
      status.textContent = 'Не получилось отправить анкету. Попробуй ещё раз или напиши в Telegram @nastyapozdn.';
      submit.disabled = false;
      submit.textContent = originalText;
    }
  });
}
