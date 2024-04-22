import { getNumberbyName } from './Utils.js';
import { processCommand } from './command_process.js';
import terminalImage from 'terminal-image';
import whtswebjs from 'whatsapp-web.js'; 
import fs from 'node:fs';
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
    return [message,mention];
}


function processContent(message){
//Format <Content Type::Content|COntent Path(default path:media/)>
    const msg = message.match(/<[^>]*>/g);
    let options = {};
        if(msg === null|| msg.length !== 1){
        return undefined;
    }
    let content = msg[0];
    try{
        
        content = JSON.parse(content.slice(1,-1).replaceAll("'",'"'));
    }catch(e){
        console.log(e);
        return undefined;
    }
    let output;
    let path;
    switch(Object.keys(content)[0]){//Type requires to be on first key
        case "media":
            //process path
            path = content["media"];
            if(path.at(0) != '/'){
                path = process.cwd()+'/media/' + content["media"];
            }
            output = MessageMedia.fromFilePath(path);
            options.caption = message.replace(msg,"");
            break;
        case "stick":
            //process path
            path = content["stick"];
            let author;
            let name;
            if(path.at(0) != '/'){
                path = process.cwd() +'/sticker/' + content["stick"];
            }
            if(path.endsWith('.json')){
                const sticker = JSON.parse(fs.readFileSync(path));
                author = sticker["author"]||"smarttommyau";
                name = sticker["name"]||"Whatsapp Automation";
                path = sticker["path"].replace("<cwd>",process.cwd());//require full path
            }else{
                author = content["author"]||"smarttommyau";
                name = content["name"]||"Whatsapp Automation";
            }
            if(!fs.existsSync(path)){
                return undefined;
            }
            output = MessageMedia.fromFilePath(path);
            options.stickerAuthor = author;
            options.stickerName = name;
            options.sendMediaAsSticker = true;
            break;
        // case "poll":
        // case "Poll":

            break;
        default:
            break;
    }
    if(!output){
        return undefined;
    }

    return [output,options];
}

export async function processMessage(client,chat,message){
    const temp = await processMention(client,chat,message);
    let options = {};
    let msg = message;
    if(temp !== undefined){
        msg = temp.at(0);
        options.mentions = temp.at(1);
    }    
    const content = processContent(msg);
    if(content){
        msg = content.at(0);
        options = content.at(1);
    }
    return [msg,options];
}

export async function sendMessageWithContent(client,chat,message){//support for mention
    //TODO: allow send message with Content
    const [msg,options] = await processMessage(client,chat,message);
    await chat.sendMessage(msg,options);
    return;
}


export async function previewMessage(msg,options){
    if(msg instanceof MessageMedia){
        let image;
        if(msg.mimetype.includes('gif')){
            image = await terminalImage.gifbuffer(Buffer.from(msg.data,'base64'),{height: '30%'})
        }else if(msg.mimetype.includes('/png') || msg.mimetype.includes('jpg')){
            image = await terminalImage.buffer(Buffer.from(msg.data,'base64'),{height: '30%'})
        }else{
            image = await terminalImage.buffer(await sharp(Buffer.from(msg.data,'base64')).png().toBuffer(),{height: '30%'});
        }
        console.log(image)
    }else{
        console.log(msg);
    }
    console.log(options);
    return;
}
