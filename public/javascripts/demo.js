// JavaScript Document

// auto demo
setInterval(function(){ setGpsValue(gpsPos); }, 1500);
setInterval(function(){ setGpsInfo(gpsInfo); }, 1500);
setInterval(function(){ setRandomValue(thermoL, 100); }, 4800);
setInterval(function(){ setRandomValue(thermoR, 100); }, 4800);
setInterval(function(){ battery(); }, 200);

//setInterval(function(){console.log("LX: "+joyLX+" LY: "+joyLY+"   RX: "+joyRX+" RY: "+joyRY);}, 200);

var odoValue;
setInterval(function(){
var gaugeSpeed = joyRY * 1.4;
var gaugeCmp1 = (joyRX * 1.8); //* (Math.PI / 180);
var gaugeCmp2 = gaugeCmp1 - 45;
var pitch = -joyLY*0.9;
var roll = -joyLX*0.9;

odoValue += 0.02;
speed.setValue(Math.abs(gaugeSpeed));
speed.setOdoValue(odoValue);
compass1.setValue(gaugeCmp1);
compass2.setValue(gaugeCmp2);
FLMotorC.setValue(Math.abs(gaugeSpeed)*10);
RLMotorC.setValue(Math.abs(gaugeSpeed)*10);
FRMotorC.setValue(Math.abs(gaugeSpeed)*10);
RRMotorC.setValue(Math.abs(gaugeSpeed)*10);
FLMotorS.setValue(gaugeSpeed);
RLMotorS.setValue(gaugeSpeed);
FRMotorS.setValue(gaugeSpeed);
RRMotorS.setValue(gaugeSpeed);
horizon1.setPitch(pitch);
horizon1.setRoll(roll);
//console.log("V: "+gaugeSpeed+" Cmp1: "+gaugeCmp1+" Pitch: "+pitch+" Roll: "+roll);
}, 100);


/*		 odometer1 = new steelseries.Odometer('canvasOdometer1', {});
				
Start the random update for demo purpose
setInterval(function(){ setRandomValue(compass1, 360); }, 3000);
setInterval(function(){ setRandomValue(compass2, 360); }, 3000);
setInterval(function(){ setHorRandomValue(horizon1); }, 3400);
setInterval(function(){ setRandomValue2(FLMotorC, 2500); }, 1500);
setInterval(function(){ setRandomValue2(FLMotorS, 150); }, 1500);
setInterval(function(){ setRandomValue2(RLMotorC, 2500); }, 1500);
setInterval(function(){ setRandomValue2(RLMotorS, 150); }, 1500);
setInterval(function(){ setRandomValue2(FRMotorC, 2500); }, 1500);
setInterval(function(){ setRandomValue2(FRMotorS, 150); }, 1500);
setInterval(function(){ setRandomValue2(RRMotorC, 2500); }, 1500);
setInterval(function(){ setRandomValue2(RRMotorS, 150); }, 1500);
setInterval(function(){ setRandomValue(Speed, 140); }, 4850);
setInterval(function(){ setOdometer(Speed); }, 100);
updateOdo();
*/

// joystick feedback demo
/*compass1.setValueAnimated(
compass2
horizon1
Speed
FLMotorC
FLMotorS
RLMotorC
RLMotorS
FRMotorC
FRMotorS
RRMotorC
RRMotorS*/


var batVal = 0;
var batInc = 2;
	
// random demo functions
    function battery() {
        batteryL.setValue(batVal);
        batteryR.setValue(100-batVal);
        batVal += batInc;
        if (batVal < 0 || batVal > 100) {batInc = -batInc;}
    }

	 function setRandomValue(gauge, range) {
        gauge.setValueAnimated(Math.random() * range);
    }

    function setRandomValue2(gauge, range) {
        gauge.setValue(Math.random() * range);
    }
	
	function setGpsValue(gauge, range) {
        gauge.setValue("Lat: 12° 32\' 45\" N    Lon: 42° 23\' 11\" E");
    }
	
	function setGpsInfo(gauge, range) {
        gauge.setValue("GPS: Speed 123cm/s  Dir 38°  Height 87m  HDOP 3.6  EHPE 6.8  Sat 12  30-06-2013 UTC 14:30:43");
    }
	
    function setRandomValue3(gauge, range) {
        if (scroll)
            gauge.setValue("<Autoscrolling text>");
        else
            gauge.setValue("<Autoscroll>");
        scroll = !scroll;
    }

    function setHorRandomValue(gauge) {
        var pitch = Math.random() * 100 - 50;
        var roll = Math.random() * 120 - 60;
        gauge.setPitchAnimated(pitch);
        gauge.setRollAnimated(roll);
    }

	function setOdometer(gauge) {
        odoValue += 0.02;
        gauge.setOdoValue(odoValue);
    }
	
/*    function updateOdo() {
        n += 0.005
        odometer1.setValue(n);
        setTimeout("updateOdo()", 50);
    }*/
