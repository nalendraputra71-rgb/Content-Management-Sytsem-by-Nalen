const fs = require('fs');
let code = fs.readFileSync('src/AnalyticsTab.tsx', 'utf8');

// The messed up lines are:
// import React from "react";
// import Markdown from "react-markdown";
// import React  'react';
// import { motion, AnimatePresence } from 'motion/react';
// ...
// } MapPin,  "lucide-react";

// Replace all imports with a clean one
const cleanImports = `
import React from "react";
import Markdown from "react-markdown";
import { motion, AnimatePresence } from 'motion/react';
import { 
  CopyPlus, MessageSquare, Clock, MessageCircle, BarChart3, Bell, CheckSquare, Facebook, Instagram, Twitter, Linkedin, Youtube, Link2, TrendingUp, TrendingDown, Calendar as CalendarIcon, Image as ImageIcon, Send, Edit3, Sparkles, ChevronDown, Shield, User, Search, Activity, PieChart, Users, X, PlayCircle, RefreshCw, Smartphone, MoreHorizontal, Layout, Type, HelpCircle, Lightbulb, PenTool, Hash, RefreshCcw, ArrowRight, Eye, Calendar, CalendarDays, Maximize2, MoreVertical, ThumbsUp, MessageCircle as CommentIcon, Share2, CornerDownRight, CheckCircle2, AlertTriangle, AlertCircle, Trash2, ArrowUpRight, Music, Zap, Clock4, Filter, Columns, Download, Layers, LayoutGrid, Check, Settings, Copy, MousePointerClick, History, FileText, ChevronRight, MapPin
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend, Cell, PieChart as RechartsPieChart, Pie } from "recharts";
`;

const firstExport = code.indexOf('export function AnalyticsTab');
if (firstExport !== -1) {
    code = cleanImports + '\n' + code.substring(firstExport);
    fs.writeFileSync('src/AnalyticsTab.tsx', code);
}
