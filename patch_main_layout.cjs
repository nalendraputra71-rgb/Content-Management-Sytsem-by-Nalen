const fs = require('fs');
let code = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

if (!code.includes("import { usePlanLimits }")) {
    code = code.replace(
        'import { LogOut, LayoutGrid, Plus, Bell, Upload, Briefcase, FileText, Target, Search, Clock, Users, ArrowLeft, CheckCircle2, CopyPlus, Archive, PlayCircle, Eye, Settings, Heart, Video, Link2, CreditCard, LayoutTemplate, Share2 } from "lucide-react";',
        'import { LogOut, LayoutGrid, Plus, Bell, Upload, Briefcase, FileText, Target, Search, Clock, Users, ArrowLeft, CheckCircle2, CopyPlus, Archive, PlayCircle, Eye, Settings, Heart, Video, Link2, CreditCard, LayoutTemplate, Share2 } from "lucide-react";\nimport { usePlanLimits } from "../hooks/usePlanLimits";'
    );
}

const findMaxWorkspaces = /    const maxWorkspaces = planDetails\?.maxWorkspaces \|\| 1;\n    if \(maxWorkspaces !== -1 && ownedWorkspaces\.length >= maxWorkspaces\) \{/g;

if (code.match(findMaxWorkspaces)) {
    code = code.replace(
        /    const maxWorkspaces = planDetails\?.maxWorkspaces \|\| 1;\n    if \(maxWorkspaces !== -1 && ownedWorkspaces\.length >= maxWorkspaces\) \{/g,
        '    const { checkCanAddWorkspace, maxWorkspaces } = usePlanLimits();\n    if (!checkCanAddWorkspace(ownedWorkspaces.length)) {'
    );
}

fs.writeFileSync('src/layouts/MainLayout.tsx', code, 'utf8');
