const fs = require('fs');

const bgSnippet = `
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-center bg-cover opacity-5 dark:opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=60')" }}
      />
`;

const authFiles = [
    './src/app/login/page.js',
    './src/app/signup/page.js',
    './src/app/forgot-password/page.js',
    './src/app/reset-password/page.js'
];

authFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    const targetStr = '<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 transition-colors duration-200">';
    const replacementStr = '<div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 transition-colors duration-200 overflow-hidden">' + bgSnippet.replace(/\\n/g, '\\n');

    content = content.replace(targetStr, replacementStr);
    content = content.replace('<div className="max-w-md w-full space-y-8">', '<div className="relative z-10 max-w-md w-full space-y-8">');

    fs.writeFileSync(file, content, 'utf8');
});

console.log("Updated auth pages.");

// Update dashboard
const dashboardFile = './src/app/dashboard/page.js';
let dashContent = fs.readFileSync(dashboardFile, 'utf8');
const dashTarget = '<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">';
const dashReplacement = '<div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200 overflow-hidden">' + bgSnippet;

dashContent = dashContent.replace(dashTarget, dashReplacement);
dashContent = dashContent.replace(/<header className="/, '<header className="relative z-10 ');
dashContent = dashContent.replace(/<main className="/, '<main className="relative z-10 ');
dashContent = dashContent.replace(/<footer className="/, '<footer className="relative z-10 ');

fs.writeFileSync(dashboardFile, dashContent, 'utf8');
console.log("Updated dashboard.");

// Update saved-schemes
const savedSchemesFile = './src/app/saved-schemes/page.js';
if (fs.existsSync(savedSchemesFile)) {
    let savedContent = fs.readFileSync(savedSchemesFile, 'utf8');
    savedContent = savedContent.replace(dashTarget, dashReplacement);
    savedContent = savedContent.replace(/<header className="/, '<header className="relative z-10 ');
    savedContent = savedContent.replace(/<main className="/, '<main className="relative z-10 ');
    savedContent = savedContent.replace(/<footer className="/, '<footer className="relative z-10 ');
    fs.writeFileSync(savedSchemesFile, savedContent, 'utf8');
    console.log("Updated saved-schemes.");
}
