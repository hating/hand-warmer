/**
 * Created by pengjiajin on 2018/1/14.
 */
const cluster = require('cluster');
const usage = require('os-usage');

const welcomeGuide = () =>{
    console.log('==============================================================================');
    console.log('Welcome to hand warmer. 🌝');
    console.log('It is an app that keeps CPU runs on a certain rate.');
    console.log('By default,it runs for 30 minutes, keeping CPU rate at 75% ~ 95%');
    console.log('You can type \'handwarmer [time]\' to specifically define your own duration.');
    console.log('It is not a joke,you will realize this fact when it is in winter.');
    console.log('The process is running. Type Control+C to exit at any time you want.....');
    console.log('==============================================================================');
}
if (cluster.isMaster) {
    const rate = 85;
    const interval = 10;
    const checkDuration = 1000;
    const workers = [];
    let data = null;
    const cpuMonitor = new usage.CpuMonitor();
    let runDuration = parseFloat(process.argv[2]) || 30 ;// Default 30 minutes
    runDuration = runDuration*6000;
    const startTime = (new Date()).getTime();
    const endTime = startTime + runDuration;
    welcomeGuide();
    cpuMonitor.on('cpuUsage', function(res) {
        data = res;
    });
    const intervalFunc = setInterval(()=>{
            if(!data)return;
    if(Number.parseFloat(data.idle) <  100 - rate - interval){
        const worker = workers.pop();
        worker && worker.kill();
    } else if (Number.parseFloat(data.idle) > 100 - rate + interval) {
        workers.push(cluster.fork());
    }
    const currentTime = (new Date()).getTime();
    if(currentTime > endTime){
        clearInterval(intervalFunc);
        while(workers.length){
            const worker = workers.pop();
            worker && worker.kill();
        }
        cpuMonitor.emit('exit');
    }
},checkDuration);

} else {
    // Run for 1 minute.
    const iteration = 60000;
    const start = (new Date()).getTime();
    let end = start;
    while( end < start + iteration){
        end = (new Date()).getTime();
    }
}