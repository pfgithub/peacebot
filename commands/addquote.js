const fs = require('fs');

exports.help = {
    name: "addquote",
    notes: "Add a quote to the quotes DB.\n\n<messageid> is the ID of the message you want to add. Must be in the channel where you ran the command.",
    category: "Quote of the Day",
    args: "<messageid>"
};
exports.run = (client, message, args) => {
    let content;
    if (!args[0]) {
        return message.reply("Please specify a message ID.");
    }
    let messageid = args[0];
    let found = message.channel.messages.find("id", `${messageid}`);
    if (!found) {
        return message.reply("That message wasn't found.");
    }

    if (found.content == null) content = "";

    //if (found.content.length < 1022) return message.reply("That message is too long. Please try again with a shorter message.");

    if (found.attachments.size > 0) {
        for (let [key, attachment] of found.attachments) {
            if (found.content == null) {
                content = (`${attachment.proxyURL}`);
            } else {
                content = found.content + (`\r\n\r\nAttachments: ${attachment.proxyURL}`);
            }
        }
    }
    else {
        content = found.content;
    }

    const Discord = require("discord.js");
    if (!fs.existsSync("./quotes.json")) {
        fs.writeFileSync("./quotes.json", "[]");
    }
    var json = fs.readFileSync("./quotes.json");
    var db = JSON.parse(json);
    if (db.find((value, index, obj) => {
        return value.id == messageid;
    })) {
        return message.reply("That quote is already in the database!");
    }
    db.push({
        id: messageid,
        user: found.author.id,
        content: content,
        timestamp: found.createdAt.toDateString()
    });
    json = JSON.stringify(db);
    fs.writeFileSync("./quotes.json", json);
    var embed = new Discord.RichEmbed();
    embed.setTitle(`Message by ${found.author.tag} added to quote database successfully.`);
    embed.setColor("GREEN");
    embed.setThumbnail(found.author.avatarURL);
    embed.setDescription(content);
    embed.setFooter(`Posted on ${found.createdAt.toDateString()} | Message ID: ${messageid}`);
    message.channel.send(embed);

};