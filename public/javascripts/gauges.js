// JavaScript Document
 var scroll = false;
 var compass1;
 var compass2;
 var horizon1;
	
 var FLMotorC;
 var FLMotorS;
 var RLMotorC;
 var RLMotorS;

 var gpsPos;
 var gpsInfo;
 var led1;
 var clock1;
 var batteryL;
 var batteryR;
 var thermoL;
 var thermoR;
     
  /*    var odometer1, n = 999997.7;*/
	var speed, odoValue = 999997.7;

	function initGauges() 
	{
		// Define some sections
		var sections = [steelseries.Section(0, 35, 'rgba(0, 0, 220, 0.3)'),
					steelseries.Section(35, 70, 'rgba(0, 220, 0, 0.3)'),
					steelseries.Section(70, 105, 'rgba(220, 220, 0, 0.3)') ],

		// Define one area
		areas = [steelseries.Section(130, 140, 'rgba(220, 0, 0, 0.3)')],

		// Define value gradient for bargraph
		valGrad = new steelseries.gradientWrapper(  0, 100,
													[ 0, 0.33, 0.66, 0.85, 1],
													[ new steelseries.rgbaColor(0, 0, 200, 1),
													  new steelseries.rgbaColor(0, 200, 0, 1),
													  new steelseries.rgbaColor(200, 200, 0, 1),
													  new steelseries.rgbaColor(200, 0, 0, 1),
													  new steelseries.rgbaColor(200, 0, 0, 1) ]);
													  

    // Initialzing gauge
    compass1 = new steelseries.Compass('canvasCompass1', 
    {
      size: 141
    });

    compass2 = new steelseries.Compass('canvasCompass2',
    {
      size: 141,
      rotateFace: true
    });

    horizon1 = new steelseries.Horizon('canvasHorizon1', 
    {
      size: 141
    });

    speed = new steelseries.Radial('canvasSpeed', 
    {
      gaugeType: steelseries.GaugeType.TYPE4,
      size: 141,
      section: sections,
      area: areas,
      titleString: "Speed",
      unitString: "cm/s",
      threshold: 70,
      maxValue: 140,
      lcdVisible: true,
      lcdDecimals: 1,
      useOdometer: true,
      odometerParams: {digits: 5, value: odoValue}
    });

    thermoL = new steelseries.Linear('canvasThermoL', 
    {
      width: 85,
      height: 230,
      gaugeType: steelseries.GaugeType.TYPE2,
      titleString: "Temp Left",
      unitString: "°C",
      threshold: 50,
      maxValue: 80,
      lcdVisible: false
    });		

    thermoR = new steelseries.Linear('canvasThermoR', 
    {
      width: 85,
      height: 230,
      gaugeType: steelseries.GaugeType.TYPE2,
      titleString: "Temp Right",
      unitString: "°C",
      threshold: 50,
      maxValue: 80,
      lcdVisible: false                            
    });						

    clock1 = new steelseries.Clock('canvasClock1', 
    {
      size: 181
    });	

    FLMotorC = new steelseries.DisplaySingle('canvasFLMotorC', 
    {
      width: 80,
      height: 35,
      unitString: "mA",
      unitStringVisible: true,
      headerStringVisible: true,
      headerString: "Front Left",
      valuesNumeric: true,
      lcdDecimals: 0
    });

    FLMotorS = new steelseries.DisplaySingle('canvasFLMotorS', 
    {
      width: 80,
      height: 35,
      unitString: "cm/s",
      unitStringVisible: true,
      headerStringVisible: true,
      headerString: "Front Left",
      valuesNumeric: true,
      lcdDecimals: 0
    });

    RLMotorC = new steelseries.DisplaySingle('canvasRLMotorC', 
    {
      width: 80,
      height: 35,
      unitString: "mA",
      unitStringVisible: true,
      headerStringVisible: true,
      headerString: "Rear Left",
      valuesNumeric: true,
      lcdDecimals: 0
    });

    RLMotorS = new steelseries.DisplaySingle('canvasRLMotorS', 
    {
      width: 80,
      height: 35,
      unitString: "cm/s",
      unitStringVisible: true,
      headerStringVisible: true,
      headerString: "Rear Left",
      valuesNumeric: true,
      lcdDecimals: 0
    });

    FRMotorC = new steelseries.DisplaySingle('canvasFRMotorC', 
    {
      width: 80,
      height: 35,
      unitString: "mA",
      unitStringVisible: true,
      headerStringVisible: true,
      headerString: "Front Right",
      valuesNumeric: true,
      lcdDecimals: 0
    });

    FRMotorS = new steelseries.DisplaySingle('canvasFRMotorS', 
    {
      width: 80,
      height: 35,
      unitString: "cm/s",
      unitStringVisible: true,
      headerStringVisible: true,
      headerString: "Front Right",
      valuesNumeric: true,
      lcdDecimals: 0
    });

    RRMotorC = new steelseries.DisplaySingle('canvasRRMotorC', 
    {
      width: 80,
      height: 35,
      unitString: "mA",
      unitStringVisible: true,
      headerStringVisible: true,
      headerString: "Rear Right",
      valuesNumeric: true,
      lcdDecimals: 0
    });

    RRMotorS = new steelseries.DisplaySingle('canvasRRMotorS', 
    {
      width: 80,
      height: 35,
      unitString: "cm/s",
      unitStringVisible: true,
      headerStringVisible: true,
      headerString: "Rear Right",
      valuesNumeric: true,
      lcdDecimals: 0
    });

    gpsPos = new steelseries.DisplaySingle('canvasGpsPos', 
    {
      width: 350,
      height: 30,
      unitString: "°",
      unitStringVisible: false,
      headerStringVisible: false,
      valuesNumeric: false
    });

    gpsInfo = new steelseries.DisplaySingle('canvasGpsInfo', 
    {
      width: 350,
      height: 30,
      unitString: "°",
      autoScroll: true,
      unitStringVisible: false,
      headerStringVisible: false,
      valuesNumeric: false
    });


    led1 = new steelseries.Led('canvasLed1', 
    {
    });

    led1.blink(true);

    batteryL = new steelseries.Battery('canvasBatteryL', 
    {
      size: 80,
      value: 0
    });

    batteryR = new steelseries.Battery('canvasBatteryR', 
    {
      size: 80,
      value: 0
    });
		 
		compass1.setFrameDesign(steelseries.FrameDesign.GLOSSY_METAL);
    compass2.setFrameDesign(steelseries.FrameDesign.GLOSSY_METAL);
    horizon1.setFrameDesign(steelseries.FrameDesign.GLOSSY_METAL);
    clock1.setFrameDesign(steelseries.FrameDesign.GLOSSY_METAL);
    speed.setFrameDesign(steelseries.FrameDesign.GLOSSY_METAL);
    thermoL.setFrameDesign(steelseries.FrameDesign.GLOSSY_METAL);
    thermoR.setFrameDesign(steelseries.FrameDesign.GLOSSY_METAL);

    compass1.setBackgroundColor(steelseries.BackgroundColor.BEIGE);
    compass2.setBackgroundColor(steelseries.BackgroundColor.BEIGE);
    clock1.setBackgroundColor(steelseries.BackgroundColor.BEIGE);
    speed.setBackgroundColor(steelseries.BackgroundColor.BEIGE);
    thermoL.setBackgroundColor(steelseries.BackgroundColor.BEIGE);
    thermoR.setBackgroundColor(steelseries.BackgroundColor.BEIGE);

    compass1.setForegroundType(steelseries.ForegroundType.TYPE4);
    compass2.setForegroundType(steelseries.ForegroundType.TYPE4);
    horizon1.setForegroundType(steelseries.ForegroundType.TYPE4);
    speed.setForegroundType(steelseries.ForegroundType.TYPE4);

    compass1.setPointerColor(steelseries.ColorDef.RED);
    compass2.setPointerColor(steelseries.ColorDef.RED);
    clock1.setPointerColor(steelseries.ColorDef.RED);
    speed.setPointerColor(steelseries.ColorDef.RED);
    clock1.setForegroundType(steelseries.ForegroundType.TYPE4);
   

    compass2.setPointerType(steelseries.PointerType.TYPE2);
    clock1.setPointerType(steelseries.PointerType.TYPE2);
    speed.setPointerType(steelseries.PointerType.TYPE2);

    gpsPos.setLcdColor(steelseries.LcdColor.SECTIONS);
    gpsInfo.setLcdColor(steelseries.LcdColor.SECTIONS);
    FLMotorC.setLcdColor(steelseries.LcdColor.SECTIONS);
    FLMotorS.setLcdColor(steelseries.LcdColor.SECTIONS);
    RLMotorC.setLcdColor(steelseries.LcdColor.SECTIONS);
    RLMotorS.setLcdColor(steelseries.LcdColor.SECTIONS);
    FRMotorC.setLcdColor(steelseries.LcdColor.SECTIONS);
    FRMotorS.setLcdColor(steelseries.LcdColor.SECTIONS);
    RRMotorC.setLcdColor(steelseries.LcdColor.SECTIONS);
    RRMotorS.setLcdColor(steelseries.LcdColor.SECTIONS);

    led1.setLedColor(steelseries.LedColor.RED_LED);
    led1.setLedColor(steelseries.LedColor.GREEN_LED);
    led1.setLedColor(steelseries.LedColor.YELLOW_LED);
    speed.setLedColor(steelseries.LedColor.RED_LED);
 }


	