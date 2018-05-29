# Carabiner

[![Build Status](https://travis-ci.org/ArcticZeroo/carabiner.svg?branch=master)](https://travis-ci.org/ArcticZeroo/carabiner)

Easy to use, high level slack lib for Node.JS!

Documentation coming soon, this is not a complete version. Feel free to clone the repo and run jsdoc, many classes are already pretty documented.

This is is a complete rewrite of both [frozor-slackbot](https://github.com/ArcticZeroo/frozor-slackbot) and [frozor-slack](https://github.com/ArcticZeroo/frozor-slack), combining their features and adding onto them for a much better overall library. I have no plans to include a guide to convert from either of those modules, mostly because nobody actually uses them to my knowledge but me. 

Currently, this lib supports the following slack APIs:
* Web API
* Real Time Messaging API (websocket)

Current status: **NOT READY TO USE**

More unit tests are needed to determine whether it works properly in all scenarios, and events are not yet extended with cached items. This is not production-ready.

At some point I plan to add support for slash commands, but having to run an express server inside this lib sounds like a mess I don't want to handle right now.

I also plan to add some kind of client similar to the discordjs commando module, which just extends the `Discord.Client`. Right now, command handling can be a bit of a pain at times, even though [frozor-commands](https://github.com/ArcticZeroo/frozor-commands) actually makes it pretty simple for me. This client may have support for 'conversations' (prompts and user responses to those prompts), I don't really know yet. 

It may also be pertinent to add multi-team support to this client. Right now, one client connects to one team. This could be pretty easily changed (the `Client` class could be almost entirely moved out and instead replaced with a `.teams` collection), but I currently have no need for this so it's not done.