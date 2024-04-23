import { command } from '../command_process.js';
import { printLocation } from '../Utils.js';
import fs from 'node:fs';
import {Buffer} from 'node:buffer';
import mimepkg from 'mime-types';
const mime = mimepkg;
import whtswebjspkg from 'whatsapp-web.js';
const { MessageTypes } = whtswebjspkg;
export class logger {
    constructor(){
        this.state = false;
        this.listenfunc = this.client_logger;
    }
    loggerCommand(){
        const key = ['logger','l'];
        const description = 'Enable/Disable logger';
        const prompt = '';
        const func = this.Clogger.bind(this);
        return new command(key,func,description,prompt,false,"enable|disable?",true);
    }
    async Clogger(client,argv){
    if(!argv.at(-1)){
            return [
                [
                    new command(['on','enable'],
                    this.Clogger_enable.bind(this),
                    'Enable logger',"",false,
                    "logger enable|disable",
                    true),
                    new command(['off','disable'],
                    this.Clogger_disable.bind(this),
                    'Disable logger',"",false,
                    "logger enable|disable",
                    true)
                ],
                argv
            ]
    }else{
        console.log("Logger Status: " + (this.state?"Enabled":"Disabled"));
        return [[],argv];
    }
    }
    async Clogger_disable(client,argv){
        if(this.state){
            client.off('message_create',this.listenfunc);
            this.state = false;
        }
        return [[],argv];
    }
    async Clogger_enable(client,argv){
        if(!this.state){
            client.on('message_create', this.listenfunc);
            this.state = true;
        }
        return [[],argv];
    }
    async client_logger(msg){
        //TODO: support more types of messages
        let buffer = "<" + '-'.repeat(20) + ">\n";
        const contact = await msg.getContact();
        const chat    = await msg.getChat();
        const isbroadcast = msg.broadcast;
        const chatName = chat.name;
        let path = ""
        if(!isbroadcast){
            path = process.cwd() + "/logs/" + chatName + "/";
        }else{
            path = process.cwd() + "/logs/broadcasts/" +contact.name + "/";
        }
        if(!fs.existsSync(path)){
            fs.mkdirSync(path,{
                recursive:true
            });
        }
        const isMedia = msg.hasMedia; 
        buffer += "ID: " + msg.id.id + "\n";
        const from = (contact.name || contact.pushname) +"@"+contact.number;
        buffer += "From: " + from + "\n";
        buffer += "Time: " + new Date(msg.timestamp*1000).toLocaleString() + "\n";
        if(msg.hasQuotedMsg){
            const quotedMsg = await msg.getQuotedMessage();
            buffer += `${quotedMsg.id.id}` + ">>";
            if(quotedMsg.hasMedia){
                buffer += "media message<<" + "\n";
            }else{
                buffer += quotedMsg.body.substring(0,10) + "<<\n";
            }
        }
        if(isMedia){
            const media = await msg.downloadMedia();
            buffer += ">Media message<" + "\n";
            //save media
            let filename = "";
            if(msg.type == MessageTypes.STICKER){
               filename += "sticker_";
            }
            if(media.filename){
                filename += msg.id.id + "_" + media.filename;
            }else{
                filename += msg.id.id + "." + mime.extension(media.mimetype);
            }
            fs.writeFileSync(path + filename,Buffer.from(media.data,'base64'));
            buffer += "Saved as: " + filename + "\n";
        }else{
            buffer += msg.body;
        }
        if(msg.location){
            buffer += printLocation(msg.location);
        }
        if(msg.vCards.length){
            buffer += "vCards:\n";
            msg.vCards.forEach(vCard => {
                buffer += vCard + "\n";
            });
        }
        if(msg.fowardingScore >0){
            buffer += "Ff";
        }
        buffer += "\n";
        fs.appendFileSync(path + "log.txt",buffer);
    }

}