function sleep(ms) {
    return new Promise(resolve => {
      process.nextTick(() => resolve());
    });
}

for(let i = 0; i < 10; i++){
    console.log(i)
    await new Promise(r => setTimeout(() => r(), 2000));
}