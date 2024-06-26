import { getChatsbyPartialNames } from '../Utils.js';
import { sendMessageWithContent, processMessage, previewMessage } from '../Message_process.js';
import { command } from '../command_process.js';

export function sendCommand(){
    const key = ['send','s'];
    const description = '<ChatName> <Message|  Send a message to a chat';
    const prompt = 'ChatName:';
    const func = Csend;
    return new command(key,func,description,prompt);
}

async function Csend(client,argv){
    const func = Csend_ChatName;
    const prompt = 'ChatName:';
    return [[new command([],func,'',prompt,true,'send <ChatName> <Message|  Send a message to a chat')],argv];
}


async function Csend_ChatName(client,argv){
    const prompt='Message:';
    const func = Csend_Message;
    return [[new command([],func,'',prompt,true,'send <ChatName> <Message|  Send a message to a chat',true,true,true)],argv];
}

async function Csend_Message(client,argv){
    let chats = await getChatsbyPartialNames(argv[0].split(","),client);
    const readline= argv.at(-2);
    if(!chats||chats.length === 0||(chats.length === 1&& chats[0].length === 0)){
        console.log('Chat not found');
        return [[],argv];
    }
    for(const i in chats){ 
        let chat = chats[i];
        if(chat.length > 1){
            console.log(chats_str[i]);
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
                        chats[i] = selectedChat;
                        resolve();
                    });
                });
            };
            await q1();
        }else if(chat.length == 1){
            chats[i] = chat[0];
        }
    }
    console.log("To:");
    chats.forEach(chat => {
        console.log(chat.name);
    });
    let message = argv[1].join(' ');
    console.log("Message(Preview not accurate):");
    let content = await processMessage(client,chats[0],message);
    await previewMessage(content[0],content[1])
        //confirmation
    const q2 = () => {
        return new Promise((resolve,reject) => {
            readline.question('Send message? (y/n)', (input) => {
                if(input == 'y'){
                    chats.forEach(async chat => {
                        await sendMessageWithContent(client,chat,message);
                    })
                    
                    console.log('Message sent');
                }else{
                    console.log('Message not sent');
                }
                resolve();
            });
        });
    }
    await q2();
    return [[],argv];
}


