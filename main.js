const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const processCommand = require('./command_process');
const readline = require('readline');
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
const task_manager = require('./task_manager');
const taskManager = new task_manager.task_manager();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.pause();
client.initialize();

client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
}); 
client.on('ready', () => {
    console.log('Welcome to WhatsApp automation, help to get list of commands');
    // processCommand.processCommand(client);
    process.stdout.write('>');
    rl.resume();
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
console.log('Destroying Session....');
client.destroy();
console.log('Bye Bye')
process.exit(0);
});

rl.on('line', async (input) => {
    listOfCommands = [
        require('./Commands/send').sendCommand(),
        require('./Commands/retrieve').retrieveCommand(),
        require('./Commands/chats').chatsCommand(),
        require('./Commands/schedule').scheduleCommand(),
        require('./Commands/exit').exitCommand()
    ];
    rl.pause();
    const subrl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    }); 
    await processCommand.processCommand(input.trim().split(' '),client,subrl,taskManager,listOfCommands);
    process.stdout.write('>');
    rl.resume();
});