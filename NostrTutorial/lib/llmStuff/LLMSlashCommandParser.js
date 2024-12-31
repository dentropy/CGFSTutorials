import parse from "jsr:@inro/slash-command-parser";

export function LLMSlashCommandParser(message_content) {
  let parsed_content = {};
  try {
    pased_content = parse(message_content);
  } catch (error) {
    return "Error Processing Slash Command: TODO";
  }
  const help_response = "";
  switch (parsed_content.command.toLocaleLowerCase()) {
    case "help":
      break;
    case "reset":
      break;
    case "llm":
      break;
    default:
      return help_response;
  }
}
