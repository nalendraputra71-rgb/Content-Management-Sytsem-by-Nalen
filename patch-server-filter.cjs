const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldFilterLogic = `              if (month) {
                docs = docs.filter((d) => {
                  const dateStr =
                    d.date ||
                    (d.year && d.month
                      ? \`\${d.year}-\${String(d.month).padStart(2, "0")}\`
                      : "");
                  return dateStr.startsWith(month);
                });
              }`;

const newFilterLogic = `              if (month) {
                const [targetYear, targetMonth] = month.split("-");
                docs = docs.filter((d) => {
                  if (d.year && d.month) {
                    return String(d.year) === targetYear && String(d.month).padStart(2, '0') === targetMonth;
                  }
                  if (d.date) {
                     const dateObj = new Date(d.date);
                     if (!isNaN(dateObj.getTime())) {
                        return String(dateObj.getFullYear()) === targetYear && String(dateObj.getMonth() + 1).padStart(2, '0') === targetMonth;
                     }
                     return String(d.date).includes(targetYear) && (String(d.date).includes(targetMonth) || String(d.date).includes(String(Number(targetMonth))));
                  }
                  return false;
                });
              }`;

code = code.replace(oldFilterLogic, newFilterLogic);

// Add id to functionResponse
const oldFunctionResponse = `{ functionResponse: { name: call.name, response: result } },`;
const newFunctionResponse = `{ functionResponse: { name: call.name, id: call.id, response: result } },`;
code = code.replace(oldFunctionResponse, newFunctionResponse);

// If model ran out of toolCallLimit, return a fallback text instead of "Tidak ada respon"
const oldFallback = `text: response?.text || "Tidak ada respon dari model",`;
const newFallback = `text: response?.text || "Maaf, aku sedang kesulitan memproses data tersebut dari database. Bisa kasih tahu lebih spesifik lagi?",`;
code = code.replace(oldFallback, newFallback);

fs.writeFileSync('server.ts', code);
console.log('patched');
