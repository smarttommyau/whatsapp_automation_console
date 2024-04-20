const utils = require('../Utils');
const chrono = require('chrono-node');
const command_process = require('../command_process');

function scheduleCommand(){
    const key = ['schedule','sch'];
    const description = '<Type> <DateTimeDescription> <end> <Chats(seperate ",")> <Message> Schedule a message';
    const func = Cschedule;
    const prompt = "Type(once|repeat):"
    return new command_process.command(key,func,description,prompt,false);
}

async function Cschedule(client,argv){
    const parent = 'schedule <Type> <DateTimeDescription> <end> <Chats(seperate ",")> <Message> Schedule a message';
    const prompt = "Type(once|repeat):";
    const func = Cschedule_Type;
    return [[new command_process.command([],func,"",prompt,true,parent)],argv];

}


async function Cschedule_Type(client,argv){
    let listOfCommands = argv;
    //convert string fuzzy match to boolean
    let repeat = false
    if('repeat'.includes(argv[0])){
        repeat = true;
    }else if('once'.includes(argv[0])){
        repeat = false;
    }else{
        console.log('Invalid type');
        return [[],argv];
    }
    argv[0] = repeat;
    //contruct 
    const parent = 'schedule <Type> <DateTimeDescription> <end> <Chats(seperate ",")> <Message> Schedule a message';
    const prompt = "DateTimeDescription(end with \"end\"):";
    const func = Cschedule_Type_DateTimeDescription;
    return [[new command_process.command([],func,"",prompt,true,parent)],argv];
}

async function Cschedule_Type_DateTimeDescription(client,argv){
    console.log(argv);
    if(argv.at(-2) !== 'end'){
        const parent = 'schedule <Type> <DateTimeDescription> <end> <Chats(seperate ",")> <Message> Schedule a message';
        const prompt = "(end with \"end\"):";
        const func = Cschedule_Type_DateTimeDescription;
        return [[new command_process.command([],func,"",prompt,true,parent)],argv];
    }
    let interval = {description:"",date:new Date()};
    interval.description = argv.slice(1,-2).join(' ');
    try{
        interval.date = chrono.parseDate(interval.description);
    } catch (error) {
        console.log('Invalid interval description');
        return [[],argv];
    }
    //drop used data
    argv = argv.slice(0,1);
    argv.push(interval);//save data
    argv.push(false);//push random junk
    const parent = 'schedule <Type> <DateTimeDescription> <end> <Chats(seperate ",")> <Message> Schedule a message';
    const prompt = "Chats(join with ,):";
    const func = Cschedule_Type_DateTimeDescription_Chats;
    return [[new command_process.command([],func,"",prompt,true,parent,false,true)],argv];
}

async function Cschedule_Type_DateTimeDescription_Chats(client,argv){
    let chats_str = argv.at(-3).split(',');
    const readline = argv.at(-2);
    let chats = await utils.getChatsbyPartialNames(chats_str,client);
    if(!chats||chats.length === 0){
        console.log('Chat not found');
        return [[],argv];
    }
    chats.forEach(async (chat,i) => {
        if(chat.length > 1){
            console.log(chats_str[i]);
            console.log('Multiple chats found:');
            chat.forEach((chat,i) => {
                console.log("%d: %s",i,chat.name);
            });
            readline.question('Select chat by number:', (input) => {
                let selectedChat = chat[Number.parseInt(input)];
                if (!selectedChat) {
                    console.log('Invalid chat number');
                    return [[],argv];
                }
                chats[i] = selectedChat;
            });
        }else if(chat.length == 1){
            chats[i] = chat[0];
        }
    });
    //drop used data
    argv = argv.slice(0,-3);
    argv.push(chats);//save data
    argv = argv.concat([false,false]);//push random junk
    const parent = 'schedule <Type> <DateTimeDescription> <end> <Chats(seperate ",")> <Message> Schedule a message';
    const prompt = "Message:";
    const func = Cschedule_Type_DateTimeDescription_Chats_Message;
    return [[new command_process.command([],func,"",prompt,true,parent,true,true,true,true)],argv];
}

async function Cschedule_Type_DateTimeDescription_Chats_Message(client,argv){
    const readline = argv.at(-2);
    const tsm = argv.at(-3);
    const message = argv.at(-4).join(' ');
    let chats = argv.at(-5);
    let interval = argv.at(-6);
    const repeat = argv[0];
    console.log('Schedule message to:');
    chats.forEach(chat => {
        console.log(chat.name);
    });
    console.log('DateTime(Estimate):');
    console.log(interval.date.toLocaleString());
    console.log('Repeat:');
    console.log(repeat);
    console.log('Message:');
    console.log(message);
    readline.question('Confirm?(y/n)', (input) => {
        if(input == 'y'){
            console.log('Scheduled');
            tsm.addTask(interval,chats,repeat,message);
        }
        else{
            console.log('Cancelled');
        }
        readline.close();
    });
    return [[],argv];
}



exports.scheduleCommand = scheduleCommand;