export class Logger
{
    public static log(caller:Object, msg:string)
    {
        console.log("INFO [" + caller.constructor.name + "] " + msg);
    }

    public static error(caller:Object, msg:string, e?:Error)
    {
        let compiledMsg = "ERROR [" + caller.constructor.name + "] " + msg;

        if (e)
            compiledMsg += ", reason: " + e;

        console.error(compiledMsg);
    }
}