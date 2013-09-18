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
// "/dev/tty.usbserial-A700ejZq" // on Mac
// "/dev/ttyS1"					 // on Aria G25
// "/dev/ttyO1"					 // on BeagleBone Black. 
//		Requires before: 
//					"cd /lib/firmware
//					sudo echo BB-UART1 > /sys/devices/bone_capemgr.*/slots
//					sudo echo BB-UART2 > /sys/devices/bone_capemgr.*/slots

    portImu = "/dev/ttyO1",		
	bpsImu = 115200,
	dataImu = 8,
	parImu = 'none',
	stopImu = 1,
	flowImu = false;
	
    portLls = "/dev/ttyO2",		
	bpsLls = 19200,
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

imuPort.on('open', function()
{
	console.log('IMU Port open: '+portImu+
	" bps: "+bpsImu+
	" data bit: "+dataImu+
	" parity: "+parImu+
	" stop bit: "+stopImu+
	" flow control: "+flowImu);
      
	var imuTx=setInterval(function(){imuTxTimer();},txTick);

	function imuTxTimer()
	{
    if (DES.hPwrOff == 0)
    {
      rxTx.imuFsmOn(imuPort);
    }
    else
    {
      rxTx.imuFsmOff(imuPort);
    }
	};
});

llsPort.on('open', function()
{
	console.log('LLS Port open: '+portLls+
	" bps: "+bpsLls+
	" data bit: "+dataLls+
	" parity: "+parLls+
	" stop bit: "+stopLls+
	" flow control: "+flowLls);
});

imuPort.on("data", function (data) 
{ //  fill-up the receive circular queue
  	for (var i = 0; i < data.length; i++)
  	{
    	RxBuff.writeUInt8(data[i],RxPtrIn);
      	//console.log(ISODateString()+"   "+RxPtrIn+"  "+RxBuff[RxPtrIn]+" "+String.fromCharCode(RxBuff[RxPtrIn])); //debug
      	if (++RxPtrIn >= MAX_BUFF) RxPtrIn=0;//restart circular queue
 	}
});

imuPort.on('error', function (data) 
{ // call back on error
    console.log("comm error" + data);
});

// var Timeout = (MAX_BUFF * 10000.0) / bpsImu; //based on a full buffer 
var Timeout = txTick * 1; // % margin left on base tick


// =====================================idle cycle. executed on event schedule
var imuTx=setInterval(function()
{
  if (RxPtrIn != RxPtrOut) rxTx.RxData();
  
  if (RxStatus > 0) 
  {// a new message packet is coming, at least header received
  	if((Date.now()-startTime) > Timeout)
        {// if the packet is not complete within Timeout ms -> error
          RxError(1);
        }
  }
  
  if (WFAflag > 0)  // cmd sent, Waiting For an Answer
  {
    if((Date.now()-WFAtime) > Timeout) // no answer at all after request
    {
      WFAcount ++; // timeouts count
      WFAflag = 0;
      if (WFAcount > WFAmax) // too many cmds sent without any answer
      {
        console.log(WFAcount+" "+WFAflag);
        WFAcount = 0;
        RxError(8);
      };
    };
  };
  
  if ((LLS.lPwrOff != 0) || DES.hPwrOff != 0) shutDownProc(); // shutdown cmd from LLS
  
},100);
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
{ 	// Success!  Now listen to messages to be received
	client.on('message',function(event)
	{ 
    	var joy = JSON.parse(event);
      DES.vel = (joy.RY * 1.4);
      DES.yaw = (joy.RX * 1.8);
      DES.light[0] = Math.abs(joy.LY * 2.55); // ***debug: manage headlights with left joystick
      
      // ***debug: simulate LLS power off with joystick
      if (joy.LX > 95)
      {
        DES.hPwrOff = 1; 
      }

      // debug: simulate LLS power off with joystick***
      
    	// server to client loop back data from joysticks for test purposes
    	//webClient.loopB(joy);  // <-  comment this  line for normal use  
      webClient.TX(client);
	});
	
	client.on('disconnect',function()
	{
		//console.log('Server has disconnected');
	});
});
