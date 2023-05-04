# Discord JS Leveling System Bot
> A Discord Leveling Bot built with Discord.js and Canvas made by roefinoavrililo
## The Most Complete Discord Leveling Bot Open Source!
> Role level, set and add, rank card, more! Easy to use and free!

## IMPORTANT:
**This code is for people to learn the basics of how to use better-sqlite3, canvas, canvacord, and discord.js. You can use my code for your bot for free. If you see a normal problem like "npm errors can't install" and stuff, please google it first, so you can learn how to fix errors and mistake by yourself. if you see an actual errors like "xp not adding up", "user can't level up", "image error" you can go ahead and ask me in my Discord Server.**
**IF YOU REALLY WANT TO USE THIS BOT FOR YOUR SERVER, BUT IT CAN'T GO ONLINE 24/7, THERE IS A TUTORIAL OF HOW TO HOST IT FOR FREE IN TUTORIAL.MD FILE, REMEMBER THAT REPL.IT DOES NOT SUPPORT BETTER-SQLITE3**

## UPDATES:
**Hey, I'm currently taking a break right now from programming after working on a game https://roefino.itch.io/couch-tap (check it out btw its free you can try it now!!) thanks for supporting me and this repository! I can't wait to get back to work!**

## Support Me!
1. Invite my bot to your server by using this [Link](https://bit.ly/sarahbot)
2. Join my server [here](https://bit.ly/DTserver)
3. Support me on Patreon [here!](https://www.patreon.com/roefino?fan_landing=true)

## Tutorial
Tutorial can be found in `TUTORIAL.md` file.

## Requirements
1. Your Discord Bot Token **[Guide Here](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)**
2. Node.js v12.0.0 or newer
3. Packages you need to install: Discord.JS, better-sqlite3, canvas or canvacord, fs.
4. DB Browser (SQLite) *optional

## Different Rank Card
There are two different type of rank card that you can use, "rank.js.canvacord" uses canvacord ![logo](https://media.discordapp.net/attachments/740789315407183872/863914086642483210/RankCard.png) 
or "rank.js.canvas" uses normal canvas ![logo](https://media.discordapp.net/attachments/740789315407183872/863914700319358986/rank.png)
**YOU CAN ONLY CHOOSE ONE OF THE FILE!!!**
Remove .canvacord or .canvas if you want to choose which card you think better.

## IMPORTANT NOTE
You cannot host this bot on Heroku since Heroku cannot write files such as sqlite files. You can host your bot on Something.Host, Make sure you have join [This Server](https://discord.gg/hosting) for free hosting services.

Make sure you turn these on! Go to: `https://discord.com/developers/applications/yourclientid/bot`
![logo](https://cdn.discordapp.com/attachments/740789315407183872/777849276150710282/unknown.png)

## Configuration
**Note: Do not share your bot token publicly!**

You need to rename `config.json.example` file to `config.json` and after you done that, you need to specify your bot token, your user id, and prefix.

```json
{
    "token": "yourbottoken",
    "ownerID": "youruserid",
    "prefix": "yourprefix"
}
```

## Important!
> Your bot requires these permissions: 
1. ATTACH_FILES (So that your bot will be able to send your rank card)
2. SEND_MESSAGES (very important)
3. MESSAGE_EMBED or EMBED_LINKS (So that your bot will be able to send an embed message)
4. MANAGE_ROLES (This is very important if you want to add leveling roles to your bot.)

## Features and Commands!

> Note
* The default prefix is '-', you can change the prefix by simply go to `config.json` file and change the prefix to any prefix you want.
* () means optional, [] means mandatory.

> Help commands
* `-help (command name)`

> Set Prefix commands
* `-setprefix [new prefix]`

> Get user ranks
* `-rank (userID or mention)`

> Top 10 Leaderboard for the most total xp
* `-leaderboard`

> Add Level
* `-givelevel [userID or Mention] [level amount]`

> Set Level
* `-setlevel [userID or Mention] [level amount]`

> Remove Level
* `-removelevel [userID or Mention] [level amount]`

> Role Level
* Add role Level
`-rlevel [ add ] [ level ] [ role ]`
* Remove role level
`-rlevel remove [ level ]`
* Show role level
`-rlevel show`

> AND MORE...


## TO DO
> ▶️ Voice Leveling
> ▶️ Custom Rank Card

## Contributing

1. [Fork this repository](https://github.com/roefinoavrililo/Discord.JS-Leveling-Bot/fork)
2. Clone your fork: `git clone https://github.com/your-username/Discord.JS-Leveling-Bot.git`
3. Create your feature branch: `git checkout -b my-new-feature`
4. Commit your changes: `git commit -am 'Add some feature'`
5. Push to the branch: `git push origin my-new-feature`
6. Submit a pull request
