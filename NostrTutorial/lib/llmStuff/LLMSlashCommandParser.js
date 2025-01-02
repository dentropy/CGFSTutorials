import parse from "jsr:@inro/slash-command-parser";

export function LLMSlashCommandConvoParser(convo, models_supported) {
  let parsed_convo = [];
  let model_selected = models_supported[0];

//   console.log("THE_CONVO");
//   console.log(convo);

  // Parse /reset or /llm reset
  for (const event of convo) {
    console.log("THE_EVENT");
    console.log(event);
    if (
      event.decrypted_content.toLowerCase().replace(/\n/g, "").trim()[0] == "/"
    ) {
      let command_data = {};
      try {
        command_data = parse(event.decrypted_content).split("\n");
        console.log("THE_COMMAND_DATA");
        console.log(command_data);
      } catch (error) {
        console.log("Error in LLMSlashCommandConvoParser reset");
        console.log(error);
        parsed_convo.push(event);
        continue;
      }
      if (command_data.command.toLowerCase() == "llm") {
        if (command_data.subCommands[0] == "reset") {
          parsed_convo = [];
          parsed_convo.push(event);
        }
      }
      if (command_data.command.toLocaleLowerCase() == "reset") {
        parsed_convo = [];
        parsed_convo.push(event);
      }
    }
    parsed_convo.push(event);
  }

  // Parse the most recent event
  console.log("parsed_convo_001");
  console.log(parsed_convo);
  const latest_event = parsed_convo[parsed_convo.length - 1].decrypted_content
    .toLowerCase();
  if (
    latest_event
      .replace(/\n/g, "").trim()[0] == "/"
  ) {
    let command_data = {};
    try {
      command_data = parse(latest_event.split("\n")[0]);
      console.log("THE_command_data_2");
      console.log(command_data);
    } catch (error) {
      console.log("Error in LLMSlashCommandConvoParser recent message");
      console.log(error);
      return {
        parsed_convo: parsed_convo,
        model_selected: model_selected,
      };
    }
    // Parse Help
    const help_response =
      "Please enter one of the following slash commands\nhelp\n/reset\n/llm to get more information on each of the commands for this bot";
    if (command_data.command.toLocaleLowerCase() == "help") {
      return help_response;
    }
    // DO NOT MOVE THE CODE BELOW UP
    if (
      command_data.command.toLocaleLowerCase() == "llm" &&
      command_data.subCommands[0].toLocaleLowerCase() == "help"
    ) {
      return help_response;
    }
    if (
      command_data.command.toLocaleLowerCase() == "llm" &&
      command_data.subCommands[0].toLocaleLowerCase() == "list-models"
    ) {
      return `${JSON.stringify(models_supported)}`;
    }
    if (
      command_data.command.toLocaleLowerCase() == "llm" &&
      command_data.subCommands[0].toLocaleLowerCase() == "run"
    ) {
      // Check for invalid Options
      const valid_options = ["select-model", "msg-offset"];
      for (const command_option of Object.keys(command_data.options)) {
        console.log(command_option);
        if (!valid_options.includes(command_option.toLowerCase())) {
          return `Invalid Option ${command_option} make sure it is from this list \n${
            JSON.stringify(valid_options)
          }\nOr run "\\llm help" to learn more`;
        }
      }
      // Parse select-model
      if (Object.keys(command_data.options).includes("select-model")) {
        // Check if model exists
        if (!models_supported.includes(command_data.options["select-model"])) {
          return `Invalid Option ${command_option} make sure it is from this list \n${
            JSON.stringify(models_supported)
          }\nOr run "\\llm help" to learn more`;
        } else {
          model_selected = command_data.options["select-model"];
        }
      }
      // Parse msg-offset
      if (Object.keys(command_data.options).includes("msg-offset")) {
        // Verify Offset is valid
        const offset = parseInt(command_data.options["msg-offset"]);
        if (offset == isNaN) {
          return `For msg-offset please enter a number`;
        }
        if (offset >= parsed_convo.length) {
          return `For msg-offset This thread is only ${parsed_convo.length} events in length, your offset ${offset}`;
        }
        if (offset >= 0) {
          return `For msg-offset please input a valid number`;
        }
        parsed_convo = parsed_convo.slice(-offset);
      }
    }
  }
  return {
    parsed_convo: parsed_convo,
    model_selected: model_selected,
  };
}

function ExperimentalLLMSlashMessageParser(message_content) {
  let parsed_content = {};
  try {
    parsed_content = parse(message_content);
  } catch (error) {
    return "Error Processing Slash Command: TODO";
  }
  const default_help_response =
    "Please enter one of the following slash commands\nhelp\n/reset\n/llm to get more information on each of the commands for this bot";
  switch (parsed_content.command.toLocaleLowerCase()) {
    case "help":
      return default_help_response;
    case "reset":
      break;
    case "llm":
      break;
    default:
      return help_response;
  }
}
