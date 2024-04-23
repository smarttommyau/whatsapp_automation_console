import { command } from '../command_process.js';
import { getUnreadChat, getChatsbyPartialNames } from '../Utils.js';
export function readCommand(){
    const key = ['read','rd'];
    const description = 'Mark selected/all chat as read';
    const func = Cread;
    const runnable = true;
    return new command(key,func,description,"",false,"",runnable);
}

async function Cread(client,argv){
    const readline = argv.at(-2);
    if(argv[0] === true){
        console.log('Marked all chats as read');
        const chats = await getUnreadChat(client);
        for(const chat of chats){
            console.log(chat.name);
            await chat.sendSeen();
        }
        return [[],argv];
    }else if(argv[0]){
        let chatss = await getChatsbyPartialNames(argv[0],client);
        //filter chats
        if(chatss.length === 0||!chatss){
            console.log('Chat not found');
            return [[],argv];
        }
        chatss.forEach(async (chats) => {
            if(chats.length > 1){
                console.log('Multiple chats found:');
                chats.forEach((chats,i) => {
                    console.log("%d: %s",i,chats.name);
                });
                const q1 = () => {
                    return new Promise((resolve,reject) => {
                        readline.question('Select chat by number:', (input) => {
                            let selectedChat = chats[Number.parseInt(input)];
                            if (!selectedChat) {
                                console.log('Invalid chat number');
                                return [[],argv];
                            }
                            chats = selectedChat;
                            resolve();
                            return;
                        });
                    });
                }
                await q1();
            }else if(chats.length == 1){
                chats = chats[0];
            }            
        });
        console.log('Marked chat as read');
        chatss.forEach(async (chat) => {
            console.log(chat.name)
            await chat.sendSeen();
        });

        return [[],argv];
    }else{
        return [[
            new command([],
                Cread,"ChatNames","",
                true,
                "read <ChatNames? ...>  Mark selected/all chat as read",
                true,
                true,
                true)
        ]
        ,argv];
    }
}