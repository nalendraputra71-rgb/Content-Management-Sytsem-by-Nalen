# Wrap views inside motion.div
sed -i '/<motion.div key={tab + "-" + contentTab}/a \            <Suspense fallback={<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>}>' src/App.tsx

sed -i '/<\/AnimatePresence>/ {
    s/<\/AnimatePresence>/<\/Suspense>\n        <\/AnimatePresence>/g
}' src/App.tsx
