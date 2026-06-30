const https = require('https');
https.get('https://hubifysocial.com/api/xendit/webhook', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => console.log(res.statusCode, res.headers, data));
});
