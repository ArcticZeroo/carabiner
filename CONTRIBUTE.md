# Contribution
## Basics
- Follow coding standards. Such as semicolons on each line, spaces before braces, etc.
    - Still figuring out ESLint but check out current code in the mean time.

## Tests
- Set your slack token in the env variable SLACK_TOKEN. Easy, right?
- Make the slack token contain a workspace with the following (I made one just for testing):
    - The token's user, who should be given the username "carabiner-test-bot"
        - Add a bot here: https://my.slack.com/services/new/bot
    - A channel called "general" whose topic is "Company-wide announcements and work-based matters" (default)
    - A channel called "carabiner-private" which is a private channel that contains only you and the bot (2 users)
    - A channel called "random" whose topic is "Non-work banter and water cooler conversation" (default)
    - A channel called "carabiner-solitary" which is a private channel that ONLY the bot is in. You should add it, then leave.
    - Only TWO public channels total
    - Only TWO private channels total