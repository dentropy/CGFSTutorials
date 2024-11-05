let provided_time = '16:30:00'
let provided_date = '2022-10-24'

let system_prompt = `
Imagine you have a clock with hours, minutes, and seconds. You want to tell a robot (like a computer) when to do something at specific times.

**Date and Time:**
Let's say your date and time is "March 12, 2024 10:30 PM". This tells the robot that you want it to do something on March 12th in 2024, exactly at 10:30 PM.

**Crontab:**
Now, imagine a special format (like a secret code) that tells the robot how often to do something. The crontab is like this secret code!

A crontab consists of 5 parts:

1. **Minute**: How many minutes after the hour you want the action to happen.
2. **Hour**: Which hour of the day you want the action to happen (0-23).
3. **Day**: Which days of the month you want the action to happen (e.g., 1, 2, 5 for Monday, Tuesday, and Friday).
4. **Month**: Which months of the year you want the action to happen.
5. **Day of week**: Which day of the week you want the action to happen (0-6, where 0 = Sunday).

To convert your date and time to a crontab, you'll need to figure out what these parts mean:

* Minute: Since it's at 10:30 PM, you might want to choose 30 or 0.
* Hour: The hour is already specified (10:00).
* Day: You don't know the exact date yet. Let's assume we're using a fixed year for simplicity (e.g., 2024). If you know the specific date, you can add it manually in the next steps.
* Month: We'll use * (asterisk) to match any month.
* Day of week: Since we're not specifying an exact day yet, let's use *

Here's a simple crontab for "March 12, 2024 10:30 PM":
'''
0 30 * * *
'''

**Explanation:**

* '0': The minute is at 0, meaning the action will happen exactly on the hour (10:00).
* '30': The minute is specified as 30 (instead of using the entire 30 minutes), so the action will happen at 10:30 PM.
* '* * *': These are placeholders for the other fields:
 + '*': Match any month (1-12)
 + '*': Match any day of the month
 + '*': Match any year

Keep in mind that this is a very simple example. In real-world scenarios, you'll need to consider more complex date and time calculations.

When using crontab on a Linux or macOS system, it's recommended to use '@reboot' at the beginning of the command, so the script runs automatically when your computer boots:
'''
0 30 * * * /path/to/your/script
'''
Make sure to replace '/path/to/your/script' with the actual path to your script.`

const now = new Date();
console.log(new Date().toISOString())
const response = await fetch("http://192.168.7.209:11434/api/chat", {
    method: "POST",
    body: JSON.stringify({
        "model": "llama3.2",
        "messages": [
          {
            "role" : "system",
            "content": system_prompt
          },
          {
            "role": "user",
            "content": `Provided Time(ISO Format): ${provided_time}\nProvided Date(ISO Format): ${provided_date}`
          }
        ],
        "stream": false,
        "tools": [
          {
            "type": "function",
            "function": {
              "name": "date_and_time_to_cron",
              "description": "Take provided time and provided date and generate crontab string",
              "parameters": {
                "type": "object",
                "properties": {
                  "crontab": {
                    "type": "string",
                    "description": "Crontab string"
                  }
                },
                "required": ["crontab"]
              }
            }
          }
        ]
      }),
    headers: { "Content-Type": "application/json" },
  });
const body = await response.json();
console.log(JSON.stringify(body, null, 2))
