const command_process = require('../command_process');
const utils = require('../Utils');

function retrieveCommand(){
    const key = ['retrieve','ret'];
    const description = '<ChatName?>  Retrieve latest messages from chat or all unread';
    const runnable = true;
    const func = Cretrieve;
    return new command_process.command(key,func,description,"",false,"",runnable);
}

async function Cretrieve(client,argv){
    if(argv[0] === true){//print all unread messages
        unreadMessages = await utils.getUnreadMessages(await client.getChats());
        if(unreadMessages.length === 0){
            console.log('No unread messages');
            return [[],argv];
        }
        for(let message of unreadMessages){
            await utils.printMessage(message,client);
        }
        return [[],argv];
    }else if(argv[0]){
        let chat = await utils.getChatsbyPartialName(argv[0].join(' '),client);
        const readline = argv.at(-2);
        if(chat.length === 0 || chat == undefined){
            console.log('Chat not found');
            return [[],argv];
        }else if(chat.length > 1){
            console.log('Multiple chats found:');
            chat.forEach((chat,i) => {
                console.log("%d: %s",i,chat.name);
            });
            const q1 = () => {
                return new Promise((resolve,reject) => {
                    readline.question('Select chat by number:', (input) => {
                        let selectedChat = chat[Number.parseInt(input)];
                        if (!selectedChat) {
                            console.log('Invalid chat number');
                            return [[],argv];
                        }
                        chat = selectedChat;
                        resolve();
                        return;
                    });
                });
            }
            await q1();
        }else if(chat.length == 1){
            chat = chat[0];
        }
        let messages = await chat.fetchMessages({limit: 10});
        console.log('-'.repeat(process.stdout.columns - 2));
        let promises = [];
        for(let message of messages){
            promises.push(utils.printMessage(message,client));
        }
        await Promise.all(promises);
        return [[],argv];
    }else{
        return [[
            new command_process.command([],
                Cretrieve,"","",
                true,
                "retrieve <ChatName?>  Retrieve latest messages from chat or all unread",
                true,
                true,
                true)
        ]
        ,argv];
    }
}

exports.retrieveCommand = retrieveCommand;
