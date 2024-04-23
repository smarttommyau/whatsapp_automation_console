import { command } from '../command_process.js';
import { printLocation, generateMessageJson } from '../Utils.js';
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
            client.off('message_edit', this.client_logger_edit);
            client.off('message_delete_everyone',this.client_loggger_delete_everyone);
            client.off('message_delete_me',this.client_logger_delete_me);

            this.state = false;
        }
        return [[],argv];
    }
    async Clogger_enable(client,argv){
        if(!this.state){
            client.on('message_create', this.listenfunc);
            client.on('message_edit', this.client_logger_edit);
            client.on('message_delete_everyone',this.client_loggger_delete_everyone);
            client.on('message_delete_me',this.client_logger_delete_me);
            this.state = true;
        }
        return [[],argv];
    }
    async client_logger_delete_me(msg){
        const id = msg.id.id;
        const contact = await msg.getContact();
        const chat    = await msg.getChat();
        let path = ""
        if(!msg.broadcast){
            path = process.cwd() + "/logs/" + chat.name + "/";
        }else{
            path = process.cwd() + "/logs/broadcasts/" +contact.name + "/";
        }
        if(msg.isStatus){
            path += "status/";
        }
        if(!fs.existsSync(path)){
            return;
        }
        let jsonin = JSON.parse(fs.readFileSync(path + "logs.json").toString());
        let message = jsonin.findIndex((element) => {
            return element.id == id;
        });
        if(message){
            //pop message
            if(message['media']){
                fs.unlinkSync(path + message['media']['filename']);
            }
            jsonin.splice(message,1);
            fs.writeFileSync(path + "logs.json",JSON.stringify(jsonin));
        }
        return;
    }
    async client_loggger_delete_everyone(msg,omsg){
        const id = msg.id.id;
        const contact = await msg.getContact();
        const chat    = await msg.getChat();
        let path = ""
        if(!msg.broadcast){
            path = process.cwd() + "/logs/" + chat.name + "/";
        }else{
            path = process.cwd() + "/logs/broadcasts/" +contact.name + "/";
        }
        if(msg.isStatus){
            path += "status/";
        }
        if(!fs.existsSync(path)){
            return;
        }
        let jsonin = JSON.parse(fs.readFileSync(path + "logs.json").toString());
        let message = jsonin.find((element) => {
            return element.id == id;
        });
        if(message){
            message['Deleted'] = {
                "Time":new Date(msg.timestamp*1000).toLocaleString(),
            };
            fs.writeFileSync(path + "logs.json",JSON.stringify(jsonin));
        }
        return;
    }
    async client_logger_edit(msg,b1,b2){
        const id = msg.id.id;
        const contact = await msg.getContact();
        const chat    = await msg.getChat();
        let path = ""
        if(!msg.broadcast){
            path = process.cwd() + "/logs/" + chat.name + "/";
        }else{
            path = process.cwd() + "/logs/broadcasts/" +contact.name + "/";
        }
        if(msg.isStatus){
            path += "status/";
        }
        if(!fs.existsSync(path)){
            fs.mkdirSync(path,{
                recursive:true
            });
        }
        //find id in log
        // Found append EDITED MESSAGE: to the section
        // NOT Found append new section
        let jsonin = JSON.parse(fs.readFileSync(path + "logs.json").toString());
        let message = jsonin.find((element) => {
            return element.id == id;
        });
        if(message){
            if(!message['Edited']){
                message['Edited'] = [];
            }
            message['Edited'].push({
                "Time":new Date(msg.timestamp*1000).toLocaleString(),
                "Body":msg.body
            });    
        }else{
            message = generateMessageJson(msg,contact,chat,path);
            jsonin.push(message);
        }
        fs.writeFileSync(path + "logs.json",JSON.stringify(jsonin));
    }
    async client_logger(msg){
        //TODO: support more types of messages
        const contact = await msg.getContact();
        const chat    = await msg.getChat();
        let path = ""
        if(!msg.broadcast){
            path = process.cwd() + "/logs/" + chat.name + "/";
        }else{
            path = process.cwd() + "/logs/broadcasts/" +contact.name + "/";
        }
        if(msg.isStatus){
            path += "status/";
        }
        if(!fs.existsSync(path)){
            fs.mkdirSync(path,{
                recursive:true
            });
        }
        let jsonin;
        const jsonout = generateMessageJson(msg,contact,chat,path);
        //Append to jsonin
        if(!fs.existsSync(path + "logs.json")){
            jsonin = [];
        }else{
            jsonin = JSON.parse(fs.readFileSync(path + "logs.json").toString())
        }
        jsonin.push(jsonout);
        fs.writeFileSync(path + "logs.json",JSON.stringify(jsonin));
    }

}