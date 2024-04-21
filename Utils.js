function processInput(input){
    //split by space but ignore spaces between quotes, and remove the quoting quotes
    if(!input){
        return [];
    }
    let args = input.match(/(?:[^\s"]+|"[^"]*")+/g);
    args = args.map(arg => arg.replace(/"/g,''));
    return args;
    
}


async function getChatsbyName(name,client,caseSensitive = false){
    const chats = await client.getChats();
    if(!caseSensitive){
        name = name.toLowerCase();
        let chat = chats.find(chat => chat.name.toLowerCase() == name);
        return chat;
    }
    let chat = chats.find(chat => chat.name == name);
    return chat;
}

async function getChatsbyNames(names,client,caseSensitive = false){
    const chats = await client.getChats();
    if(!caseSensitive){
        names = names.map(name => name.toLowerCase());
        let chat = chats.filter(chat => names.includes(chat.name.toLowerCase()));
        return chat;
    }
    let chat = chats.filter(chat => names.includes(chat.name));
    return chat;
}

async function getChatsbyPartialName(name,client,caseSensitive = false){
    const chats = await client.getChats();
    if(!caseSensitive){
        name = name.toLowerCase();
        return chats.filter(chat => chat.name.toLowerCase().includes(name));
    }
    return chats.filter(chat => chat.name.includes(name));
}

async function getChatsbyPartialNames(names,client,caseSensitive = false){
    const chats = await client.getChats();
    let ArrayofChat = [];
    if(!caseSensitive){
        names = names.map(name => name.toLowerCase());
        names.forEach(name => {
            ArrayofChat.push(chats.filter(chat => chat.name.toLowerCase().includes(name)));
        });
        return ArrayofChat;
    }
    names.forEach(name => {
        ArrayofChat.push(chats.filter(chat => chat.name.includes(name)));
    });
    return ArrayofChat;    
}

async function getUnreadChat(client){
    let chats = await client.getChats();
    return chats.filter(chat => chat.unreadCount > 0);
}


async function getUnreadMessages(chats){
    let unreadMessages = [];
    for(const chat of chats){
        if(chat.unreadCount === 0){
            continue;
        }
        unreadMessages = [...unreadMessages, ...await chat.fetchMessages({limit: chat.unreadCount})];
    }
    return unreadMessages;

}

async function printMessage(message,client=undefined){
    // console.log("-".repeat(process.stdout.columns - 2))
    let 
    from ="From:";
    if(client){
        contact = await client.getContactById(message.from);
        from += contact.name||contact.pushname;
    }
    if(message.author){
        if(client){
        from += "||"
        }
        from += message.author;
    }
    console.log(from);
    console.log("Date:" + new Date(message.timestamp*1000).toLocaleString());
    printMessageBody(message);
    console.log("-".repeat(process.stdout.columns - 2));
}

function printMessageBody(message){
    if(message.hasMedia){
        console.log('>Media message<');
        //TODO: Download and show the media in console
    }
    console.log(message.body);
}

async function getContactbyNumber(number,client){
    const id = await client.getNumberId(number);
    if(!id) return undefined;
    let contact = await client.getContactById(id);
    return contact;
}

async function getContactbyName(name,client){
    const contacts = await client.getContacts();
    let contact = contacts.find(contact => contact.name == name);
    if(contact.length === 0){
        return undefined;
    }
    return contact;
}

async function sendMessageWithMention(client,chat,message){//support for mention
    //catch the mention from the message from @ to space or end of string
    let mention = message.match(/@[^ ]*/g);
    if(mention === null){
        await chat.sendMessage(message);
        return;
    }
    mention = mention.map(mention => mention.slice(1));
    mention = Promise.all(mention.map(mention => getContactByName(mention,client)|| getContactByNumber(mention,client)));
    mention = mention.filter(mention => mention != undefined);
    await chat.sendMessage(message,{mentions: mention});
    return;
}

exports.processInput = processInput;
exports.getChatsbyName = getChatsbyName;
exports.getChatsbyNames = getChatsbyNames;
exports.getChatsbyPartialName = getChatsbyPartialName;
exports.getChatsbyPartialNames = getChatsbyPartialNames;
exports.getUnreadChat = getUnreadChat;
exports.printMessage = printMessage;
exports.getUnreadMessages = getUnreadMessages;
exports.sendMessageWithMention = sendMessageWithMention;
