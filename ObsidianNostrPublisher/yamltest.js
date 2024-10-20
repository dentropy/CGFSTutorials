export function removeYamlFromMarkdown(markdown) {
    if(markdown == undefined){
      return undefined
    }
    const lines = markdown.trim().split('\n');
  
    if (lines[0].trim() === '---') {
      let index = lines.indexOf('---', 1);
      if (index !== -1) {
        lines.splice(0, index + 1);
      }
    }
  
    const updatedMarkdown = lines.join('\n').trim();
    return updatedMarkdown;
  }
  
  

let test_string = `---
shared: true
---
Hello World
`

console.log(removeYamlFromMarkdown(test_string))