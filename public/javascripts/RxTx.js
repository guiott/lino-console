// ============ data collected from all boards to Aria G25 High Level Supervisor

/* GPS values coming from UDB4 IMU
 * latitude, longitude, altitude, speed over ground, course over ground, 
 * climb, Horizontal Dilution Of Precision, Horizontal Estimated Position Error
 * List of visible satellites, No. of visible satellites
 * Year, Month, Day UTC from satellites
 * Hour, Minute, Seconds, UTC, leap seconds corrected from satellites
*/
 var GPS={lat:0, lon:0, alt:0,
           sog:0, cog:0, climb:0,
           hdop:0, ehpe:0,
           satIdList:0, svs:0,
           year:0, month:0, day:0, hour:0, min:0, sec:0};
 
 var LAT={deg:0, min:0, sec:0, dir:' '};
 var LON={deg:0, min:0, sec:0, dir:' '};

/* dsNav values coming through UDB4
    PosXmes;    current X position coordinate
    PosYmes;    current Y position coordinate
    VelInt[4];  speed in mm/s as an integer for all the wheels
    ADCValue[4];   64 sample average ADC (motor current) also for slave
 stasis_err;    number of times imu and wheels very different
 stasis_alarm;  signal too many stasis errors
*/
 var dsNav={posXmes:0, posYmes:0, 
           velInt:[0,0,0,0], 
           ADCValue:[0,0,0,0], 
           stasisErr:0, stasisAlarm:0};

/* UDB4 IMU computed values
 YawMesAbs absolute value of measured orientation binary angle (process control) (Degx10 0-3599)
 YawMesRel measured orientation binary angle (process control) (Degx10 0-3599) rel. to startup position
 Pitch     computed from rmat[] rotation matrix
 Roll      computed from rmat[] rotation matrix
*/
 var UDB4={yawAbs:0, yawRel:0, pitch:0, roll:0};

/* HLS -> UDB4 -> dsNav command values to dsNav motor controller through UDB4
    VelDes; // mean desired speed mm/s. a value of 0X7FFF means total STOP
    YawDes; // desired orientation angle (set point)(Degx10 0-3599)
    hPwrOff;// switch off command

*/  
 var DES={vel:0, yaw:0, hPwrOff:0};

/* values coming from Low Level Supervisor
 BatV[]	Left and Right battery voltage level
 Temp[]	Left and Right hulls temperature
*/
 var LLS={batV:[0,0], temp:[0,0]};
 
 /* values coming from web GUI
 sliderVal	Headlight slider control
 switchVal  On/Off switch
 OrientFlag change the dsNav orientation mode (direct or PID)

*/
 GUI={sliderVal:0, switchVal:true, OrientFlag:0};

// ============================================================================

// open a connection to the server:
var socket = io.connect('http://' + location.host);

socket.on('loopBackEvent', function (data) 
{
  var LB = JSON.parse(data);
  dsNav.velInt[0] = LB.FLs;
  dsNav.velInt[1] = LB.FRs;
  dsNav.velInt[2] = LB.RLs;
  dsNav.velInt[3] = LB.RRs;
  dsNav.ADCValue[0] = LB.FLc;
  dsNav.ADCValue[1] = LB.FRc;
  dsNav.ADCValue[2] = LB.RLc;
  dsNav.ADCValue[3] = LB.RRc;
  UDB4.yawAbs = LB.gaugeCmp1;
  UDB4.yawRel = LB.gaugeCmp2;
  UDB4.pitch = LB.pitch;
  UDB4.roll = LB.roll;
});  
    
socket.on('RxEvent', function (data) 
{ 
  var RX = JSON.parse(data);
  
  GPS.lat=RX.lat;
  GPS.lon=RX.lon; 
  GPS.alt=RX.alt;
  GPS.sog=RX.sog;
  GPS.cog=RX.cog;
  GPS.climb=RX.climb;
  GPS.hdop=RX.hdop;
  GPS.ehpe=RX.ehpe;
  GPS.satIdList=RX.satIdList;
  GPS.svs=RX.svs;
  GPS.year=RX.year;
  GPS.month=RX.month;
  GPS.day=RX.day;
  GPS.hour=RX.hour;
  GPS.min=RX.min;
  GPS.sec=RX.sec;
  dsNav.posXmes=RX.posXmes; 
  dsNav.posYmes=RX.posYmes;
  dsNav.velInt=RX.velInt; 
  dsNav.ADCValue=RX.ADCValue; 
  dsNav.stasisErr=RX.stasisErr;
  dsNav.stasisAlarm=RX.stasisAlarm;
  UDB4.yawAbs=RX.yawAbs;
  UDB4.yawRel=RX.yawRel;
  UDB4.pitch=RX.pitch;
  UDB4.roll=RX.roll;
  LLS.batV=RX.batV;
  LLS.temp=RX.temp;
  DES.hPwrOff=RX.hPwrOff;
});  

var odoValue = 0;

// gpsInfo example 
var gpsInfoS=
 ("GPS: Speed 123cm/s  Dir 38°  Height 87m  HDOP 3.6  EHPE 6.8  Sat 12  30-06-2013 UTC 14:30:43");

// gpsPos example 
var gpsPosS=("Lat: 12° 32\' 45\" N    Lon: 42° 23\' 11\" E");

setInterval(function()
{
    if(DES.hPwrOff === 0)
    {
    gpsInfoS=("GPS: Speed " + GPS.sog +
            "cm/s  Dir " + GPS.cog +
            "°  Height " + GPS.alt +
            "m  HDOP " + GPS.hdop +
            "  EHPE " + GPS.ehpe +
            "  Sat " + GPS.svs +
            "  " + GPS.day +
            "-" + GPS.month +
            "-" + GPS.year +
            " UTC " +  GPS.hour +
            ":" + GPS.min +
            ":" + GPS.sec);
  }
  else
  {
    gpsInfoS=("***SHUTTING DOWN******SHUTTING DOWN***");
  }
  
  if(GPS.lat < 0)
  {
    LAT.dir = 'S';
    var tmpLat = -GPS.lat;
  }
  else
  {
    LAT.dir = 'N';
    tmpLat = GPS.lat;
  }
  LAT.deg = truncate(tmpLat);
  var tmpMin = tmpLat - LAT.deg;
  LAT.min = truncate(tmpMin * 60);
  LAT.sec = Math.floor((tmpMin * 3600) - (LAT.min * 60));
  
  if(GPS.lon < 0)
  {
    var tmpLon = -GPS.lon;
    LON.dir = 'W';
  }
  else
  {
    tmpLon = GPS.lon;
    LON.dir = 'E';
  }
  LON.deg = truncate(tmpLon);
  tmpMin = tmpLon - LON.deg;
  LON.min = truncate(tmpMin * 60);
  LON.sec = Math.floor((tmpMin * 3600) - (LON.min * 60));
   
  var gpsPosS=("Lat: 12° 32\' 45\" N    Lon: 42° 23\' 11\" E");
    
  gpsPosS=("Lat: "+pad(LAT.deg, 2, " ")+"° "+
          pad(LAT.min, 2, "0")+
          "\' "+pad(LAT.sec, 2, "0")+"\" "+LAT.dir+
          "    Lon:"+pad(LON.deg, 3, " ")+"° "+
          pad(LON.min, 2, "0")+"\' "+
          pad(LON.sec, 2, "0")+"\" "+LON.dir);
  
  gpsPos.setValue(gpsPosS);
  gpsInfo.setValue(gpsInfoS);
  speed.setValue(Math.abs((dsNav.velInt[0] + dsNav.velInt[1]) / 20));
  
  //console.log("-"+((dsNav.velInt[0] + dsNav.velInt[1]) / 2)+"-");
  
  speed.setOdoValue(odoValue);
  compass1.setValue(UDB4.yawAbs);
  compass2.setValue(UDB4.yawRel);
  FLMotorC.setValue(dsNav.ADCValue[0]);
  RLMotorC.setValue(dsNav.ADCValue[2]);
  FRMotorC.setValue(dsNav.ADCValue[1]);
  RRMotorC.setValue(dsNav.ADCValue[3]);
  FLMotorS.setValue(dsNav.velInt[1]/10);
  RLMotorS.setValue(dsNav.velInt[3]/10);
  FRMotorS.setValue(dsNav.velInt[0]/10);
  RRMotorS.setValue(dsNav.velInt[2]/10);
  horizon1.setPitch(UDB4.pitch);
  horizon1.setRoll(-UDB4.roll);
  thermoL.setValue(LLS.temp[0]);
  thermoR.setValue(LLS.temp[1]);
  batteryL.setValue(LLS.batV[0]);
  batteryR.setValue(LLS.batV[1]);
  var joyJSON =
  {
    /*
    'LX' : joyLX,
    'LY' : joyLY,
    */
    'RX' : joyRX,
    'RY' : joyRY,
    'SW' : GUI.switchVal,
    'SL' : GUI.sliderVal,
    'OF' : GUI.OrientFlag
  };
  socket.emit('message', JSON.stringify(joyJSON));
}, 100);

function truncate(n) 
{
  return Math[n > 0 ? "floor" : "ceil"](n);
}

function pad(num, places, padChar) 
{
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join(padChar) + num;
}
