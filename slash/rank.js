const { createCanvas, loadImage } = require("canvas");
const { MessageAttachment } = require("discord.js");
const SQLite = require("better-sqlite3");
const sql = new SQLite("./mainDB.sqlite");
const { join } = require("path");

const {
    SlashCommandBuilder,
} = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rank")
        .setDescription("Check user's rank and xp")
        .addUserOption((option) =>
            option.setName("user").setDescription("The user's rank card")
        ),
    async execute(interaction) {

        const top10 = sql
            .prepare("SELECT * FROM levels WHERE guild = ? ORDER BY totalXP")
            .all(interaction.guild.id);
        const topday = sql
            .prepare("SELECT * FROM levels WHERE guild = ? ORDER BY dailyXP")
            .all(interaction.guild.id);
        const topweek = sql
            .prepare("Select * FROM levels WHERE guild = ? ORDER BY weeklyXP")
            .all(interaction.guild.id);

        if(interaction.options.getMember('user') !=null){
            const user2= interaction.options.getMember('user');
            const getScore = sql.prepare("SELECT * FROM levels WHERE user = ? AND guild = ?");
    
            let score = getScore.get(user2.user.id, interaction.guild.id);
            if (!score) {
                return interaction.reply({ content: `This user does not have an xp yet!`, ephemeral: true });
            }
    
            let card = sql.prepare("SELECT * FROM rankCardTable WHERE user = ? AND guild = ?");
            if (!card.get(user2.user.id, interaction.guild.id)) {
                sql
                    .prepare(
                        "INSERT OR REPLACE INTO rankCardTable (id, user, guild, textColor, barColor, backgroundColor) VALUES (?, ?, ?, ?, ?, ?);"
                    )
                    .run(
                        `${user2.user.id}-${interaction.guild.id}`,
                        user2.user.id,
                        interaction.guild.id,
                        "#beb1b1",
                        "#838383",
                        "#36393f"
                    );
            }
    
            let rankCard = card.get(user2.user.id, interaction.guild.id);
    
            const levelInfo = score.level
            const nextXP = levelInfo * 2 * 250 + 250
            const xpInfo = score.xp;
            const totalXP = score.totalXP
            const dailyXP = score.dailyXP
            const weeklyXP = score.weeklyXP
            const monthlyXP = score.monthlyXP
    
            let rank = top10.sort((a, b) => {
                return b.totalXP - a.totalXP
            });
    
            let rankday = topday.sort((a, b) => {
                return b.dailyXP - a.dailyXP
            });
    
            let rankweek = topweek.sort((a, b) => {
                return b.weeklyXP - a.weeklyXP
            });
    
            let ranking = rank.map(x => x.totalXP).indexOf(totalXP) + 1
            let rankingDay = rankday.map(x => x.dailyXP).indexOf(dailyXP) + 1
            let rankingWeekly = rankweek.map(x => x.weeklyXP).indexOf(weeklyXP) + 1
    
            const canvas = createCanvas(1000, 333)
            const ctx = canvas.getContext("2d");
            const background = await loadImage(join(__dirname, "..", "img", "download.png"));
            ctx.fillStyle = rankCard.backgroundColor
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#A3A3A3"
            ctx.globalAlpha = 1;
            ctx.fillStyle = "#000000"
            ctx.fillRect(0, 322, 715, 10);
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.strokeRect(0, 322, 715, 10);
            ctx.stroke();
    
            ctx.fillStyle = rankCard.barColor;
            ctx.globalAlpha = 1;
            ctx.fillRect(0, 322, ((100 / (score.level * 2 * 250 + 250)) * score.xp) * 7.5, 65);
            ctx.fill();
            ctx.globalAlpha = 1;
    
            ctx.font = '25px sans-serif';
            ctx.textAlign = "center";
            ctx.fillStyle = rankCard.textColor;
            ctx.fillText("XP", 860, 220);
            ctx.font = '25px sans-serif';
            ctx.fillText(`${xpInfo} / ${nextXP}`, 860, 275);
    
    
            ctx.font = '45px sans-serif';
            ctx.textAlign = "left";
            ctx.fillText(user2.user.tag, 340, 105);
    
            ctx.font = '25px sans-serif';
            ctx.fillText("LEVEL", 840, 67);
            ctx.font = '30px sans-serif';
            ctx.fillText(levelInfo, 860, 115);
    
            ctx.font = '25px sans-serif';
            ctx.fillStyle = rankCard.textColor;
            ctx.fillText("SERVER\n RANK", 340, 180);
            ctx.font = '35px sans-serif';
            ctx.fillText(`#` + ranking, 350, 265);
    
            ctx.font = '25px sans-serif';
            ctx.fillText("DAILY\n  XP", 480, 180);
            ctx.font = '35px sans-serif';
            ctx.fillText(`#` + rankingDay, 485, 265);
    
            ctx.font = '25px sans-serif';
            ctx.fillText("WEEKLY\n  XP", 610, 180);
            ctx.font = '35px sans-serif';
            ctx.fillText(`#` + rankingWeekly, 615, 265);
    
            ctx.arc(170, 160, 120, 0, Math.PI * 2, true);
            ctx.lineWidth = 6;
            ctx.strokeStyle = "WHITE"
            ctx.stroke();
            ctx.closePath();
            ctx.clip();
            const avatar = await loadImage(user2.displayAvatarURL({ format: "jpg" }));
            ctx.drawImage(avatar, 40, 40, 250, 250);
    
            const attachments = new MessageAttachment(canvas.toBuffer(), "rank.png");
            interaction.reply({ files: [attachments] });
        }
        else{
        const getScore = sql.prepare("SELECT * FROM levels WHERE user = ? AND guild = ?");
        const setScore = sql.prepare(
            "INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP, dailyXP, weeklyXP, monthlyXP) VALUES (@id, @user, @guild, @xp, @level, @totalXP, @dailyXP, @weeklyXP, @monthlyXP);"
        );

        let score = getScore.get(interaction.user.id, interaction.guild.id);
        if (!score) {
            return interaction.reply({ content: `This user does not have an xp yet!`, ephemeral: true });
        }

        let card = sql.prepare("SELECT * FROM rankCardTable WHERE user = ? AND guild = ?");
        if (!card.get(interaction.user.id, interaction.guild.id)) {
            sql
                .prepare(
                    "INSERT OR REPLACE INTO rankCardTable (id, user, guild, textColor, barColor, backgroundColor) VALUES (?, ?, ?, ?, ?, ?);"
                )
                .run(
                    `${user.id}-${interaction.guild.id}`,
                    interaction.user.id,
                    interaction.guild.id,
                    "#beb1b1",
                    "#838383",
                    "#36393f"
                );
        }

        let rankCard = card.get(interaction.user.id, interaction.guild.id);

        const levelInfo = score.level
        const nextXP = levelInfo * 2 * 250 + 250
        const xpInfo = score.xp;
        const totalXP = score.totalXP
        const dailyXP = score.dailyXP
        const weeklyXP = score.weeklyXP
        const monthlyXP = score.monthlyXP

        let rank = top10.sort((a, b) => {
            return b.totalXP - a.totalXP
        });

        let rankday = topday.sort((a, b) => {
            return b.dailyXP - a.dailyXP
        });

        let rankweek = topweek.sort((a, b) => {
            return b.weeklyXP - a.weeklyXP
        });

        let ranking = rank.map(x => x.totalXP).indexOf(totalXP) + 1
        let rankingDay = rankday.map(x => x.dailyXP).indexOf(dailyXP) + 1
        let rankingWeekly = rankweek.map(x => x.weeklyXP).indexOf(weeklyXP) + 1

        const canvas = createCanvas(1000, 333)
        const ctx = canvas.getContext("2d");
        const background = await loadImage(join(__dirname, "..", "img", "download.png"));
        ctx.fillStyle = rankCard.backgroundColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);


        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#A3A3A3"
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#000000"
        ctx.fillRect(0, 322, 715, 10);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeRect(0, 322, 715, 10);
        ctx.stroke();

        ctx.fillStyle = rankCard.barColor;
        ctx.globalAlpha = 1;
        ctx.fillRect(0, 322, ((100 / (score.level * 2 * 250 + 250)) * score.xp) * 7.5, 65);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.font = '25px sans-serif';
        ctx.textAlign = "center";
        ctx.fillStyle = rankCard.textColor;
        ctx.fillText("XP", 860, 220);
        ctx.font = '25px sans-serif';
        ctx.fillText(`${xpInfo} / ${nextXP}`, 860, 275);


        ctx.font = '45px sans-serif';
        ctx.textAlign = "left";
        ctx.fillText(interaction.user.tag, 340, 105);

        ctx.font = '25px sans-serif';
        ctx.fillText("LEVEL", 840, 67);
        ctx.font = '30px sans-serif';
        ctx.fillText(levelInfo, 860, 115);

        ctx.font = '25px sans-serif';
        ctx.fillStyle = rankCard.textColor;
        ctx.fillText("SERVER\n RANK", 340, 180);
        ctx.font = '35px sans-serif';
        ctx.fillText(`#` + ranking, 350, 265);

        ctx.font = '25px sans-serif';
        ctx.fillText("DAILY\n  XP", 480, 180);
        ctx.font = '35px sans-serif';
        ctx.fillText(`#` + rankingDay, 485, 265);

        ctx.font = '25px sans-serif';
        ctx.fillText("WEEKLY\n  XP", 610, 180);
        ctx.font = '35px sans-serif';
        ctx.fillText(`#` + rankingWeekly, 615, 265);

        ctx.arc(170, 160, 120, 0, Math.PI * 2, true);
        ctx.lineWidth = 6;
        ctx.strokeStyle = "WHITE"
        ctx.stroke();
        ctx.closePath();
        ctx.clip();
        const avatar = await loadImage(interaction.user.displayAvatarURL({ format: "jpg" }));
        ctx.drawImage(avatar, 40, 40, 250, 250);

        const attachments = new MessageAttachment(canvas.toBuffer(), "rank.png");
        interaction.reply({ files: [attachments] });
    }
}
}
