async function main() {
  try {
    const res = await fetch('http://localhost:3000/src/main.tsx');
    console.log(res.status, await res.text());
  } catch (e) {
    console.error(e);
  }
}
main();
