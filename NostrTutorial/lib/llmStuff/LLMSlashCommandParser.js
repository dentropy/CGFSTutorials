import parse from "jsr:@inro/slash-command-parser";

export function LLMSlashCommandParser(message_content) {
  let parsed_content = {};
  try {
    parsed_content = parse(message_content);
  } catch (error) {
    return "Error Processing Slash Command: TODO";
  }
  const default_help_response = "Please enter one of the following slash commands\nhelp\n/reset\n/llm to get more information on each of the commands for this bot";
  switch (parsed_content.command.toLocaleLowerCase()) {
    case "help":
      return default_help_response
    case "reset":
      break;
    case "llm":
      break;
    default:
      return help_response;
  }
}
