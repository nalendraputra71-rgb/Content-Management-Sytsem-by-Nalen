const fs = require('fs');
let code = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

// Remove static imports
const importsToRemove = [
  /import \{ QuickAddEventModal \} from "\.\.\/QuickAddEventModal";\n/,
  /import \{ ContentModal \} from "\.\.\/ContentModal";\n/,
  /import \{ CsvModal \} from "\.\.\/CsvModal";\n/,
  /import \{ ShareWorkspaceModal \} from "\.\.\/ShareWorkspaceModal";\n/,
  /import \{ CreateWorkspaceModal \} from "\.\.\/CreateWorkspaceModal";\n/
];

importsToRemove.forEach(regex => {
  code = code.replace(regex, "");
});

// Add lazy imports
const lazyImports = `
const QuickAddEventModal = lazy(() => import("../QuickAddEventModal").then(m => ({ default: m.QuickAddEventModal }))) as React.ComponentType<any>;
const ContentModal = lazy(() => import("../ContentModal").then(m => ({ default: m.ContentModal }))) as React.ComponentType<any>;
const CsvModal = lazy(() => import("../CsvModal").then(m => ({ default: m.CsvModal }))) as React.ComponentType<any>;
const ShareWorkspaceModal = lazy(() => import("../ShareWorkspaceModal").then(m => ({ default: m.ShareWorkspaceModal }))) as React.ComponentType<any>;
const CreateWorkspaceModal = lazy(() => import("../CreateWorkspaceModal").then(m => ({ default: m.CreateWorkspaceModal }))) as React.ComponentType<any>;
`;

code = code.replace(/const MonthView = lazy/, lazyImports + "const MonthView = lazy");

// Wrap the modals with Suspense
code = code.replace(/\{shareModal && <ShareWorkspaceModal(.*?)\/>\}/, "{shareModal && <Suspense fallback={null}><ShareWorkspaceModal$1/></Suspense>}");
code = code.replace(/\{createWsModal && <CreateWorkspaceModal(.*?)\/>\}/, "{createWsModal && <Suspense fallback={null}><CreateWorkspaceModal$1/></Suspense>}");
code = code.replace(/\{modal && <ContentModal([\s\S]*?)onSettingUpdate=\{updateWsSettings\} \/>\}/, "{modal && <Suspense fallback={null}><ContentModal$1onSettingUpdate={updateWsSettings} /></Suspense>}");
code = code.replace(/\{showCsv && <CsvModal(.*?)\/>\}/, "{showCsv && <Suspense fallback={null}><CsvModal$1/></Suspense>}");
code = code.replace(/\{quickAdd && <QuickAddEventModal(.*?)\/>\}/, "{quickAdd && <Suspense fallback={null}><QuickAddEventModal$1/></Suspense>}");

fs.writeFileSync('src/layouts/MainLayout.tsx', code);
console.log("Lazy modals patched!");
