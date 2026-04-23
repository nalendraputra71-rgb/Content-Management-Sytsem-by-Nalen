import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src');
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(srcDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/'Georgia',\s*serif/g, "'Playfair Display',serif");
  content = content.replace(/'Helvetica Neue',\s*Helvetica,\s*Arial,\s*sans-serif/g, "'DM Sans',sans-serif");
  fs.writeFileSync(filePath, content, 'utf8');
});
console.log('done');
