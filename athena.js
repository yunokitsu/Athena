  }
  if (args[0] < 1 || args[0] > 5) {
    message.channel.send("First field number needs to be a 1, 2, 3, 4, or 5 to indicate Finals day\n");
    return;
  }

  var finalsMessage = "Finals Day " + args[0] + " has started!\nFighting: " + args[1] + "\nMinimum Contribution: " + args[2] + "m\nGood Luck!\n";
  bot.guilds.get(auth.server_id).defaultChannel.send(finalsMessage);
}


/**************************
 * Beginning of getSkills function
 * Splits message into args and checks if a valid character name
 * is in the cache.
 * Otherwise, call findPage function.
**************************/
function getSkills(message) {
  var args = message.content.split(" ").slice(1);
  if (args.length < 1) {
    message.channel.send("Enter a character name");
    return;
  }
  var search = "";
  if (args.length > 1) {
    var i;
    for (i = 0; i < args.length-1; i++) {
      search += args[i] + " ";
    }
    search += args[args.length-1];
  }
  else {
    search += args[0];
  }
  if (skillsCache.hasOwnProperty(search.toLowerCase())) {
    var embed = skillsCache[search.toLowerCase()];
    message.channel.send({embed});
  }
  else {
    searchWiki(message, search, "skill");
  }
}

/**************************
 * parseSkills is called when a valid gbf.wiki page is found.
 * Calls on PythonShell to run the webscraping script in scraper.py.
 * If there is an error, the page was not the correct one.
 * On success, calls skillsFormatMessage, passing in the webscraped data.
 * The Rich Embed is cached and the message is sent to the channel.
**************************/
function parseSkills(msg, page, search) {
  var url = page;
  var pyshell = new PythonShell('scraper.py', {
    mode: 'text',
    pythonPath: 'python3'
  });
  var output = '';
  pyshell.stdout.on('data', function (data) {
    output += ''+data;
  });
  pyshell.send(url).end(function(err){
    if (err) {
      console.log(err);
      console.log("Invalid skills page");
      msg.channel.send("I found no skills in <" + url + ">");
    } else{
      var embed = skillsFormatMessage(output);
      skillsCache[search.toLowerCase()] = embed;
      msg.channel.send({embed});
      console.log("parseSkills success");
      //console.log(outputTest.length);
    }

  });
}

// Returns a Rich Embed using the webscraped skills data
function skillsFormatMessage(output) {
  var embed = new Discord.RichEmbed()
    .setAuthor("Athena","https://gamewith.akamaized.net/img/c1be44cad5b2098102848a294dcfa4f1.jpg")
    .setColor("#c7f1f5");
  var outputTest = output.split(/\r?\n/);
  embed.setTitle(outputTest[0])
    .setURL(outputTest[1])
    .setThumbnail("https://i.imgur.com/ueSiofI.png");
  var skillNum = (outputTest.length - 3)/4;
  console.log("Skill Num: " + skillNum);
  var i;
  for (i = 0; i < skillNum; i++) {
    var index = (i * 4) + 2;
    var skillDesc = outputTest[index+1] + "\n" + outputTest[index+2] + "\n" + outputTest[index+3];
    if (skillDesc.length > skillsCharLimit) {
      embed.addField(outputTest[index], "Skill Description exceeds character limit. Click on gbf.wiki page link to view it.");
    } else {
      embed.addField(outputTest[index], skillDesc);
    }
  }
  return embed;
}

// Clears the skills cache after X amount of hours.
function clearCache() {
  skillsCache = {};
  console.log("cache cleared");
}

function clearSupportCache() {
  supportSkillsCache = {};
  console.log("support cache cleared");
}

function getSupportSkills(message) {
  var args = message.content.split(" ").slice(1);
  if (args.length < 1) {
    message.channel.send("Enter a character name");
    return;
  }
  var search = "";
  if (args.length > 1) {
    var i;
    for (i = 0; i < args.length-1; i++) {
      search += args[i] + " ";
    }
    search += args[args.length-1];
  }
  else {
    search += args[0];
  }
  if (supportSkillsCache.hasOwnProperty(search.toLowerCase())) {
    var embed = supportSkillsCache[search.toLowerCase()];
    message.channel.send({embed});
  }
  else {
    searchWiki(message, search, "support");
  }
}

function parseSupportSkills(msg, page, search) {
  var url = page;
  var pyshell = new PythonShell('supportscraper.py', {
    mode: 'text',
    pythonPath: 'python3'
  });
  var output = '';
  pyshell.stdout.on('data', function (data) {
    output += ''+data;
  });
  pyshell.send(url).end(function(err){
    if (err) {
      console.log(err);
      console.log("Invalid skills page");
      msg.channel.send("I found no support skills in <" + url + ">");
    } else{
      var embed = skillsSupportFormatMessage(output);
      supportSkillsCache[search.toLowerCase()] = embed;
      msg.channel.send({embed});
      console.log("parseSupportSkills success");
      //console.log(outputTest.length);
    }

  });
}

// Returns a Rich Embed using the webscraped skills data
function skillsSupportFormatMessage(output) {
  //console.log(output);
  var embed = new Discord.RichEmbed()
    .setAuthor("Athena","https://gamewith.akamaized.net/img/c1be44cad5b2098102848a294dcfa4f1.jpg")
    .setColor("#c7f1f5");
  var outputTest = output.split(/\r?\n/);
  //console.log("outputTest length is : " + outputTest.length);
  //console.log(outputTest)
  embed.setTitle(outputTest[0])
    .setURL(outputTest[1])
    .setThumbnail("https://i.imgur.com/ueSiofI.png");
  var skillNum = (outputTest.length - 3)/3;
  //console.log("Skill Num: " + skillNum);
  var i;
  for (i = 0; i < skillNum; i++) {
    var index = (i * 3) + 2;
    var skillDesc = outputTest[index+1] + "\n" + outputTest[index+2] + "\n";
    if (skillDesc.length > skillsCharLimit) {
      embed.addField(outputTest[index], "Skill Description exceeds character limit. Click on gbf.wiki page link to view it.");
    } else {
      embed.addField(outputTest[index], skillDesc);
    }
  }
  return embed;
}

/**************************
 * choose function picks a random argument from a message split with ;
 * Last argument doesn't need a semicolon
**************************/
function choose(message) {
  var args = message.content.slice(8).split(";");
  var validChoices = [];
  for (var i = 0; i < args.length; i++) {
    if (args[i].length > 0) {
      validChoices.push(args[i]);
    }
  }
  if (validChoices.length <= 1) {
    message.channel.send("I only see one option to choose from...");
    return;
  }
  var answer = validChoices[Math.floor(Math.random() * validChoices.length)];
  var embed = new Discord.RichEmbed()
    .setAuthor("Athena","https://gamewith.akamaized.net/img/c1be44cad5b2098102848a294dcfa4f1.jpg")
    .setColor("#c7f1f5")
    .setDescription(answer);
  message.channel.send({embed});
}

// ask function returns a random predetermined answer as a Rich Embed
function ask(message) {
  var args = message.content.slice(5);
  if (args.length > 256) {
    message.channel.send("That question is too long");
    return;
  }
  var embed = new Discord.RichEmbed()
    .setAuthor("Athena","https://gamewith.akamaized.net/img/c1be44cad5b2098102848a294dcfa4f1.jpg")
    .setTitle(":question:**Question**")
    .setColor("#c7f1f5")
    .setDescription(args)
    .addField(":pencil:**Answer**",askCache[Math.floor(Math.random() * askCache.length)]);
  message.channel.send({embed});
}

/**************************
 * Formats a help message in a Rich Embed and sends it to the author as a PM.
 * Help Message can be expanded with .addField method.
**************************/
function helpMessageFormat(message) {
  var embed= new Discord.RichEmbed()
    .setAuthor("Athena", "https://gamewith.akamaized.net/img/c1be44cad5b2098102848a294dcfa4f1.jpg")
    .setTitle("Help Section")
    .setColor("#c7f1f5")
    .setDescription("Dong-A-Long-A-Long! It\'s Athena, here to help you with anything! Here are my commands!")
    .setThumbnail("https://i.imgur.com/F1ZxMRW.png")
    .addField("[[search term(s)]]", "I\'ll try to find a wiki page for whatever you search")
    .addField("!skills <character name>", "I\'ll look up the skills for that character")
    .addField("!supports <character name>", "I\'ll look up the supports for that character")
    .addField("!ask <question>", "Ask me any question!")
    .addField("!choose <item 1>;<item 2>;...", "I\'ll randomly pick one!")
    .addField("!draw <1 or 10>", "Do a simulated 1/10 gacha pull")
    .addField("!gwprelims <number>", "[OFFICER CHANNEL ONLY]\n I\'ll tell everyone the minimum contribution!")
    .addField("!gwfinals <number> <yes/no> <number>", "[OFFICER CHANNEL ONLY]\nFirst: number 1-5 for Finals Day #\nSecond: yes or no to fighting\nThird: number of minimum honors")
  message.author.send({embed});
}

/**************************
 * gachaPull function
 * Args: 1 or 10
 * Simulates a ten draw or single pull using gacha.js.
**************************/
function draw(message) {
  var args = message.content.split(" ").slice(1);
  if (args.length < 1) {
    message.channel.send("Please enter 1 or 10 after the command.");
    return;
  }
  var drawType = Number(args[0]);
  if (isNaN(drawType)) {
    message.channel.send("You need to enter a 1 or 10 for the type of gacha pulls.");
    return;
  }
  if (drawType == 1 || drawType == 10) {
    var drawResult = gacha.Gacha(drawType);
    var embed = new Discord.RichEmbed()
      .setAuthor("Athena", "https://gamewith.akamaized.net/img/c1be44cad5b2098102848a294dcfa4f1.jpg")
      .setTitle("Gacha Results")
      .setColor("#c7f1f5")
      .setThumbnail("https://i.imgur.com/IQwyQUC.png")
      .setDescription(drawResult);

    //console.log("Draw result for Type: " + drawType + " is\n" + drawResult);
    message.channel.send({embed});
  }
}


bot.on('ready', () => {
  console.log('Dong-A-Long-A-Long! It\'s Athena!');
});
