const command_process = require('../command_process');

function timeCommand(){
    const key = ['time','tm'];
    const description = 'Get current time';
    const func = (client,argv) => {
        console.log(new Date().toLocaleString());
        return [[],argv];
    };
    return new command_process.command(key,func,description,">",false,"",true);
}

exports.timeCommand = timeCommand;