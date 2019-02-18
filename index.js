const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const db = require('quick.db');
const useful = require('useful-tools');
client.ayar = db;

client.htmll = require('cheerio');
client.useful = useful;
client.tags = require('html-tags');

let profil = JSON.parse(fs.readFileSync('./profil.json', 'utf8'))
client.profil = profil

client.ayarlar = {
  "prefix": "!", //prefix
  "oauthSecret": "rSTcor5nW5WFBinJ7Pud5JcLyrNn08Kg", //bot secreti
	"callbackURL": "http://localhost:3000/callback", //benim sitenin urlsini kendin ile değiş "/callback" kalacak!
	"kayıt": "kanal ID", //onaylandı, reddedildi, başvuru yapıldı falan kayıtların gideceği kanalın ID'ini yazacaksın
  "renk": "RANDOM" //embedların rengini burdan alıo can sıkıntısdna yapılmış bişe falan fln
};

client.yetkililer = [] //tüm yetkililerin ıdleri gelcek array
client.webyetkililer = [] //web yetkililerin ıdleri gelcek array
client.sunucuyetkililer = [] //sunucu yetkililerin ıdleri gelcek array

client.on('ready', async () => {
   client.appInfo = await client.fetchApplication();
  setInterval( async () => {
    client.appInfo = await client.fetchApplication();
  }, 60000);
  
   require("./app.js")(client);
  
  client.user.setActivity(`${client.ayarlar.prefix}yardım | DiscordBotsTR`, { type:"WATCHING" })
  
  console.log("Aktif!")
});

setInterval(() => {

	if (db.has('botlar') && db.has('kbotlar')) {

for (var i = 0; i < Object.keys(db.fetch('kbotlar')).length; i++) {
for (var x = 0; x < Object.keys(db.fetch('botlar')).length; x++) {
var bot = Object.keys(db.fetch('botlar'))[x]
var user = Object.keys(db.fetch('kbotlar'))[i]
if (db.has(`oylar.${bot}.${user}`)) {
   setTimeout(() => {
        db.delete(`oylar.${bot}.${user}`)
    }, require('ms')(`${client.useful.seg(db.fetch(`oylar.${bot}.${user}`), 6)}h`));
}
}
}

	}

}, 10000);

client.on("guildMemberAdd", member => {
      if (member.user.bot === true) {
          member.addRole(member.guild.roles.find(r=>r.name==='Bot').id) //bot rolü
       } else {
          member.addRole(member.guild.roles.find(r=>r.name==='Kullanıcı').id) //üye rolü
       }
});

const chalk = require('chalk')

client.commands = new Discord.Collection()
client.aliases = new Discord.Collection()
fs.readdir(`./komutlar/`, (err, files) => {
	let jsfiles = files.filter(f => f.split(".").pop() === "js")

	if(jsfiles.length <= 0) {
		console.log("Olamazz! Hiç komut dosyası bulamadım!")
	} else {
		if (err) {
			console.error("Hata! Bir komutun name veya aliases kısmı yok!")
		}
		console.log(`${jsfiles.length} komut yüklenecek.`)

		jsfiles.forEach(f => {
			let props = require(`./komutlar/${f}`)
			client.commands.set(props.help.name, props)
			props.conf.aliases.forEach(alias => {
				client.aliases.set(alias, props.help.name)
			})
			console.log(`Yüklenen komut: ${props.help.name}`)
		})
	}
});

client.on("message", async message => {

	if (message.author.bot) return
	if (!message.content.startsWith('!')) return
	var command = message.content.split(' ')[0].slice('!'.length)
	var args = message.content.split(' ').slice(1)
	var cmd = ''

	if (client.commands.has(command)) {
		var cmd = client.commands.get(command)
	} else if (client.aliases.has(command)) {
		var cmd = client.commands.get(client.aliases.get(command))
	}

	if (cmd) {
    if (cmd.conf.permLevel === 'ozel') { //o komutu web yetkilileri kullanabsiln sadece diye yaptıgım bişe 
      if (client.yetkililer.includes(message.author.id) === false) {
        const embed = new Discord.RichEmbed()
					.setDescription(`Kardeşim sen WebSite yetkilisi değilsin saçma saçma işlerle uğraşma!`)
					.setColor(client.ayarlar.renk)
					.setTimestamp()
				message.channel.send({embed})
				return
      }
    }
    
		if (cmd.conf.permLevel === 1) {
			if (!message.member.hasPermission("MANAGE_MESSAGES")) {
				const embed = new Discord.RichEmbed()
					.setDescription(`Sen önce mesajları yönetmeyi öğren sonra bu komutu kullanırsın.`)
					.setColor(client.ayarlar.renk)
					.setTimestamp()
				message.channel.send({embed})
				return
			}
		}
		if (cmd.conf.permLevel === 2) {
			if (!message.member.hasPermission("KICK_MEMBERS")) {
				const embed = new Discord.RichEmbed()
					.setDescription(`Karşim üyeleri atma yetkin yok.`)
					.setColor(client.ayarlar.renk)
					.setTimestamp()
				message.channel.send({embed})
				return
			}
		}
		if (cmd.conf.permLevel === 3) {
			if (!message.member.hasPermission("ADMINISTRATOR")) {
				const embed = new Discord.RichEmbed()
					.setDescription(`Yönetici izni olmadan bu komutu kullanamazsın onu almanda zor bu komutla bir daha görüşme bence.`)
					.setColor(client.ayarlar.renk)
					.setTimestamp()
				message.channel.send({embed})
				return
			}
		}
		if (cmd.conf.permLevel === 4) {
			const x = await client.fetchApplication()
      var arr = [x.owner.id, '474239666032476200']
			if (!arr.includes(message.author.id)) {
				const embed = new Discord.RichEmbed()
					.setDescription(`Bu komutu tekrar deneme hiç çünkü sadece sahibim çalıştırabiliyor komutu büyülü komut.`)
					.setColor(client.ayarlar.renk)
					.setTimestamp()
				message.channel.send({embed})
				return
			}
		}
		if (cmd.conf.enabled === false) {
			const embed = new Discord.RichEmbed()
				.setDescription(`Kardeşim bu komut devre dışı nasıl kullanmayı bekliyorsun?!`)
				.setColor(client.ayarlar.renk)
				.setTimestamp()
			message.channel.send({embed})
			return
		}
		if(message.channel.type === "dm") {
			if (cmd.conf.guildOnly === true) {
				const embed = new Discord.RichEmbed()
					.setDescription(`Bu komutu özel mesajlarda kullanamazsın canım.`)
					.setColor(client.ayarlar.renk)
					.setTimestamp()
				message.channel.send({embed})
				return
			}
		}
		cmd.run(client, message, args)
	}
});

client.login("NTQwOTAyNDYwNzQ3Njc3NzE2.D0tNAw.u3p8wZku0LpB5i44xZkQokifCLU") //tokeni yaz işte

process.env = {}
process.env.TOKEN = "NTQwOTAyNDYwNzQ3Njc3NzE2.D0tNAw.u3p8wZku0LpB5i44xZkQokifCLU"