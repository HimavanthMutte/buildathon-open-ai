const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
        filelist = fs.statSync(path.join(dir, file)).isDirectory()
            ? walkSync(path.join(dir, file), filelist)
            : filelist.concat(path.join(dir, file));
    });
    return filelist;
}

const files = walkSync('./src/app').filter(f => f.endsWith('.js') || f.endsWith('.jsx') || f.endsWith('.css'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // Replace purple gradients with solid colors or more professional blue/teal themes
    content = content.replace(/bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700/g, 'bg-blue-600 hover:bg-blue-700');
    content = content.replace(/bg-gradient-to-r from-purple-600 to-blue-600/g, 'bg-blue-600 hover:bg-blue-700');
    content = content.replace(/from-purple-50/g, 'from-blue-50');
    content = content.replace(/to-purple-50/g, 'to-blue-50');
    content = content.replace(/from-purple-100/g, 'from-blue-100');
    content = content.replace(/to-purple-100/g, 'to-blue-100');

    // Generic purple replacement
    content = content.replace(/purple/g, 'emerald');

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
