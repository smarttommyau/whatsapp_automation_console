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
    }
    async addTask(interval,chats,repeat,message){
        this.tasks.push(new tasks(interval,chats,repeat,message));
    }
    removeTask(index){
        clearTimeout(this.tasks[index].timeout_id);
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
        clearTimeout(this.task[index].timeout_id);
        this.tasks[index].paused = true;
    }

}

class tasks {
    constructor(interval,chats,repeat,message){
        this.paused = false;
        this.interval = interval;
        this.chats = chats;
        this.repeat = repeat;
        this.message = message;
        interval.date = chrono.parseDate(interval.description);
        this.timeout_id = setTimeout(scheduleTasks.bind(this),interval.date - Date.now());
    }
    async scheduleTasks(){
        this.chats.forEach(async (chat) => {
            await chat.sendMessage(message);
        });
        interval.date = chrono.parseDate(interval.description);
        if(repeat){
            this.timeout_id = setTimeout(scheduleTasks.bind(this),interval.date - Date.now());
        }else{
            this.paused = true;
        }
    }
}



exports.task_manager = task_manager;