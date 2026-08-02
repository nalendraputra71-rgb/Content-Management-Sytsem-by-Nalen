const fs = require('fs');
let content = fs.readFileSync('src/SettingsPanel.tsx', 'utf8');

const target = `  const delStatus = (i: number) => setLocalStatuses((s: any) => s.filter((_: any, idx: number) => idx !== i));`;
const replacement = `  const delStatus = (i: number) => setLocalStatuses((s: any) => s.filter((_: any, idx: number) => idx !== i));

  // Drag and Drop Logic
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedType, setDraggedType] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number, type: string) => {
    setDraggedIndex(index);
    setDraggedType(type);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      // Firefox requires some data to be set to allow dragging
      e.dataTransfer.setData("text/plain", "");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, index: number, type: string, list: any[], setter: any) => {
    e.preventDefault();
    if (draggedIndex === null || draggedType !== type || draggedIndex === index) return;
    
    const newList = [...list];
    const item = newList[draggedIndex];
    newList.splice(draggedIndex, 1);
    newList.splice(index, 0, item);
    
    setter(newList);
    setDraggedIndex(null);
    setDraggedType(null);
  };
  
  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDraggedType(null);
  };`;

content = content.replace(target, replacement);
fs.writeFileSync('src/SettingsPanel.tsx', content);
