const fs = require('fs');
let data = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');
data = data.replace(/\\\`/g, '`');
data = data.replace(/\\\$\{/g, '${');
fs.writeFileSync('src/pages/CheckoutPage.tsx', data);
console.log('Fixed');
