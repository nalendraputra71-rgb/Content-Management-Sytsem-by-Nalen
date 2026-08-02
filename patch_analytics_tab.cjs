const fs = require('fs');
let code = fs.readFileSync('src/AnalyticsTab.tsx', 'utf8');

const vars = [
  'isMobileHubAi', 'aiLoading', 'aiReport', 'analyticsMetric', 'setAnalyticsMetric', 
  'analyticsPlatform', 'setAnalyticsPlatform', 'audiencePlatform', 'setAudiencePlatform', 
  'analyticsTimeRange', 'setAnalyticsTimeRange', 'heatmapMetric', 'setHeatmapMetric', 
  'name', 'DASHBOARD_TIME_RANGES', 'ANALYTICS_METRICS', 'PLATFORMS', 'data', 'generateReport', 
  'MOCK_CHART_DATA', 'HeatmapMock', 'CustomDropdown', 'MobileStepper'
];

code = code.replace('// WE WILL FILL THIS LATER', vars.join(',\n    '));

fs.writeFileSync('src/AnalyticsTab.tsx', code);
