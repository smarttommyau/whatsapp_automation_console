const command_process = require('../command_process');

function exitCommand(){
    const key = ['exit','ex'];
    const description = 'Exit the program';
    const runnable = true;
    const func = (client,argv) => {
        process.exit(0);
    };
    return new command_process.command(key,func,description,false,"",runnable);
}

exports.exitCommand = exitCommand;
