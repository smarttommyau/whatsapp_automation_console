const chrono = require('chrono-node');

class task_manager {
    constructor(){
        this.tasks = [];
    }
    async addTask(interval,chats,repeat,message){
        this.tasks.push(new tasks(interval,chats,repeat,message));
    }
    resumeTask(index){
        if(this.tasks[index].paused){
            this.tasks[index].start();
        }
    }
    pauseTask(index){
        if(!this.tasks[index].paused){
            this.tasks[index].pause();
        }
    }
    removeTask(index){
        if(!this.tasks[index].paused){
            this.tasks[index].pause();
        }
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


}

class tasks {
    constructor(interval,chats,repeat,message){
        this.paused = false;
        this.interval = interval;
        this.chats = chats;
        this.repeat = repeat;
        this.message = message;
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
            await chat.sendMessage(this.message);
        });
        this.interval.date = chrono.parseDate(this.interval.description);
        if(this.repeat){
            this.timeout_id = setTimeout(this.scheduleTasks.bind(this),this.interval.date - Date.now());
        }else{
            this.paused = true;
        }
    }
}


exports.task_manager = task_manager;
