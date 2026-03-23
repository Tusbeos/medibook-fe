const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory() && f !== 'node_modules' && f !== '.git' && f !== 'build') {
      results.push(...walk(p));
    } else if (/\.(tsx?|jsx?)$/.test(f)) {
      results.push(p);
    }
  });
  return results;
}

const files = walk('src').filter(f => {
  const c = fs.readFileSync(f, 'utf8');
  return c.includes('useHistory');
});

console.log('Files with useHistory:', files.length);

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  
  // Replace import from "react-router" 
  c = c.replace(
    /import\s*\{([^}]*)\}\s*from\s*["']react-router["']\s*;?/g,
    (match, imports) => {
      let newImports = imports.replace(/\buseHistory\b/g, 'useNavigate').trim();
      return `import { ${newImports} } from "react-router-dom";`;
    }
  );
  
  // Replace import from "react-router-dom"
  c = c.replace(
    /import\s*\{([^}]*)\buseHistory\b([^}]*)\}\s*from\s*["']react-router-dom["']\s*;?/g,
    (match, before, after) => {
      let newImports = (before + 'useNavigate' + after).trim();
      return `import { ${newImports} } from "react-router-dom";`;
    }
  );
  
  // Replace const history = useHistory()
  c = c.replace(/const\s+history\s*=\s*useHistory\(\)\s*;?/g, 'const navigate = useNavigate();');
  
  // Replace history.push(
  c = c.replace(/history\.push\(/g, 'navigate(');
  
  // Replace history.replace( 
  c = c.replace(/history\.replace\(/g, 'navigate(');
  
  fs.writeFileSync(f, c, 'utf8');
  console.log('Updated:', f);
});

console.log('Done!');
