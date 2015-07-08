//-------------------------------Server init
 
var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var rxTx = require('rxTx.js');
var webClient = require('webClient.js');
var events = require('events');

var exec = require('child_process').exec,
    child;
    
var routes = require('./routes/index');
var users = require('./routes/users');

serialport = require("serialport");	// include the serialport library
SerialPort = serialport.SerialPort; // make a local instance of serial

b =require('bonescript');
sw1 = 'P9_15';
sw2 = 'P9_12';
b.pinMode(sw1, b.INPUT);
b.pinMode(sw2, b.INPUT);
//console.log("SW1="+b.digitalRead(sw1)+"  SW2="+b.digitalRead(sw2)); //debug

if(b.digitalRead(sw1))
{
  child = exec('/etc/network/net.sh AP___lino');
}
else
{
  child = exec('/etc/network/net.sh SPTNETFREE7');
}
var app = express();

/* ========Copied from bin/www. required if you want to use the old method without www
 * uncomment this
 * delete www
 * launch with "node app.js instead of npm start
http://stackoverflow.com/questions/24609991/using-socket-io-in-express-4-and-express-generators-bin-www
 * Normalize a port into a number, string, or false.
*/
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

var port = normalizePort(process.env.PORT || '3333');
app.set('port', port);
/*========Copied from bin/www. required if you want to use the old method without www */

var server = require('http').Server(app);
var io = require('socket.io')(server);

/*app.get('/', function(req, res){
  res.sendfile('index.html');
});
*/

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;

upTime = Date.now();

//-------------------------------Websocket
// Add a connect listener
var GUItimeout = 5000; // timeout on command receive from GUI web client
var GUItime = 0; //current time since last json packet

io.sockets.on('connection', function(client)
{   // Success!  Now listen to messages to be received
	client.on('message',function(event)
	{ 
	  // console.log("socket"); //debug
      GUItime = Date.now(); // reset timeout counting
      var GUI = JSON.parse(event);
      
      if ((GUI.RX === 0) && (GUI.RY === 0))
      {// if joystick is at 0,0 position...
        DES.vel = 0x7FFF;	// ...all motors stopped
      }
      else
      {
        DES.vel = (GUI.RY * 14);		// desired speed in mm/s
      }
            
      if(GUI.OF)
      {
      	DES.OrientFlag = 1;
      }
      else
      {
      	DES.OrientFlag = 0;
      }
      
      if(DES.OrientFlag)
      {
		  // This part is used to drive the robot by the desired orientation (using Orientation PID on dsNav)
		  // desired direction in degrees
		  var TmpYaw = -(GUI.RX * 18);	// absolute direction: the position of the joy = orientation in 0-3599 range
	  
		  // var TmpYaw = (UDB4.yawDeg + (GUI.RX * 18)); // relative direction: joy = turn "X" degrees from current direction in 0-3599 range
		  if(TmpYaw < 0)
		  {
			DES.yaw = (TmpYaw + 3600) % 3600;
		  }
		  else
		  {
			DES.yaw = TmpYaw % 3600;
		  }
      }
      else
      {      
		  /* Direct driving dsNav by the joystick position. 
			 The joystick ranges from -100 to +100
			 By the multiplier you set the max speed difference between the two wheels for differential steering
			 It requires the usage of DirectDrive() function in dsPID4W.c instead of Orientation()
		  */
		  DES.yaw = GUI.RX * 3;  
      }
      
      /*
      if(GUI.RX !== 0)
      {
		   console.log("Joy: "+(GUI.RX)+" Mes: "+ UDB4.yawDeg +" Des:"+DES.yaw); //debug
      }
      */
      
      DES.light[0] = Math.round(GUI.SL * 2.55); // Slider light control
      DES.light[1]=DES.light[0];
      // console.log("Vel: "+DES.vel+"  Yaw: "+DES.yaw+"  Light: "+DES.light[0]);	//debug
      // LLS power off with GUI switch
      if (!GUI.SW)
      {
        DES.hPwrOff = 1; 
      }
      
    	// server to client loop back data from joysticks for test purposes
    	//webClient.loopB(GUI);  // <-  comment this  line for normal use  
    	webClient.TX(client);
	});
	
	client.on('disconnect',function()
	{
		//console.log('Server has disconnected');
	});
});

server.listen(port, function(){
  console.log('listening on *:' + port);
});

//-------------------------------Date
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
 //   console.log("IMU comm error" + data);
});

llsPort.on('error', function (data) 
{ // call back on error
//    console.log("LLS comm error" + data);
});

// =====================================idle cycle. executed on event schedule
var imuTx=setInterval(function(){imuTxTimer();},txTick);
  
function imuTxTimer()
{// every txTick ms
  if((Date.now()-GUItime) > GUItimeout) //no command for too much time from GUI
  {
    GUItime = Date.now(); // reset timeout counting
    console.log(ISODateString()+"----Cmd:   Err: 9 <NO COMMANDS FROM WEB CLIENT FOR TOO MUCH TIME!>  STOPPING MOTORS");
    DES.vel = 0x7FFF;	// ...all motors stopped
  }
  
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

  if ((LLS.lPwrOff !== 0) || (DES.hPwrOff !== 0)) shutDownProc(); // shutdown cmd from LLS
}
// idle cycle. executed on event schedule=====================================
