import * as chrono from 'chrono-node';
import { sendMessageWithMention } from './Utils.js';
export class task_manager {
    constructor(client){
        this.tasks = [];
        this.client
    }
    async addTask(interval,chats,repeat,message){
        this.tasks.push(new tasks(interval,chats,repeat,message,this.client));
    }
    resumeTask(index){
        if(index >= this.tasks.length || index < 0){
            console.log('Invalid task id');
            return;
        }
        if(this.tasks[index].paused){
            this.tasks[index].start();
        }
    }
    resumeTasks(){
        this.tasks.forEach(task => {
            if(task.paused){
                task.start();
            }
        });
    }
    pauseTask(index){
        if(index >= this.tasks.length || index < 0){
            console.log('Invalid task id');
            return;
        }
        if(!this.tasks[index].paused){
            this.tasks[index].pause();
        }
    }
    pauseTasks(){
        this.tasks.forEach(task => {
            if(!task.paused){
                task.pause();
            }
        });
    }
    removeTask(index){
        if(index >= this.tasks.length || index < 0){
            console.log('Invalid task id');
            return;
        }
        if(!this.tasks[index].paused){
            this.tasks[index].pause();
        }
        this.tasks.splice(index,1);
    }
    removeTasks(){
        this.tasks.forEach(task => {
            if(!task.paused){
                task.pause();
            }
        });
        this.tasks = [];
    }
    listTasks(){
        if(this.tasks.length === 0){
            console.log('No tasks');
            return;
        }
        this.tasks.forEach((task,i) => {
            console.log('Task id : %d',i);
            console.log('Paused  : %s',task.paused);
            console.log('Describtion: %s',task.interval.description);
            console.log("Next Run   : %s",task.interval.date);
            console.log('Chats:');
            task.chats.forEach(chat => {
                console.log(chat.name);
            });
            console.log('Repeat: %s',task.repeat);
            console.log('Message: %s',task.message);
            console.log('-'.repeat(process.stdout.columns - 2));
        });
    }


}

class tasks {
    constructor(interval,chats,repeat,message,client){
        this.paused = false;
        this.interval = interval;
        this.chats = chats;
        this.repeat = repeat;
        this.message = message;
        this.client = client;
        interval.date = chrono.parseDate(interval.description);
        this.timeout_id = setTimeout(this.scheduleTasks.bind(this),interval.date - Date.now());
        
    }
    start(){
        this.paused = false;
        this.timeout_id = setTimeout(this.scheduleTasks.bind(this),this.interval.date - Date.now());
    }
    pause(){
        clearTimeout(this.timeout_id);
        this.paused = true;
    }
    async scheduleTasks(){
        this.chats.forEach(async (chat) => {
            // await chat.sendMessage(this.message);
            await sendMessageWithMention(this.client,chat,this.message);
        });
        this.interval.date = chrono.parseDate(this.interval.description);
        if(this.repeat){
            this.timeout_id = setTimeout(this.scheduleTasks.bind(this),this.interval.date - Date.now());
        }else{
            this.paused = true;
        }
    }
}



