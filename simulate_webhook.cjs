const http = require('http');

// Ambil UID dari argumen command line, atau gunakan placeholder
const uid = process.argv[2] || "USER_UID_DISINI"; 

const payload = JSON.stringify({
  external_id: `sub_${uid}_pro_${Date.now()}`,
  status: "PAID",
  amount: 99000,
  payer_email: "test@example.com"
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/xendit/webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': payload.length
  }
};

console.log("Mengirim simulasi webhook ke server lokal...");
console.log("Payload:", payload);

const req = http.request(options, (res) => {
  console.log(`\nStatus Response: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log("Body Response:", data);
    console.log("\nJika status 200, Webhook berhasil diproses!");
  });
});

req.on('error', (error) => {
  console.error("\nError:", error.message);
});

req.write(payload);
req.end();
