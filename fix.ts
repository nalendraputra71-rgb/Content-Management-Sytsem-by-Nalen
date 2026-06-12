import * as fs from 'fs';
const files = ['./src/Views.tsx', './src/AnalyticsView.tsx', './src/Nav.tsx', './src/App.tsx', './src/DashboardView.tsx'];
for (const file of files) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf-8');
        // keep backdrop filter only for Nav bars (sticky top 50), and Modals maybe.
        // Actually, for performance, let's remove backdrop filter from all cards and list items.
        // Let's replace 'backdropFilter: "blur(16px)"' with "none" or just remove them.
        
        // Wait, the main issue is usually `box-shadow` combined with `backdrop-filter` on scrolling elements.
        content = content.replace(/backdropFilter:\s*["']blur\([0-9]+px\)["']/g, 'backdropFilter: "none"');
        content = content.replace(/WebkitBackdropFilter:\s*["']blur\([0-9]+px\)["']/g, 'WebkitBackdropFilter: "none"');

        // Restore it for sticky Nav components to keep them looking okay, but with smaller blur.
        
        fs.writeFileSync(file, content);
    }
}
