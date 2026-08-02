const fs = require('fs');

function extractTab(tabName, tabIdentifier, outputFile, importsStr) {
    let social = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');
    
    // Find where the tab starts
    const startStr = `{tab === "${tabIdentifier}" && (`;
    let startIdx = social.indexOf(startStr);
    
    // We want to replace everything from startStr up to the matching ')}' that closes it.
    // However, it's easier to use the fact that the next tab starts right after it.
    
    const allIdentifiers = [
        "social-dashboard", "social-analytics", "social-content", 
        "social-calendar", "social-competitor", "social-inbox", "social-hub-ai"
    ];
    
    let endIdx = -1;
    let nextTabIdx = allIdentifiers.indexOf(tabIdentifier) + 1;
    for (let i = nextTabIdx; i < allIdentifiers.length; i++) {
        const nextStr = `{tab === "${allIdentifiers[i]}" && (`;
        const tempEnd = social.indexOf(nextStr, startIdx);
        if (tempEnd !== -1) {
            endIdx = tempEnd;
            break;
        }
    }
    
    // If no next tab is found, we find the end of the return statement
    if (endIdx === -1) {
        endIdx = social.lastIndexOf('</AnimatePresence>'); // usually inside AnimatePresence or right before it closes
    }
    
    let tabCodeRaw = social.substring(startIdx, endIdx);
    
    // Ensure we don't accidentally grab something else
    // Now replace the tabCodeRaw in SocialStudioView
    const replacement = `{tab === "${tabIdentifier}" && <${tabName} ctx={ctx} />}\n          `;
    social = social.replace(tabCodeRaw, replacement);
    
    if (!social.includes(`import { ${tabName} }`)) {
        social = `import { ${tabName} } from "./${tabName}";\n` + social;
    }
    fs.writeFileSync('src/SocialStudioView.tsx', social);
    
    // Clean up the tab code
    let tabCode = tabCodeRaw.trim();
    // Remove the starting `{tab === "..." && (`
    tabCode = tabCode.replace(new RegExp(`\\{tab === "${tabIdentifier}" && \\(`), '');
    // Remove the trailing `)}`
    tabCode = tabCode.substring(0, tabCode.lastIndexOf(')}'));
    
    let template = `
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CopyPlus, MessageSquare, Clock, MessageCircle, BarChart3, Bell, CheckSquare, Facebook, Instagram, Twitter, Linkedin, Youtube, Link2, TrendingUp, TrendingDown, Calendar as CalendarIcon, Image as ImageIcon, Send, Edit3, Sparkles, ChevronDown, Shield, User, Search, Activity, PieChart, Users, X, PlayCircle, RefreshCw, Smartphone, MoreHorizontal, Layout, Type, HelpCircle, Lightbulb, PenTool, Hash, RefreshCcw, ArrowRight, Eye, Calendar, CalendarDays, Maximize2, MoreVertical, ThumbsUp, MessageCircle as CommentIcon, Share2, CornerDownRight, CheckCircle2, AlertTriangle, AlertCircle, Trash2, ArrowUpRight, Music, Zap, Clock4, Filter, Columns, Download, Layers, LayoutGrid, Check, Settings, Copy, MousePointerClick, History, FileText, ChevronRight, Video, File, Mic, Repeat
} from "lucide-react";
${importsStr}

export function ${tabName}({ ctx }: { ctx: any }) {
  const {
    // WE WILL FILL THIS LATER
  } = ctx;
  
  return (
    ${tabCode}
  );
}
`;
    fs.writeFileSync(outputFile, template);
    
    console.log(`Extracted ${tabName}`);
}

const importsStr = `import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend, Cell, PieChart as RechartsPieChart, Pie } from "recharts";`;

extractTab('ContentTab', 'social-content', 'src/ContentTab.tsx', importsStr);
extractTab('CalendarTab', 'social-calendar', 'src/CalendarTab.tsx', importsStr);
extractTab('CompetitorTab', 'social-competitor', 'src/CompetitorTab.tsx', importsStr);
extractTab('InboxTab', 'social-inbox', 'src/InboxTab.tsx', importsStr);
// extractTab('HubAiTab', 'social-hub-ai', 'src/HubAiTab.tsx', importsStr); 
// HubAiTab is special, it's mixed with modal logic maybe?

