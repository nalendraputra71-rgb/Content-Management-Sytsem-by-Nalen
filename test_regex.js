const link = "https://drive.google.com/file/d/1Xy_Y-o/view?usp=sharing";
const match = link.match(/\/d\/([a-zA-Z0-9_-]+)/);
console.log(match ? match[1] : null);
