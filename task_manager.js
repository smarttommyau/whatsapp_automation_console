const chrono = require('chrono-node');
const {
    Worker,
    isMainThread,
    parentPort,
    workerData
} = require("worker_threads");

class task_manager {
    constructor(){
        this.tasks = [];
        this.worker = new Worker(__filename,{workerData:0});
    }
    async addTask(interval,chats,repeat,message){
        this.tasks.push(new tasks(interval,chats,repeat,message,this.worker));
        await this.worker.on('message',(message) => {
            if(message.command == 'add'){
                this.tasks.slice(-1).timeout_id = message.timeout_id;
            }
        });
    }
    removeTask(index){
        this.worker.postMessage({command:'clear',timeout_id:tasks[index].timeout_id});
        this.tasks.splice(index,1);
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
    pauseTask(index){
        this.tasks[index].paused = true;
        this.worker.postMessage({command:'clear',timeout_id:tasks[index].timeout_id});
    }

}

class tasks {
    constructor(interval,chats,repeat,message,worker){
        this.paused = false;
        this.interval = interval;
        this.chats = chats;
        this.repeat = repeat;
        this.message = message;
        this.worker = worker;
        interval.date = chrono.parseDate(interval.description);
        this.worker.postMessage({command:'add',interval_dsc:interval,chats:chats,repeat:repeat,message:message});
        this.timeout_id = 0;
    }    
}
if(isMainThread){}else{
    const task_manager = workerData;
    const tast = async (interval,chats,repeat,message)=>{
        chats.forEach(async (chat) => {
            await chat.sendMessage(message);
        });
            interval.date = chrono.parseDate(interval.description);
        if(repeat){
            setTimeout(task,interval.date - new Date(),interval,chats,repeat)
        }
    }
    parentPort.on('message',(message) => {
        switch(message.command){
            case 'add': {timeout_id = setTimeout(task, message.interval.date - new Date(), message.interval, message.chats, message.repeat, message.message);
parentPort.postMessage({
	command:'add',
	timeout_id:timeout_id
});
break;
}
            case 'clear': {clearTimeout(message.timeout_id);
break;
}
            default: {console.log('Unknown command');
break;
}
        }
    });
}


exports.task_manager = task_manager;