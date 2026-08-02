const fs = require('fs');

function fixTab(tabFile, usedVarsStr) {
    let code = fs.readFileSync(tabFile, 'utf8');
    let usedVars = usedVarsStr.split(', ');
    code = code.replace('// WE WILL FILL THIS LATER', usedVars.join(',\n    '));
    
    // Add imports for CustomDropdown, MobileStepper if needed
    if (usedVars.includes('CustomDropdown') && !code.includes('import { CustomDropdown')) {
        code = code.replace('import React from "react";', 'import React from "react";\nimport { CustomDropdown } from "./data";\n');
    }
    
    fs.writeFileSync(tabFile, code);
}

fixTab('src/ContentTab.tsx', 'isMobileHubAi, contentPlatform, setContentPlatform, PLATFORMS, data, DISPLAY_CONTENT, days, posts, caption, media, input, ctx, p, CustomDropdown, MobileStepper');
fixTab('src/CalendarTab.tsx', 'isMobileHubAi, calendarPosts, setCalendarPosts, contentPlatform, setContentPlatform, PLATFORMS, CalendarMock, posts, ctx, p, CustomDropdown, MobileStepper');
fixTab('src/CompetitorTab.tsx', 'isMobileHubAi, competitors, compInput, setCompInput, compLoading, contentPlatform, setContentPlatform, PLATFORMS, addCompetitor, removeCompetitor, input, ctx, target, p, CustomDropdown, MobileStepper');
fixTab('src/InboxTab.tsx', 'inboxMessages, msgContent, setMsgContent, inboxFilter, setInboxFilter, inboxViewMode, setInboxViewMode, isMobileHubAi, mergedComments, replyingTo, setReplyingTo, ref, option, setSelectedInboxMsg, setSelectedComment, commentChatScrollRef, inboxChatScrollRef, selectedComment, selectedInboxMsg, sendCommentReply, sendDMMessage, input, ctx, target, p');

// Update ctx in SocialStudioView
let social = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

const ctxVars = [
  // Dashboard
  'isMobileHubAi', 'dashboardPlatform', 'PLATFORMS', 'setDashboardPlatform', 
  'dashTimeRange', 'DASHBOARD_TIME_RANGES', 'setDashTimeRange',
  'setShowCreatePostPopup', 'metaApiError', 'lang', 'connectedPlatforms',
  'toggleConnection', 'connectedAccountsData', 'isDiagnosing', 'runDiagnostic',
  'diagnosticResult', 'MobileStepper', 'CustomDropdown',
  // Analytics
  'aiLoading', 'aiReport', 'analyticsMetric', 'setAnalyticsMetric', 
  'analyticsPlatform', 'setAnalyticsPlatform', 'audiencePlatform', 'setAudiencePlatform', 
  'analyticsTimeRange', 'setAnalyticsTimeRange', 'heatmapMetric', 'setHeatmapMetric', 
  'name', 'ANALYTICS_METRICS', 'data', 'generateReport', 
  'MOCK_CHART_DATA', 'HeatmapMock',
  // Content
  'contentPlatform', 'setContentPlatform', 'DISPLAY_CONTENT', 'days', 'posts', 'caption', 'media', 'input', 'p',
  // Calendar
  'calendarPosts', 'setCalendarPosts', 'CalendarMock',
  // Competitor
  'competitors', 'compInput', 'setCompInput', 'compLoading', 'addCompetitor', 'removeCompetitor', 'target',
  // Inbox
  'inboxMessages', 'msgContent', 'setMsgContent', 'inboxFilter', 'setInboxFilter', 
  'inboxViewMode', 'setInboxViewMode', 'mergedComments', 'replyingTo', 'setReplyingTo', 
  'ref', 'option', 'setSelectedInboxMsg', 'setSelectedComment', 'commentChatScrollRef', 
  'inboxChatScrollRef', 'selectedComment', 'selectedInboxMsg', 'sendCommentReply', 'sendDMMessage'
];

const uniqueCtx = [...new Set(ctxVars)];

// We replace the current const ctx = { ... };
const ctxStart = social.indexOf('const ctx = {');
if (ctxStart !== -1) {
    const ctxEnd = social.indexOf('};', ctxStart) + 2;
    const newCtx = 'const ctx = {\n    ' + uniqueCtx.join(', ') + '\n  };';
    social = social.substring(0, ctxStart) + newCtx + social.substring(ctxEnd);
}

fs.writeFileSync('src/SocialStudioView.tsx', social);
