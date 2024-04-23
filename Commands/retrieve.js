import { command } from '../command_process.js';
import {getUnreadMessages, printMessage, getChatsbyPartialName} from '../Utils.js';

export function retrieveCommand(){
    const key = ['retrieve','ret'];
    const description = '<ChatName?>  Retrieve latest messages from chat or all unread';
    const runnable = true;
    const func = Cretrieve;
    return new command(key,func,description,"",false,"",runnable);
}

async function Cretrieve(client,argv){
    if(argv[0] === true){//print all unread messages
        const unreadMessages = await getUnreadMessages(await client.getChats());
        if(unreadMessages.length === 0){
            console.log('No unread messages');
            return [[],argv];
        }
        let promises = [];
        for(let message of unreadMessages){
            promises.push(printMessage(message,client));
        }
        const buffer = await Promise.all(promises);
        console.log('-'.repeat(process.stdout.columns - 2));
        console.log(buffer.join());
        return [[],argv];
    }else if(argv[0]){
        let chat = await getChatsbyPartialName(argv[0].join(' '),client);
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
        let messagemessage_typs = await chat.fetchMessages({limit: 10});
        let promises = [];
        for(let message of messages){
            promises.push(printMessage(message,client));
        }
        console.log('retriving result from chat:',chat.name);
        const buffer = await Promise.all(promises);
        console.log('-'.repeat(process.stdout.columns - 2));
        console.log(buffer.join());
        return [[],argv];
    }else{
        return [[
            new command([],
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


