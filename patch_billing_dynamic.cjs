const fs = require('fs');
let code = fs.readFileSync('src/BillingView.tsx', 'utf8');

code = code.replace(/    return \{\n      id: p.id,\n      name: p.name.replace\(\/ \\\(.*?\\\)\/i, ''\),\n      desc: p.desc,\n      features: generateBulletPoints\(p, 'id'\),\n      priceMonthly,\n      priceAnnual: Math.round\(priceAnnualTotal \/ 12\),\n      priceAnnualTotal,\n      popular: p.popular,\n      originalPrice: p.originalPrice \|\| 0\n    \};/g, `    return {
      id: p.id,
      name: p.name.replace(/ \\(.*\\)/i, ''),
      desc: p.desc,
      features: generateBulletPoints(p, 'id'),
      priceMonthly,
      priceAnnual: Math.round(priceAnnualTotal / 12),
      priceAnnualTotal,
      popular: p.popular,
      originalPrice: p.originalPrice || 0,
      limits: p.limits,
      capabilities: p.capabilities
    };`);

fs.writeFileSync('src/BillingView.tsx', code);
