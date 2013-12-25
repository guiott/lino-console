//-------------------------------Server init
   
var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    http = require('http'),
    path = require('path'),
    rxTx = require('rxTx.js'),
    webClient = require('webClient.js'),
    events = require('events');

serialport = require("serialport");	// include the serialport library
SerialPort = serialport.SerialPort; // make a local instance of serial

var app = express();

var server = require('http').createServer(app),
  io = require('socket.io').listen(server);
  
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, '/public')));

// development only
// if ('development' == app.get('env')) {
//   app.use(express.errorHandler());
// }

upTime = Date.now();

/*-----------------------------------------------------------------------------*/
ISODateString = function(){
  var d = new Date();
  function pad(n, width, z) 
  {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }
  // function pad(n){return n<10 ? '0'+n : n}
  return d.getUTCFullYear()+'-'
      + pad(d.getUTCMonth()+1,2,'0')+'-'
      + pad(d.getUTCDate(),2,'0')+'T'
      + pad(d.getUTCHours(),2,'0')+':'
      + pad(d.getUTCMinutes(),2,'0')+':'
      + pad(d.getUTCSeconds(),2,'0')+'.'
      + pad(d.getMilliseconds(),3,'0')+'Z';
};

//-------------------------------Serial communication
// open the serial port to IMU. Change the name to the name of your port,
// "/dev/tty.usbserial-A700ejZq"    // on Mac
// "/dev/ttyS1"                     // on Aria G25
// "/dev/ttyO1"                     // on BeagleBone Black. 
//		Requires before: 
//					"cd /lib/firmware
//					sudo echo BB-UART1 > /sys/devices/bone_capemgr.*/slots
//					sudo echo BB-UART2 > /sys/devices/bone_capemgr.*/slots

portImu = "/dev/ttyO2",
bpsImu = 57600,
dataImu = 8,
parImu = 'none',
stopImu = 1,
flowImu = false;

portLls = "/dev/ttyO1",	
bpsLls = 115200,
dataLls = 8,
parLls = 'none',
stopLls = 1,
flowLls = false;

RxBuff = new Buffer(MAX_BUFF); // RX buffer 
RxStatus = 0;   // index for command decoding FSM status
rxErrors = 0;		// RX errors count
	
imuPort = new SerialPort(portImu, 
{ 
  parser: serialport.parsers.raw,
  baudrate: bpsImu,
  dataBits: dataImu, 
  parity: parImu, 
  stopBits: stopImu, 
  flowControl: flowImu
});

llsPort = new SerialPort(portLls, 
{ 
  parser: serialport.parsers.raw,
  baudrate: bpsLls,
  dataBits: dataLls, 
  parity: parLls, 
  stopBits: stopLls, 
  flowControl: flowLls
});

var txTick = 25;
var imuOpenFlag = 0;
var llsOpenFlag = 0;
// var timeout = (MAX_BUFF * 10000.0) / bpsImu; //based on a full buffer 
var timeout = txTick * 4;
var WFAmax = 5000 / timeout; // to have a 5s max timeout

imuPort.on('open', function()
{
	console.log('IMU Port open: '+portImu+
	" bps: "+bpsImu+
	" data bit: "+dataImu+
	" parity: "+parImu+
	" stop bit: "+stopImu+
	" flow control: "+flowImu);
   
  imuOpenFlag = 1;
});

llsPort.on('open', function()
{
	console.log('LLS Port open: '+portLls+
	" bps: "+bpsLls+
	" data bit: "+dataLls+
	" parity: "+parLls+
	" stop bit: "+stopLls+
	" flow control: "+flowLls);
  
  llsOpenFlag = 1;
});

imuPort.on("data", function (data) 
{ //  fill-up the receive circular queue
    for (var i = 0; i < data.length; i++)
    {
        RxBuff.writeUInt8(data[i],RxPtrIn);
        //console.log(ISODateString()+"   "+RxPtrIn+"  "+RxBuff[RxPtrIn]+" "+String.fromCharCode(RxBuff[RxPtrIn])); //debug
        if (++RxPtrIn >= MAX_BUFF) RxPtrIn=0;//restart circular queue
    }
    rxTx.RxData(); // analyze received data
});

llsPort.on("data", function (data) 
{ //  fill-up the receive circular queue
    for (var i = 0; i < data.length; i++)
    {
        RxBuff.writeUInt8(data[i],RxPtrIn);
        //console.log(ISODateString()+"   "+RxPtrIn+"  "+RxBuff[RxPtrIn]+" "+String.fromCharCode(RxBuff[RxPtrIn])); //debug
        if (++RxPtrIn >= MAX_BUFF) RxPtrIn=0;//restart circular queue
    }
    rxTx.RxData(); // analyze received data
});

imuPort.on('error', function (data) 
{ // call back on error
    console.log("IMU comm error" + data);
});

llsPort.on('error', function (data) 
{ // call back on error
    console.log("LLS comm error" + data);
});


// =====================================idle cycle. executed on event schedule
var imuTx=setInterval(function(){imuTxTimer();},txTick);
  
function imuTxTimer()
{// every txTick ms
  if (WFAflag === 0) // idle state 
  {
    if((imuOpenFlag === 1) && (llsOpenFlag === 1) );
    {// if ports open start TX FSM
      if (DES.hPwrOff === 0)
      {
        rxTx.portFsmOn();
      }
      else
      {
        rxTx.portFsmOff();
      }
    }
  }
  else  // cmd sent, Waiting For an Answer
  {
    if (RxStatus === 0) 
    {
      if((Date.now()-WFAtime) > timeout) // no answer at all after request
      {
        WFAcount ++; // timeouts count
        WFAflag = 0;
        if (WFAcount > WFAmax) // too many cmds sent without any answer
        {
          console.log(WFAcount+" "+WFAflag);
          RxError(8);
        }
      }   
    }
    else
    {// a new message packet is coming, at least header received
      if((Date.now()-startTime) > timeout)
      {// if the packet is not complete within timeout ms -> error
        RxError(1);
      }    
    }
  }
  
  if (RxPtrIn !== RxPtrOut) rxTx.RxData(); // still data on buffer?

  if ((LLS.lPwrOff !== 0) || DES.hPwrOff !== 0) shutDownProc(); // shutdown cmd from LLS
}
// idle cycle. executed on event schedule=====================================

//-------------------------------Web server
// respond to web GET requests with the index.html page:
app.get('/', function (request, response) 
{
  response.sendfile(__dirname + '/public/index.html');
});

//start express server
server.listen(app.get('port'), function()
{
   console.log("Express server listening on port " + app.get('port'));
});

//remove debug out for socket.io 
io.set('log level', 1);
 
// Add a connect listener
io.sockets.on('connection', function(client)
{   // Success!  Now listen to messages to be received
	client.on('message',function(event)
	{ 
      var GUI = JSON.parse(event);
      if ((GUI.RX === 0) && (GUI.RY === 0))
      {// if joystick is at 0,0 position...
        DES.vel = 0x7FFF;	// ...all motors stopped
      }
      else
      {
        DES.vel = (GUI.RY * 14);		// desired speed in mm/s
      }
      DES.yaw = (GUI.RX * 18);

      DES.light[0] = Math.round(GUI.SL * 2.55); // Slider light control
      DES.light[1]=DES.light[0];
      // console.log("Vel: "+DES.vel+"  Yaw: "+DES.yaw+"  Light: "+DES.light[0]);	//debug
      // LLS power off with GUI switch
      if (!GUI.SW)
      {
        DES.hPwrOff = 1; 
      }

      // debug: simulate LLS power off with joystick***
      
        // server to client loop back data from joysticks for test purposes
        //webClient.loopB(GUI);  // <-  comment this  line for normal use  
      webClient.TX(client);
	});
	
	client.on('disconnect',function()
	{
		//console.log('Server has disconnected');
	});
});
