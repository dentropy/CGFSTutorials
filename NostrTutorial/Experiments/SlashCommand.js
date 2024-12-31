/*

/reset

/help
  reset
  llm

/llm
  reset
  list-models
  select-model
  msg-offset

*/

import parse from "jsr:@inro/slash-command-parser";

const test_slash_commands = [
  "/reset",
  "/help",
  "/help reset",
  "/help llm",
  "/llm reset",
  "/llm list-models",
  "/llm select-model llama3.2",
  "/llm msg-offset 3",
  "/llm select-model: llama3.1 msg-offset: 3"
];

for(const command_string of test_slash_commands){
    console.log(`\n${command_string}`)
    const result = parse(command_string)
    console.log(result);
}
