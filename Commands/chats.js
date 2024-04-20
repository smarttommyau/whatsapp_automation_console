const command_process = require('../command_process');
util = require('../Utils');
function chatsCommand(){
    const key = ['chats','cht','chts'];
    const description = '<Search name?> List|search all chats';
    const runnable = true;
    const func = Cchats;
    return new command_process.command(key,func,description,"",false,"",runnable);
}

async function Cchats(client,argv){
    if(argv[0] === true){
        let chats = await client.getChats();
        chats.forEach((chat,i) => {
            console.log("%d: %s",i,chat.name);
        });
        return [[],argv];
    }else if(argv[0] === "-u" || argv[0] === "--unread"){
        let chats = await util.getUnreadChat(client);
        if(chats.length === 0){
            console.log('No unread chats');
            return [[],argv];
        }
        chats.forEach((chat,i) => {
            console.log("%d: %s(%d)",i,chat.name,chat.unreadcount);
        });        
        return [[],argv];
    }else if(argv[0]){
        let chats = await util.getChatsbyPartialName(argv[0],client);
        if(chats.length === 0 || chats == undefined){
            console.log('Chat not found');
            return [[],argv];
        }
        chats.forEach((chat,i) => {
            console.log("%d: %s",i,chat.name);
        });
        return [[],argv];
    }else{
        return [[
            new command_process.command([],Cchats,"","",true,"chats <Search name?> List|search all chats",true,false,true),
            new command_process.command(['-u','--unread'],Cchats,"","",true,"chats -u|--unread",true)
        ],argv];
    }
}

exports.chatsCommand = chatsCommand;