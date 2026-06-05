import fs from 'fs';
import path from 'path';

function walkDir(dir: string, callback: (filepath: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

walkDir('./src', (filepath) => {
  if (filepath.endsWith('.tsx') || filepath.endsWith('.ts') || filepath.endsWith('.css') || filepath.endsWith('.html')) {
    let content = fs.readFileSync(filepath, 'utf8');
    content = content.replace(/#C4622D/g, '#3B82F6');
    content = content.replace(/#FF6B00/g, '#3B82F6');
    content = content.replace(/196,98,45/g, '59,130,246');
    fs.writeFileSync(filepath, content);
  }
});
