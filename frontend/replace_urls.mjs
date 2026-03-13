import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('c:/Users/rohit/.gemini/antigravity/scratch/gvk_transport/frontend/src', function (filePath) {
    if (filePath.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Replace standard fetch strings
        content = content.replace(/'http:\/\/localhost:5000\/api/g, '`${import.meta.env.VITE_API_BASE_URL}/api');

        // Replace anchor tag literal strings
        content = content.replace(/href="http:\/\/localhost:5000\/api\/v1\/reports\/export\/mine"/g, 'href={`${import.meta.env.VITE_API_BASE_URL}/api/v1/reports/export/mine`}');
        content = content.replace(/href="http:\/\/localhost:5000\/api\/v1\/reports\/export\/factory"/g, 'href={`${import.meta.env.VITE_API_BASE_URL}/api/v1/reports/export/factory`}');

        // Replace anchor tag template strings
        content = content.replace(/href={`http:\/\/localhost:5000\/api/g, 'href={`${import.meta.env.VITE_API_BASE_URL}/api');

        fs.writeFileSync(filePath, content);
    }
});
console.log("Replacements complete.");
