import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src');

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(srcDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/'Playfair Display',serif/g, "'Georgia', serif");
  content = content.replace(/'Playfair Display', serif/g, "'Georgia', serif");
  content = content.replace(/'DM Sans',sans-serif/g, "'Helvetica Neue', Helvetica, Arial, sans-serif");
  content = content.replace(/'DM Sans', sans-serif/g, "'Helvetica Neue', Helvetica, Arial, sans-serif");
  // Also we need to fix the colors in analytics view maybe? No the prompt said "Extract ONLY the styling..."
  // It gives CSS colors. But the colors I already had are identical mostly:
  // --bg: #FAF7F2
  // --ink: #2C2016
  // --accent: #C4622D
  // So they are matched by the inline styles I already generated.
  // The only difference is the exact layout of the HTML from the prompt compared to mine.
  // "Do NOT replace or restructure the existing app's HTML elements — preserve all existing components, content, and functionality. Only modify CSS/styling and adjust layout containers as needed to match the theme's aesthetic."
  // So just the font-family is the biggest difference requested.
  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('done');
