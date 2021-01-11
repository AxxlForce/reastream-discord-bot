import {Server} from "./server";

const server = new Server();
server.run();

function exitHandler()
{
    server.stop();
    process.exit();
}

process.on('exit', exitHandler.bind(null));
process.on('SIGINT', exitHandler.bind(null));
process.on('SIGUSR1', exitHandler.bind(null));
process.on('SIGUSR2', exitHandler.bind(null));
process.on('uncaughtException', exitHandler.bind(null));