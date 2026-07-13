sed -i "s/setTimeout(() => {/window.requestAnimationFrame(() => {/g" src/ContentModal.tsx
sed -i "s/}, 0);/});/g" src/ContentModal.tsx
