console.log('import.meta.url:', import.meta.url);
console.log('process.argv[1]:', process.argv[1]);
console.log('Are they equal?', import.meta.url === `file://${process.argv[1]}`);