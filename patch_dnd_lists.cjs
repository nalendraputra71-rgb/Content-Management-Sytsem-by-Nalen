const fs = require('fs');
let content = fs.readFileSync('src/SettingsPanel.tsx', 'utf8');

const lists = [
  { name: 'localPillars', setter: 'setLocalPillars', type: 'pillars' },
  { name: 'localPlatforms', setter: 'setLocalPlatforms', type: 'platforms' },
  { name: 'localContentTypes', setter: 'setLocalContentTypes', type: 'contentTypes' },
  { name: 'localPics', setter: 'setLocalPics', type: 'pics' },
  { name: 'localStatuses', setter: 'setLocalStatuses', type: 'statuses' }
];

for (const list of lists) {
  const mapStartRegex = new RegExp(`{${list.name}\\.map\\(\\(p: any, i: number\\) => \\(\\s*<div key=\\{i\\} className="([^"]+)"([^>]*)>`);
  const match = content.match(mapStartRegex);
  if (match) {
    const origClass = match[1];
    
    // add draggable props to the div
    // also add a grip icon as drag handle
    const replacement = `{${list.name}.map((p: any, i: number) => (
                      <div 
                        key={i} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, i, '${list.type}')}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, i, '${list.type}', ${list.name}, ${list.setter})}
                        onDragEnd={handleDragEnd}
                        className={\`${origClass} \${draggedIndex === i && draggedType === '${list.type}' ? 'opacity-50' : ''}\`}$2>
                        <div className="cursor-grab active:cursor-grabbing text-neutral-300 hover:text-neutral-500">
                          <GripVertical size={16} />
                        </div>`;
    
    content = content.replace(mapStartRegex, replacement);
  }
}

fs.writeFileSync('src/SettingsPanel.tsx', content);
