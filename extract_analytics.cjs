const fs = require('fs');

function extractTab(tabName, startLine, endLine, outputFile) {
    let content = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');
    const lines = content.split('\n');
    
    const tabLines = lines.slice(startLine - 1, endLine - 1);
    let tabCode = tabLines.join('\n');
    
    // Replace the first occurrence of {tab === ... && (
    tabCode = tabCode.replace(/\{tab === "[^"]+" && \(/, '');
    
    // Remove the very last )} right before end
    let tabLinesArr = tabCode.split('\n');
    let idx = tabLinesArr.length - 1;
    while(idx >= 0) {
        if (tabLinesArr[idx].includes(')}')) {
            tabLinesArr[idx] = tabLinesArr[idx].replace(/\)\}/, '');
            break;
        }
        idx--;
    }
    tabCode = tabLinesArr.join('\n');
    
    let template = `
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CopyPlus, MessageSquare, Clock, MessageCircle, BarChart3, Bell, CheckSquare, Facebook, Instagram, Twitter, Linkedin, Youtube, Link2, TrendingUp, TrendingDown, Calendar as CalendarIcon, Image as ImageIcon, Send, Edit3, Sparkles, ChevronDown, Shield, User, Search, Activity, PieChart, Users, X, PlayCircle, RefreshCw, Smartphone, MoreHorizontal, Layout, Type, HelpCircle, Lightbulb, PenTool, Hash, RefreshCcw, ArrowRight, Eye, Calendar, CalendarDays, Maximize2, MoreVertical, ThumbsUp, MessageCircle as CommentIcon, Share2, CornerDownRight, CheckCircle2, AlertTriangle, AlertCircle, Trash2, ArrowUpRight, Music, Zap, Clock4, Filter, Columns, Download, Layers, LayoutGrid, Check, Settings, Copy, MousePointerClick, History, FileText, ChevronRight
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend, Cell, PieChart as RechartsPieChart, Pie } from "recharts";

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
    console.log("Created", outputFile);
}

extractTab('AnalyticsTab', 3217, 4001, 'src/AnalyticsTab.tsx');

// Now we need to figure out variables. We can do that by parsing the file for undefined vars using tsc or a regex approach.
