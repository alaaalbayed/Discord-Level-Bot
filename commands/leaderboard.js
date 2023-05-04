const { MessageEmbed } = require('discord.js');
const SQLite = require("better-sqlite3");
const sql = new SQLite('./mainDB.sqlite')


module.exports = {
    name: 'leaderboard',
    aliases: ['lb','top'],
    description: "Check top 10 users with the most xp and the highest level",
    cooldown: 0,
    category: "Leveling",
    async execute(client, message, args) {
      const selectPrefix = sql.prepare("SELECT * FROM prefix WHERE guild = ?").get(message.guild.id);;
      const prefix = selectPrefix.serverprefix
      
    // Select data from database
    
    const currentPage = parseInt(args[0]) || 1;
    const currentPageDWM = parseInt(args[1]) || 1;
    const top10 = sql.prepare("SELECT * FROM levels WHERE guild = ? ORDER BY totalXP DESC;").all(message.guild.id);
    const topday = sql.prepare("SELECT * FROM levels WHERE guild = ? ORDER BY dailyXP DESC;").all(message.guild.id);
    const topweek = sql.prepare("Select * FROM levels WHERE guild = ? ORDER BY weeklyXP DESC;").all(message.guild.id);
    const topmonth = sql.prepare("Select * FROM levels WHERE guild = ? ORDER BY monthlyXP DESC;").all(message.guild.id);

    if(parseFloat(args[0])  > Math.ceil(top10.length / 10)) {
      return message.reply(`Invalid page number! There are only ${Math.ceil(top10.length / 10)} pages`)
    }
    if(!args[0] || args[0].toLowerCase() == "total" || args[0]  <= Math.ceil(top10.length / 10) && args[0] > 0){
        const embed = new MessageEmbed()
        .setAuthor({name:`${client.user.username}`, iconURL: `${client.user.avatarURL({dynamic: true, size: 512})}`})
        .setTitle(`${message.guild.name} Ranking`)
        .setColor("RANDOM")
        .setTimestamp()
        .setDescription(`Top 10 Leaderboard`);
        

      if(top10.length < 1) {
          embed.setDescription(`There is no user in leaderboard!`)
        }
      var state = {
        'querySet': top10,
        'page': currentPage,
        'rows': 10
      }

      buildTable()

      function pagination(querySet, page, rows) {
        var trimStart = (page - 1) * rows
        var trimEnd = trimStart + rows

        var trimmedData = querySet.slice(trimStart, trimEnd)
      
        var pages = Math.ceil(querySet.length / rows)

        return{
          'querySet':trimmedData,
          'pages':pages
        }
      }
      
      function buildTable() {
        var pagesData = pagination(state.querySet, state.page, state.rows)
        var myList = pagesData.querySet
      for(var i in myList) {
           let nextXP = myList[i].level * 2 * 250 + 250
           let totalXP = myList[i].totalXP
          let rank = top10.sort((a, b) => {
            return b.totalXP - a.totalXP
          });
          let ranking = rank.map(x => x.totalXP).indexOf(totalXP) + 1
        let users;
        if(typeof message.client.users.cache.get(myList[i].user) == "undefined") {
        users = `<@${myList[i].user}>`
        } else {
        users = message.client.users.cache.get(myList[i].user).tag
        }
        embed.addFields({ name: `\u200b`,value: `**#${ranking}** <@${myList[i].user}>\n > **Level**: \`${myList[i].level}\`\n > **XP**: \`${myList[i].totalXP}\`` });
      }
      embed.setFooter({text:`Page ${currentPage} / ${Math.ceil(top10.length / 10)}`})
    }
      return message.channel.send({ embeds: [embed] });
    }

    if (args[0] == "day"  || args[0] == "day" && args[1]  <= Math.ceil(topday.length / 10) && args[1] > 0){
      if(parseFloat(args[1])  > Math.ceil(topday.length / 10)) return message.reply(`Invalid page number! There are only ${Math.ceil(topday.length / 10)} pages`)
      
      const embed = new MessageEmbed()
      .setAuthor({name:`${client.user.username}`, iconURL: `${client.user.avatarURL({dynamic: true, size: 512})}`})
      .setTitle(`${message.guild.name} Ranking`)
      .setColor("RANDOM")
      .setTimestamp()
      .setDescription(`Top 10 Leaderboard in day`);

    if(topday.length < 1) {
        embed.setDescription(`There is no user in leaderboard!`)
      }
    var state = {
      'querySet': topday,
      'page': currentPageDWM,
      'rows': 10
    }

    buildTable()

    function pagination(querySet, page, rows) {
      var trimStart = (page - 1) * rows
      var trimEnd = trimStart + rows

      var trimmedData = querySet.slice(trimStart, trimEnd)
    
      var pages = Math.ceil(querySet.length / rows)

      return{
        'querySet':trimmedData,
        'pages':pages
      }
    }
    
    function buildTable() {
      var pagesData = pagination(state.querySet, state.page, state.rows)
      var myListday = pagesData.querySet
    for(var i in myListday) {
         let dailyXP = myListday[i].dailyXP
        let rank = topday.sort((a, b) => {
          return b.dailyXP - a.dailyXP
        });
        let ranking = rank.map(x => x.dailyXP).indexOf(dailyXP) + 1
      let users;
      if(typeof message.client.users.cache.get(myListday[i].user) == "undefined") {
      users = `<@${myListday[i].user}>`
      } else {
      users = message.client.users.cache.get(myListday[i].user).tag
      }
      embed.addFields({ name: `\u200b`,value: `**#${ranking}** <@${myListday[i].user}>\n > **Level**: \`${myListday[i].level}\`\n > **XP**: \`${myListday[i].dailyXP}\`` });
    }
    embed.setFooter({text:`Page ${currentPageDWM} / ${Math.ceil(topday.length / 10)}`})
  }
    return message.channel.send({ embeds: [embed] });

    }
    else if (args[0] == "week" || args[0] == "week" && args[1]  <= Math.ceil(topweek.length / 10) && args[1] > 0){
      if(parseFloat(args[1])  > Math.ceil(topweek.length / 10)) return message.reply(`Invalid page number! There are only ${Math.ceil(topweek.length / 10)} pages`)
      const embed = new MessageEmbed()
      .setAuthor({name:`${client.user.username}`, iconURL: `${client.user.avatarURL({dynamic: true, size: 512})}`})
      .setTitle(`${message.guild.name} Ranking`)
      .setColor("RANDOM")
      .setTimestamp()
      .setDescription(`Top 10 Leaderboard in week`);

    if(topweek.length < 1) {
        embed.setDescription(`There is no user in leaderboard!`)
      }
    var state = {
      'querySet': topweek,
      'page': currentPageDWM,
      'rows': 10
    }

    buildTable()

    function pagination(querySet, page, rows) {
      var trimStart = (page - 1) * rows
      var trimEnd = trimStart + rows

      var trimmedData = querySet.slice(trimStart, trimEnd)
    
      var pages = Math.ceil(querySet.length / rows)

      return{
        'querySet':trimmedData,
        'pages':pages
      }
    }
    
    function buildTable() {
      var pagesData = pagination(state.querySet, state.page, state.rows)
      var myListweek = pagesData.querySet
    for(var i in myListweek) {
         let weeklyXP = myListweek[i].weeklyXP
        let rank = topweek.sort((a, b) => {
          return b.weeklyXP - a.weeklyXP
        });
        let ranking = rank.map(x => x.weeklyXP).indexOf(weeklyXP) + 1
      let users;
      if(typeof message.client.users.cache.get(myListweek[i].user) == "undefined") {
      users = `<@${myListweek[i].user}>`
      } else {
      users = message.client.users.cache.get(myListweek[i].user).tag
      }
      embed.addFields({ name: `\u200b`,value: `**#${ranking}** <@${myListweek[i].user}>\n > **Level**: \`${myListweek[i].level}\`\n > **XP**: \`${myListweek[i].weeklyXP}\`` });
    }
    embed.setFooter({text:`Page ${currentPageDWM} / ${Math.ceil(topweek.length / 10)}`})
  }
    return message.channel.send({ embeds: [embed] });

    }
    else if (args[0] == "month" || args[0] == "month" && args[1]  <= Math.ceil(topmonth.length / 10) && args[1] > 0){
      if(parseFloat(args[1])  > Math.ceil(topmonth.length / 10)) return message.reply(`Invalid page number! There are only ${Math.ceil(topmonth.length / 10)} pages`)
      const embed = new MessageEmbed()
      .setAuthor({name:`${client.user.username}`, iconURL: `${client.user.avatarURL({dynamic: true, size: 512})}`})
      .setTitle(`${message.guild.name} Ranking`)
      .setColor("RANDOM")
      .setTimestamp()
      .setDescription(`Top 10 Leaderboard in month`);

    if(topmonth.length < 1) {
        embed.setDescription(`There is no user in leaderboard!`)
      }
    var state = {
      'querySet': topmonth,
      'page': currentPageDWM,
      'rows': 10
    }

    buildTable()

    function pagination(querySet, page, rows) {
      var trimStart = (page - 1) * rows
      var trimEnd = trimStart + rows

      var trimmedData = querySet.slice(trimStart, trimEnd)
    
      var pages = Math.ceil(querySet.length / rows)

      return{
        'querySet':trimmedData,
        'pages':pages
      }
    }
    
    function buildTable() {
      var pagesData = pagination(state.querySet, state.page, state.rows)
      var myListmonth = pagesData.querySet
    for(var i in myListmonth) {
         let monthlyXP = myListmonth[i].monthlyXP
        let rank = topmonth.sort((a, b) => {
          return b.monthlyXP - a.monthlyXP
        });
        let ranking = rank.map(x => x.monthlyXP).indexOf(monthlyXP) + 1
      let users;
      if(typeof message.client.users.cache.get(myListmonth[i].user) == "undefined") {
      users = `<@${myListmonth[i].user}>`
      } else {
      users = message.client.users.cache.get(myListmonth[i].user).tag
      }
      embed.addFields({ name: `\u200b`,value: `**#${ranking}** <@${myListmonth[i].user}>\n > **Level**: \`${myListmonth[i].level}\`\n > **XP**: \`${myListmonth[i].monthlyXP}\`` });
    }
    embed.setFooter({text:`Page ${currentPageDWM} / ${Math.ceil(topmonth.length / 10)}`})
  }
    return message.channel.send({ embeds: [embed] });
    }
    }
}