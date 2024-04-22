import { command } from '../command_process.js';
import { printLocation } from '../Utils.js';
import fs from 'node:fs';
import {Buffer} from 'node:buffer';
import pkg from 'mime-types';
const mime = pkg;
export class logger {
    constructor(){
        this.emitter = null;
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
        console.log("Logger Status: " + (this.emitter?"Enabled":"Disabled"));
        return [[],argv];
    }
    }
    async Clogger_disable(client,argv){
        if(this.emitter){
            this.emitter.off('message_create',this.client_logger.bind(this));
            this.emitter = null;
        }
        return [[],argv];
    }
    async Clogger_enable(client,argv){
        if(!this.emitter){
            this.emitter = client.on('message_create', this.client_logger.bind(this));
        }
        return [[],argv];
    }
    async client_logger(msg){
        let buffer = "<" + '-'.repeat(20) + ">\n";
        const contact = await msg.getContact();
        const chat    = await msg.getChat();
        const chatName = chat.name;
        const path = process.cwd() + "/logs/" + chatName + "/";
        if(!fs.existsSync(path)){
            fs.mkdirSync(path,{
                recursive:true
            });
        }
        const isMedia = msg.hasMedia; 
        buffer += "ID: " + msg.id.id + "\n";
        const from = contact.name || contact.pushname +"@"+contact.number;
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
            if(media.filename){
                filename = msg.id.id + "_" + media.filename;
            }else{
                filename = msg.id.id + "." + mime.extension(media.mimetype);
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