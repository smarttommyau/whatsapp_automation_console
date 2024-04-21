import { command } from '../command_process.js';

export function timeCommand(){
    const key = ['time','tm'];
    const description = 'Get current time';
    const func = (client,argv) => {
        console.log(new Date().toLocaleString());
        return [[],argv];
    };
    return new command(key,func,description,">",false,"",true);
}

