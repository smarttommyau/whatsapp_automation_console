const prompt = require('prompt-sync')();
const utils = require('./Utils');
const chrono = require('chrono-node');
async function scheduleCommand(client,task_manager,listOfCommands){
    //get type
    if(listOfCommands.length === 0){
        input = prompt("Type(repeat|once):");
        listOfCommands = input.trim().split(' ');
    }
    //fuzzy check type and set boolean
    let repeat = false
    if('repeat'.includes(listOfCommands[0])){
        repeat = true;
    }else if('once'.includes(listOfCommands[0])){
        repeat = false;
    }else{
        console.log('Invalid type');
        return;
    } 
    listOfCommands.splice(0,1);
   //get interval
    if(listOfCommands.length === 0){
        input = prompt("DateTimeDescription(end with \"end\"):");
        listOfCommands = input.trim().split(' ');
    }
    err = true;
    let interval = {description:"",date:new Date()};
    while(err){
    let endpos = listOfCommands.indexOf("end");
    if(endpos == -1){
        input = ''
        while(listOfCommands.indexOf("end") == -1){
            input = prompt("(end with \"end\"):");
            listOfCommands = [...listOfCommands, ...input.trim().split(' ')];
        }
    }
    endpos = listOfCommands.indexOf("end");
    interval.description = listOfCommands.slice(0,endpos).join(' ');
    try{
        interval.date = chrono.parseDate(interval.description);
        err = false;
        
    } catch (error) {
        console.log('Invalid interval description');
    }
    listOfCommands.splice(0,endpos+1);

}
    //get contact|group
    if(listOfCommands.length === 0){
        input = prompt("Chats(join with ,):");
        listOfCommands = input.trim().split(' ');
    }
    let chats_str = listOfCommands[0].split(',');
    // convert chats to chats object
    let chats = await utils.getChatsbyPartialNames(chats_str,client);
    //prompt for chat which has multiple results
    if(chats.length === 0 || chats == undefined){
        console.log('Chat not found');
        return;
    }
    chats.forEach(async (chat,i) => {
        if(chat.length > 1){
            console.log(chats_str[i]);
            console.log('Multiple chats found:');
            chat.forEach((chat,i) => {
                console.log("%d: %s",i,chat.name);
            });
            input = prompt('Select chat by number:');
            let selectedChat = chat[Number.parseInt(input)];
            if (!selectedChat) {
                console.log('Invalid chat number');
                return;
            }
            chats[i] = selectedChat;
        }else if(chat.length == 1){
            chats[i] = chat[0];
        }
    });
    listOfCommands.splice(0,1);
    //get message
    if(listOfCommands.length === 0){
        input = prompt("Message:");
        listOfCommands = input.trim().split(' ');
    }
    let message = listOfCommands.join(' ');
    //confirm
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
    input = prompt('Confirm?(y/n)').trim();
    if(input == 'y'){
        await task_manager.addTask(interval,chats,repeat,message);
    }
    else{
        console.log('Cancelled');
    }
}


exports.scheduleCommand = scheduleCommand;