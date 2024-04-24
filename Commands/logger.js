import { command } from '../command_process.js';
import { printLocation, generateMessageJson, formatFrom, logpath } from '../Utils.js';
import fs from 'node:fs';
import {Buffer} from 'node:buffer';
//TODO: use database(make logs more sustainable) 
//TODO: generate md or webpage(more readable) as output
export class logger {
    constructor(){
        this.state = false;
        this.listenfunc = this.client_logger;
    }
    loggerCommand(){
        const key = ['logger','lg'];
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
            client.off('message_revoke_everyone',this.client_loggger_delete_everyone);
            client.off('message_revoke_me',this.client_logger_delete_me);

            this.state = false;
        }
        return [[],argv];
    }
    async Clogger_enable(client,argv){
        if(!this.state){
            client.on('message_create', this.listenfunc);
            client.on('message_edit', this.client_logger_edit);
            client.on('message_revoke_everyone',this.client_loggger_delete_everyone);
            client.on('message_revoke_me',this.client_logger_delete_me);
            this.state = true;
        }
        return [[],argv];
    }
    async client_logger_delete_me(msg){
        const id = msg.id.id;
        const contact = await msg.getContact();
        const chat    = await msg.getChat();
        const path    = logpath(msg,chat,contact); 
        if(!fs.existsSync(path)){
            return;
        }
        let jsonin;
        let message;
        let msgIndex;
        if(!fs.existsSync(path + "logs.json")){
            jsonin = [];
            message = undefined;
        }else{
            jsonin = JSON.parse(fs.readFileSync(path + "logs.json").toString())
            msgIndex = jsonin.findIndex((element) => {
                return element.id == id;
            });
            message = jsonin[msgIndex];
        }
        if(message){
            //Media is not deleted as it may be used in other messages
            // if(message['media']){
            //     fs.unlinkSync(path + message['media']['filename']);
            // }
            jsonin.splice(msgIndex,1);
            fs.writeFileSync(path + "logs.json",JSON.stringify(jsonin));
        }
        return;
    }
    async client_loggger_delete_everyone(msg,omsg){
        const id = msg.id.id;
        const contact = await msg.getContact();
        const chat    = await msg.getChat();
        const time = new Date(msg.timestamp*1000).toLocaleString();
        const from = formatFrom(contact);
        const path = logpath(msg,chat,contact);
        if(!fs.existsSync(path)){
            return;
        }
        let jsonin;
        let message;
        if(!fs.existsSync(path + "logs.json")){
            jsonin = [];
            message = undefined;
        }else{
            jsonin = JSON.parse(fs.readFileSync(path + "logs.json").toString())
            message = jsonin.filter((element) => {
                return element.Time == time && !element['Deleted'];
            });
            // Revoke everyone message id != original id
            // Current way to find message is by time and from
        }
        if(!message.length){
            return;
        }
        if(message.length > 1){
            const idlist = message.map((element) => {
                return element.id;
            });
            let tempmsg = [];
            while(!tempmsg.length){
                let temp = await chat.fetchMessages({limit:10});
                // console.log(temp)
                tempmsg = [...tempmsg,...temp.filter((element) => {
                        return element.timestamp === msg.timestamp;
                    })
                ];
                if(tempmsg.length<idlist.length){
                    temp =await chat.fetchMessages({limit:idlist.length-tempmsg.length});
                    tempmsg = [...tempmsg, ...temp.filter((element) => {
                            return element.timestamp === msg.timestamp;
                        })
                    ];
                }
                //find id that is not in tempmsg
                const tempidlist = tempmsg.map((element) => {
                    return element.id.id;
                });
                const missingid = idlist.filter((element) => {
                        return !tempidlist.includes(element);
                });
                message = message.find((element) => {
                    return element.id == missingid[0];
                });
            }
        }else{
            message = message[0];
        }
        message['Deleted'] = {
            "Time":new Date(msg.timestamp*1000).toLocaleString()
        };
        fs.writeFileSync(path + "logs.json",JSON.stringify(jsonin));
    
        return;
    }
    async client_logger_edit(msg,b1,b2){
        const id = msg.id.id;
        const contact = await msg.getContact();
        const chat    = await msg.getChat();
        const path    = logpath(msg,chat,contact);
        if(!fs.existsSync(path)){
            fs.mkdirSync(path,{
                recursive:true
            });
        }
        //find id in log
        // Found append EDITED MESSAGE: to the section
        // NOT Found append new section
        let jsonin;
        let message;
        if(!fs.existsSync(path + "logs.json")){
            jsonin = [];
            message = undefined;
        }else{
            jsonin = JSON.parse(fs.readFileSync(path + "logs.json").toString())
            message = jsonin.find((element) => {
                return element.id == id;
            });
        }
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
        const path    = logpath(msg,chat,contact);
        if(!fs.existsSync(path)){
            fs.mkdirSync(path,{
                recursive:true
            });
        }
        const jsonout = await generateMessageJson(msg,contact,chat,path);
        let jsonin;
        if(!fs.existsSync(path + "logs.json")){
            jsonin = [];
        }else{
            jsonin = JSON.parse(fs.readFileSync(path + "logs.json").toString())
        }
        jsonin.push(jsonout);
        fs.writeFileSync(path + "logs.json",JSON.stringify(jsonin));
    }

}