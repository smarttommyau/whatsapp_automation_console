import { command } from '../command_process.js';

export function exitCommand(){
    const key = ['exit','ex'];
    const description = 'Exit the program';
    const runnable = true;
    const func = (client,argv) => {
        process.exit(0);
    };
    return new command(key,func,description,false,"",runnable);
}

