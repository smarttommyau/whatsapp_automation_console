import { getNumberbyName } from './Utils.js';
import { processCommand } from './command_process.js';
import whtswebjs from 'whatsapp-web.js'; 
const { MessageMedia } = whtswebjs;
async function processMention(client,chat,message){
    let mention = message.match(/@[^ ]*/g);
    if(mention === null){
        return undefined;
    }
    mention = mention.map(mention => mention.slice(1).trim());
    for(const i in mention){
        const n = mention[i];
        if(n.match(/^[0-9]+$/)){
            mention[i] = n + '@c.us';
        }else if(chat.isGroup&&n == "everyone"){
            let text = ""
            mention = [];
            for(participant of chat.participants){
                mention.push(`${participant.id.usre}@c.us`);
                text += `@${participant.id.user} `;
            }
            message = message.replace('@everyone',text);
            break;
        }else{
            const number = await getNumberbyName(n,client)
            if(!number){
                mention[i] = undefined;
                continue;
            }
            //repace the name with the number
            message = message.replace('@' + n,'@' + number);
            mention[i] = number + '@c.us';
        }
    }
    mention = mention.filter(mention => mention !== undefined);
    if(!mention.length){
        return undefined;
    }
    return [mention,message];
}


function processContent(message){
//Format <Content Type::Content|COntent Path(default path:media/)>
    let content = message.match(/<[^>]*>/g);
    if(content === null||content.length > 1){
        return undefined;
    }
    content = content.map(content => content.slice(1,-1).split('::'));
    let output = []
    for(const i in content){
        const c = content[i];
        switch(c){
            case "Video":
            case "video":
            case "Image":
            case "img":
            case "media":
                //process path
                if(c[1].at(0) != '/'){
                    c[1] = 'media/' + c[1];
                }
                let media = new MessageMedia.fromFilePath(c[i]);
                output.push(meida);
                break;
            // case "poll":
            // case "Poll":

                break;
            default:
                break;
        }

    }
    if(!output.length){
        return undefined;
    }
    return output;
}


export async function sendMessageWithContent(client,chat,message){//support for mention
    //TODO: allow send message with Content
    let temp = await processMention(client,chat,message);
    let options = {};
    let msg = message;
    if(temp !== undefined){
        options.mentions = temp.at(0);
        msg = temp.at(1);
    }

    
    const content = processContent(msg);
    if(content){
        options.caption = msg;
        msg = content;
    }
    await chat.sendMessage(msg,options);
    return;
}



