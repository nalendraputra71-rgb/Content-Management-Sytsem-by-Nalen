const { Invoice: XenditInvoice } = require('xendit-node');
const x = new XenditInvoice({ secretKey: 'xnd_development_test' });
x.createInvoice({ data: { 
  externalId: 'sub_test_pro_123', 
  amount: 10000, 
  payerEmail: 'test@example.com', 
  description: 'Pembayaran langganan pro Hubify Social', 
  currency: 'IDR', 
  successRedirectUrl: 'https://hubifysocial.com/#/dashboard',
  failureRedirectUrl: 'https://hubifysocial.com/#/billing'
} })
  .catch(e => {
    console.log('Error name:', e.name);
    console.log('Error message:', e.message);
    if (e.response) {
      console.log('Response status:', e.response.status);
      e.response.text().then(text => console.log('Response body:', text)).catch(console.error);
    } else {
       console.log('Full error:', e);
    }
  });
