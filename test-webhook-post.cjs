const https = require('https');
const options = {
  hostname: 'www.hubifysocial.com',
  path: '/api/trends',
  method: 'GET'
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => console.log(res.statusCode, res.headers, data));
});
req.end();
