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
    chats.forEach(async (chat) => {
        if(chat.unreadCount > 0){
            unreadMessages = [...unreadMessages, ...await chat.fetchMessages({limit: chat.unreadCount})];
        }
    });
    return unreadMessages;

}

async function printMessage(message,client=undefined){
    console.log("-".repeat(process.stdout.columns - 2))
    from ="From:";
    if(client){
        contact = await client.getContactById(message.from);
        from += contact.name||contact.pushname;
        from += "||"
    }
    if(message.author){
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


exports.getChatsbyName = getChatsbyName;
exports.getChatsbyNames = getChatsbyNames;
exports.getChatsbyPartialName = getChatsbyPartialName;
exports.getChatsbyPartialNames = getChatsbyPartialNames;
exports.getUnreadChat = getUnreadChat;
exports.printMessage = printMessage;
exports.getUnreadMessages = getUnreadMessages;
