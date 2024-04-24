import webwhats from 'whatsapp-web.js';
const { Client, LocalAuth } = webwhats;
import qrcode from 'qrcode-terminal';
import { processCommand } from './command_process.js';
import readline from 'node:readline';
import { sendCommand } from './Commands/send.js';
import { retrieveCommand } from './Commands/retrieve.js';
import { chatsCommand } from './Commands/chats.js';
import { readCommand } from './Commands/read.js';
import { scheduleCommand } from './Commands/schedule.js';
import { tasksCommand } from './Commands/tasks.js';
import { timeCommand } from './Commands/time.js';
import { exitCommand } from './Commands/exit.js';
import { logger } from './Commands/logger.js';
import { task_manager } from './task_manager.js';
import { processInput } from './Utils.js';
const wwebVersion = '2.2412.54';
const client = new Client({
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
    authStrategy: new LocalAuth({
        dataPath: '.data'
    }),
    webVersionCache: {
        type: 'remote',
        remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`,
    },
});
const taskManager = new task_manager(client);
const message_logger = new logger();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
client.initialize();

client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
}); 
//TODO: support matching text to respond
const commandpros = async () =>{
    return new Promise((resolve,reject) => {
    rl.question('>', async (input) => {
        const listOfCommands = [
            sendCommand(),
            retrieveCommand(),
            chatsCommand(),
            readCommand(),
            scheduleCommand(),
            tasksCommand(),
            message_logger.loggerCommand(),
            timeCommand(),
            exitCommand()
        ];
    
        await processCommand(processInput(input),client,rl,taskManager,listOfCommands);
        resolve();
        await commandpros();
    });
});
}

client.on('ready', () => {
    console.log('Welcome to WhatsApp automation, help to get list of commands');
    commandpros();
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});



process.on('SIGINT SIGQUT SIGTERM', () => {
process.exit(0);
});  // CTRL+C Keyboard quit `kill` command
process.on('uncaughtException', (err) => {
console.log(err.stack);
process.exit(0);
});
process.on('exit', () => {
console.log(new Date().toLocaleString());
console.log('Destroying Session....');
client.destroy();
console.log('Bye Bye')
process.exit(0);
});


