import terminalImage from 'terminal-image';
export function processInput(input){
    //split by space but ignore spaces between quotes, and remove the quoting quotes
    if(!input){
        return [];
    }
    let args = input.match(/(?:[^\s"]+|"[^"]*")+/g);
    args = args.map(arg => arg.replaceAll('"',''));
    return args;
    
}


export async function getChatsbyName(name,client,caseSensitive = false){
    const chats = await client.getChats();
    if(!caseSensitive){
        name = name.toLowerCase();
        let chat = chats.find(chat => chat.name.toLowerCase() == name);
        return chat;
    }
    let chat = chats.find(chat => chat.name == name);
    return chat;
}

export async function getChatsbyNames(names,client,caseSensitive = false){
    const chats = await client.getChats();
    if(!caseSensitive){
        names = names.map(name => name.toLowerCase());
        let chat = chats.filter(chat => names.includes(chat.name.toLowerCase()));
        return chat;
    }
    let chat = chats.filter(chat => names.includes(chat.name));
    return chat;
}

export async function getChatsbyPartialName(name,client,caseSensitive = false){
    const chats = await client.getChats();
    if(!caseSensitive){
        name = name.toLowerCase();
        return chats.filter(chat => chat.name.toLowerCase().includes(name));
    }
    return chats.filter(chat => chat.name.includes(name));
}

export async function getChatsbyPartialNames(names,client,caseSensitive = false){
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

export async function getUnreadChat(client){
    let chats = await client.getChats();
    return chats.filter(chat => chat.unreadCount > 0);
}


export async function getUnreadMessages(chats){
    let unreadMessages = [];
    for(const chat of chats){
        if(chat.unreadCount === 0){
            continue;
        }
        unreadMessages = [...unreadMessages, ...await chat.fetchMessages({limit: chat.unreadCount})];
    }
    return unreadMessages;

}

export async function printMessage(message,client=undefined){
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
    await printMessageBody(message);
    console.log("-".repeat(process.stdout.columns - 2));
}

export async function printMessageBody(message){
    if(message.hasMedia){
        console.log('>Media message<');
        const media = message.downloadMedia();
        const image = await terminal_image.buffer(media)
        console.log(image);
    }
    console.log(message.body);
}


export async function getNumberbyName(name,client){
    const contacts = await client.getContacts();
    let contact = contacts.find(contact => contact.name == name);
    if(contact.length === 0){
        return undefined;
    }
    return contact.number;
}

export async function sendMessageWithMention(client,chat,message){//support for mention
    //catch the mention from the message from @ to space or end of string
    let mention = message.match(/@[^ ]*/g);
    if(mention === null){
        await chat.sendMessage(message);
        return;
    }
    mention = mention.map(mention => mention.slice(1));
    for(const i in mention){
        if(!Number.isNaN(mention[i])&&Number.isFinite(mention[i])){
            mention[i] = mention[i] + '@c.us';
        }else{
            const number = await getNumberbyName(mention[i],client)
            //repace the name with the number
            message = message.replace('@' + mention[i],'@' + number);
            mention[i] = number + '@c.us';
        }
    }
    mention = mention.filter(mention => mention != undefined);
    if(mention.length === 0){
        await chat.sendMessage(message);
        return;
    }
    await chat.sendMessage(message,{mentions: mention});
    return;
}










