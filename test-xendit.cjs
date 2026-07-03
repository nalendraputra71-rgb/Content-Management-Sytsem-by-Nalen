const { Invoice: XenditInvoice } = require('xendit-node');
const x = new XenditInvoice({ secretKey: 'xnd_development_test' });

async function run() {
  const payloads = [
    { externalId: 'sub_test_pro_123', amount: 10000, payerEmail: 'test@example.com', description: 'test' },
    { externalId: 'sub_test_pro_123!@#', amount: 10000, payerEmail: 'test@example.com', description: 'test' },
    { externalId: 'sub_test', amount: 10000, payerEmail: 'test', description: 'test' },
    { externalId: 'sub_test', amount: 10000, payerEmail: 'test@example.com', description: 'test', successRedirectUrl: 'invalid-url' }
  ];
  for (const p of payloads) {
    try {
      await x.createInvoice({ data: p });
    } catch(e) {
      let body = '';
      if (e.response) {
         try { body = await e.response.text(); } catch(err){}
      }
      console.log('Payload:', p, 'Error:', e.message, body);
    }
  }
}
run();
