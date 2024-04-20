const util = require('../Utils');
const command_process = require('../command_process');
function sendCommand(){
    const key = ['send','s'];
    const description = '<ChatName> <Message|  Send a message to a chat';
    const prompt = 'ChatName:';
    const func = Csend;
    return new command_process.command(key,func,description,prompt);
}

async function Csend(client,argv){
    const func = Csend_ChatName;
    return [[new command_process.command([],func,'',prompt,true,'send <ChatName> <Message|  Send a message to a chat')],argv];
}


async function Csend_ChatName(client,argv){
    const prompt='Message:';
    const func = Csend_Message;
    return [[new command_process.command([],func,'',prompt,true,'send <ChatName> <Message|  Send a message to a chat',true,true)],argv];
}

async function Csend_Message(client,argv){
    let chat = await util.getChatsbyPartialName(argv[0],client);
    let readline = argv[-2];
    if(chat.length === 0 || chat == undefined){
        console.log('Chat not found');
        return [[],argv];
    }else if(chat.length > 1){
        console.log('Multiple chats found:');
        chat.forEach((chat,i) => {
            console.log("%d: %s",i,chat.name);
        });
        readline.question('Select chat by number:', (input) => {
            let selectedChat = chat[Number.parseInt(input)];
            if (!selectedChat) {
                console.log('Invalid chat number');
                return [[],argv];
            }
            chat = selectedChat;
        });
    }else if(chat.length == 1){
        chat = chat[0];
    }
    let message = argv[1];
    await chat.sendMessage(message);
    return [[],argv];
}

exports.sendCommand = sendCommand;