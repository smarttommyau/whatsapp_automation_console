const command_process = require('../command_process');
const util = require('../Utils');

function tasksCommand(){
    const key = ['tasks','tsk','ts'];
    const description = 'Manage tasks';
    const func = Ctasks;
    return new command_process.command(key,func,description);
}
function Ctasks(client,argv){
    const parent = 'tasks';
    const list = new command_process.command(
        ['ls','list'],
        Ctasks_list,
        'List all tasks',
        '',
        true,
        parent,
        true,
        false,
        false,
        true//tsm
    );
    const pause = new command_process.command(
        ['pause','p'],
        Ctasks_pause,
        '<id>... Pause task(s)',
        'Task ID|"--all"',
        false,
        parent,
        false,
        false,
        false,
        true//tsm
    );
    const resume = new command_process.command(
        ['resume','r'],
        Ctasks_resume,
        '<id>... Resume task(s)',
        'Task ID|"--all"',
        false,
        parent,
        false,
        false,
        false,
        true//tsm
    );
    const remove = new command_process.command(
        ['remove','rm'],
        Ctasks_remove,
        '<id>... Remove task(s)',
        'Task ID|"--all"',
        false,
        parent,
        false,
        false,
        false,
        true//tsm
    );
    const clean = new command_process.command(
        ['clean','cln'],
        Ctasks_clean,
        '<exclude ids> Remove completed tasks',
        '',
        false,
        parent,
        true,
        false,
        false,
        true//tsm
    );
    return [[
        list,
        pause,
        resume,
        remove,
        clean
    ],argv];
}

async function Ctasks_list(client,argv){
    argv.at(-2).listTasks();
    return [[],argv];
}
async function Ctasks_pause(client,argv){
    const n = argv.at(-3);
    if(n&&isNaN(parseFloat(n)) && isFinite(n)){ //is number?
        console.log('Invalid argument, %s',n);
        return [[],argv];
    }
    if(!argv[-1].at(-1)){//runnable?
        return [[
            new command_process.command(
                [],
                Ctasks_pause,
                '<id>... Pause task(s)',
                'Task ID|"--all"',
                true,
                parent,
                true,
                false,
                false,
                true
            )
        ],argv];
    }
    const tsm = argv.at(-2);
    if(argv[0] === '--all'){
        tsm.tasks.forEach((task) => {
            tsm.pauseTask(task);
        });
    }else{
        argv.slice(0,-2).forEach((id) => {
            tsm.pauseTask(id);
        });
    }
    return [[],argv];
}

async function Ctasks_resume(client,argv){
    const n = argv.at(-3);
    if(n&&isNaN(parseFloat(n)) && isFinite(n)){ //is number?
        console.log('Invalid argument, %s',n);
        return [[],argv];
    }
    if(!argv[-1].at(-1)){//runnable?
        return [[
            new command_process.command(
                [],
                Ctasks_resume,
                '<id>... Resume task(s)',
                'Task ID|"--all"',
                true,
                parent,
                true,
                false,
                false,
                true
            )
        ],argv];
    }
    const tsm = argv.at(-2);
    if(argv[0] === '--all'){
        tsm.tasks.forEach((task) => {
            tsm.resumeTask(task);
        });
    }else{
        argv.slice(0,-2).forEach((id) => {
            tsm.resumeTask(id);
        });
    }
    return [[],argv];
}

async function Ctasks_remove(client,argv){
    const n = argv.at(-3);
    if(n&&isNaN(parseFloat(n)) && isFinite(n)){ //is number?
        console.log('Invalid argument, %s',n);
        return [[],argv];
    }
    if(!argv[-1].at(-1)){//runnable?
        return [[
            new command_process.command(
                [],
                Ctasks_remove,
                '<id>... Remove task(s)',
                'Task ID|"--all"',
                true,
                parent,
                true,
                false,
                false,
                true
            )
        ],argv];
    }
    const tsm = argv.at(-2);
    if(argv[0] === '--all'){
        tsm.tasks.forEach((task) => {
            tsm.removeTask(task);
        });
    }else{
        argv.slice(0,-2).forEach((id) => {
            tsm.removeTask(id);
        });
    }
    return [[],argv];
}

async function Ctasks_clean(client,argv){
    const n = argv.at(-3);
    if(n&&isNaN(parseFloat(n)) && isFinite(n)){ //is number?
        console.log('Invalid argument, %s',n);
        return [[],argv];
    }
    if(!argv[-1].at(-1)){//runnable?
        return [[
            new command_process.command(
                [],
                Ctasks_clean,
                '<exclude ids> Remove completed tasks',
                true,
                parent,
                true,
                false,
                false,
                true
            )
        ],argv];
    }
    const tsm = argv.at(-2);
    const exclude_ids = argv.slice(0,-2).sort((a, b) => b - a );
    for (i=tsm.tasks.length -1;i>=0;i--){
        if(tsm.tasks[i].paused&&!exclude_ids.includes(i)){
            tsm.removeTask(i);
        }
    }

    return [[],argv];
}

exports.tasksCommand = tasksCommand;