 var canvas,
 	c;
		
var mouseX, mouseY, 
	// is this running in a touch capable environment?
	touchable = 'createTouch' in document,
	touches = []; // array of touch vectors
	
var	halfWidth, 
	halfHeight,
	leftTouchID = -1, 
	leftTouchPos = new Vector2(0,0),
	leftTouchStartPos = new Vector2(0,0),
	leftVector = new Vector2(0,0); 
	rightTouchPos = new Vector2(0,0),
	rightTouchStartPos = new Vector2(0,0),
	rightVector = new Vector2(0,0); 
	leftDefaultX = 125,
	leftDefaultY = 370,
	rightDefaultX = 947,
	rightDefaultY = 370;
	
var mouseJoyLX = leftDefaultX,
	mouseJoyLY = leftDefaultY,
	mouseJoyRX = rightDefaultX,
	mouseJoyRY = rightDefaultY;
	mousePressed = 0;

var joyRX,
	joyRY,
	joyLX,
	joyLY;
		
				
setupCanvas();

setInterval(draw, 100); 


if(touchable) {
	canvas.addEventListener( 'touchstart', onTouchStart, false );
	canvas.addEventListener( 'touchmove', onTouchMove, false );
	canvas.addEventListener( 'touchend', onTouchEnd, false );
	
	// Listen for orientation changes
	window.addEventListener("orientationchange", function() 
	{	window.resizeTo(screen.width,screen.height);
		orientCheck();
	}, false);
	
	window.onorientationchange = resetCanvas; 
	window.onresize = resetCanvas;  
} else {
	
	canvas.addEventListener('mousedown', onMouseDown, false);
	canvas.addEventListener('mousemove', onMouseMove, false);
	canvas.addEventListener('mouseup', onMouseUp, false);
}

function orientCheck()
{
	if (window.orientation === 0 || window.orientation === 180)
	{
		alert("This is optimized for landscape orientation only");
	}	
}

function resetCanvas (e) {  
    // resize the canvas - but remember - this clears the canvas too. 
/*  canvas.width = window.innerWidth; 
	canvas.height = window.innerHeight;*/
	
	halfWidth = canvas.width/2; 
	halfHeight = canvas.height/2;
	
	//make sure we scroll to the top left. 
	window.scrollTo(0,0); 
}

 function init() 
{
	initGauges();
	createImageLayer();
	orientCheck();
}

function draw() 
{
	var posX, posY;
	c.clearRect(0,0,canvas.width, canvas.height); 
	
	if(touchable) 
	{
		if (touches.length > 0)
		{
//			for(var i=0; i<touches.length; i++)
			for(var i=0; i<2; i++)
			{
				var touch = touches[i]; 
				/*c.beginPath(); 
				c.fillStyle = "white";
				c.fillText("touch id : "+touch.identifier+" x:"+touch.clientX+" y:"+touch.clientY, touch.clientX+30, touch.clientY-30); 
	
				c.beginPath(); 
				c.strokeStyle = "cyan";
				c.lineWidth = "6";
				c.arc(touch.clientX, touch.clientY, 40, 0, Math.PI*2, true); 
				c.stroke();*/
				joystick(leftTouchStartPos.x, leftTouchStartPos.y, leftTouchPos.x, leftTouchPos.y);
				joystick(rightTouchStartPos.x, rightTouchStartPos.y, rightTouchPos.x, rightTouchPos.y);
				/*posX = touch.clientX;
				posY = touch.clientY;*/
			}
		} 
		else 
		{
			joystick(leftDefaultX, leftDefaultY, leftDefaultX, leftDefaultY);
			joystick(rightDefaultX, rightDefaultY, rightDefaultX, rightDefaultY);
		}
	}
	else 
	{
		joystick(leftDefaultX, leftDefaultY, mouseJoyLX, mouseJoyLY);
		joystick(rightDefaultX, rightDefaultY, mouseJoyRX, mouseJoyRY);	
	}
}

function joystick(startX, startY, movedX, movedY)
{
	var circumference = 2 * Math.PI;
	var internalRadius = 40;
	var internalFillStyle = 'gray';
	var internalLineWidth = 2;
	var internalStrokeStyle = 'rgba(20,20,20,0.2)';
	var externalRadius = internalRadius + 30;
	var externalLineWidth = 2;
	var externalStrokeStyle = 'rgba(20,20,20,0.1)';
	var externalLineWidth = 2;
	var centerX = movedX;
	var centerY = movedY;
	
	//external draw
	c.beginPath();
	c.arc(startX, startY, externalRadius, 0, circumference, false);
	c.lineWidth = externalLineWidth;
	c.strokeStyle = externalStrokeStyle;
	c.stroke();
	var grd = c.createRadialGradient(startX, startY, 10, startX, startY, externalRadius);
	// Light color
	grd.addColorStop(0, 'rgba(245,245,245,0.6)');
	// Dark color
	grd.addColorStop(1, 'rgba(160,160,160,0.6)');
	c.fillStyle = grd;
	c.fill();
	c.closePath();

	//stick draw
	var triWidth = 20;
	var tri0Width = 10;
	var maxLength = 100;
	var stickX = movedX-startX;
	var stickY = movedY-startY;

	if(stickX > maxLength)
	{
		stickX = maxLength;
		movedX = maxLength + startX;
	}

	if(stickY > maxLength)
	{
		stickY = maxLength;
		movedY = maxLength + startY;
	}

	if(stickX < -maxLength)
	{
		stickX = -maxLength;
		movedX = -maxLength + startX;
	}

	if(stickY < -maxLength)
	{
		stickY = -maxLength;
		movedY = -maxLength + startY;
	}
	
	var stickAngle = Math.atan2(stickX, stickY);
	//var stickLength = Math.sqrt((Math.pow(stickX,2)) + (Math.pow(stickY,2)));
	
	if(startX < halfWidth)
	{
		joyLX = stickX;
		joyLY = -stickY;
	}
	else
	{
		joyRX = stickX;
		joyRY = -stickY;			
	}

	var tri1X = movedX-(Math.cos(stickAngle)*triWidth);
	var tri1Y = movedY+(Math.sin(stickAngle)*triWidth);
	var tri2X = movedX+(Math.cos(stickAngle)*triWidth);
	var tri2Y = movedY-(Math.sin(stickAngle)*triWidth);
	var tri01X = startX-(Math.cos(stickAngle)*tri0Width);
	var tri01Y = startY+(Math.sin(stickAngle)*tri0Width);
	var tri02X = startX+(Math.cos(stickAngle)*tri0Width);
	var tri02Y = startY-(Math.sin(stickAngle)*tri0Width);
	
	c.beginPath();
	c.moveTo(tri01X, tri01Y);
	c.lineTo(tri1X, tri1Y);
	c.lineTo(tri2X, tri2Y);
	c.lineTo(tri02X, tri02Y);
	c.lineWidth = 0;
	c.closePath();
    // set stick color
    var grd = c.createLinearGradient(tri1X, tri1Y, tri2X, tri2Y);
	// Light color
	grd.addColorStop(0, 'rgba(50,50,50,1)');
	// Dark color
	grd.addColorStop(1, 'rgba(200,200,200,1)');
	c.fillStyle = grd;
    c.fill();
	c.beginPath();
	c.arc(startX, startY, tri0Width, 0, circumference, false);
	c.fillStyle = 'rgba(110,110,110,1)';
	c.fill();
	c.closePath();
	
	//internal draw
	c.beginPath();
	/*if(movedX<internalRadius) movedX=internalRadius+5;
	if((movedX+internalRadius)>canvas.width) movedX=canvas.width-(internalRadius+5);
	if(movedY<internalRadius) movedY=internalRadius+5;
	if((movedY+internalRadius)>canvas.height) movedY=canvas.height-(internalRadius+5);
	*/
	c.arc(movedX, movedY, internalRadius, 0, circumference, false);
	// create radial gradient
	var grd = c.createRadialGradient(movedX, movedY, 10, movedX, movedY, 80);
	// Light color
	grd.addColorStop(0, 'rgba(200,200,200,1)');
	// Dark color
	grd.addColorStop(1, 'rgba(0,0,0,1)');
	c.fillStyle = grd;
	c.fill();
	c.lineWidth = internalLineWidth;
	c.strokeStyle = internalStrokeStyle;
	c.stroke();	
	//c.fillText(" x:"+movedX+" y:"+movedY, movedX+30, movedY-30);
	c.closePath();
	//c.fillText(stickX + "   " + stickY + "   " + stickLength, movedX + 70,movedY + 70);
}

	
/*	
 *	Touch event (e) properties : 
 *  e.touches:          Array of touch objects for every finger currently touching the screen
 *	e.targetTouches:    Array of touch objects for every finger touching the screen that
 *						originally touched down on the DOM object the transmitted the event.
 *  e.changedTouches    Array of touch objects for touches that are changed for this event.
 *						I'm not sure if this would ever be a list of more than one, but would 
 *						be bad to assume. 
 *
 *	Touch objects : 
 *
 *	identifier: An identifying number, unique to each touch event
 *	target: DOM object that broadcast the event
 *	clientX: X coordinate of touch relative to the viewport (excludes scroll offset)
 *	clientY: Y coordinate of touch relative to the viewport (excludes scroll offset)
 *	screenX: Relative to the screen
 *	screenY: Relative to the screen
 *	pageX: Relative to the full page (includes scrolling)
 *	pageY: Relative to the full page (includes scrolling)
 */	

function onTouchStart(e) 
{//console.log("Touch START");
    e.preventDefault();
	
	for(var i = 0; i<e.changedTouches.length; i++)
	{
		var touch =e.changedTouches[i]; 
		if((leftTouchID<0) && (touch.clientX<halfWidth))
		{
			leftTouchID = touch.identifier; 
            leftTouchStartPos.reset(touch.clientX, touch.clientY);
			leftTouchPos.copyFrom(leftTouchStartPos); 
			leftVector.reset(0,0); 
            continue;
		} 
		else 
		{
			rightTouchID = touch.identifier; 
            rightTouchStartPos.reset(touch.clientX, touch.clientY);
			rightTouchPos.copyFrom(rightTouchStartPos); 
			rightVector.reset(0,0); 
            continue;
		}	
	}
	
	touches = e.touches; 
}
 
function onTouchMove(e) 
{//console.log("Touch MOVE");
    // Prevent the browser from doing its default thing (scroll, zoom)
	e.preventDefault();
	
	for(var i = 0; i<e.changedTouches.length; i++)
	{
		var touch =e.changedTouches[i]; 
		if(leftTouchID == touch.identifier)
		{
			leftTouchPos.reset(touch.clientX, touch.clientY); 
			leftVector.copyFrom(leftTouchPos); 
            leftVector.minusEq(leftTouchStartPos);
		}	
		else
		{
			rightTouchPos.reset(touch.clientX, touch.clientY); 
			rightVector.copyFrom(rightTouchPos); 
            rightVector.minusEq(rightTouchStartPos);
		}		
	}
	touches = e.touches; 
} 
 
function onTouchEnd(e) 
{//console.log("Touch END");
    e.preventDefault();
	
	for(var i = 0; i<e.changedTouches.length; i++)
	{	
		var touch =e.changedTouches[i]; 
		if(leftTouchID == touch.identifier)
		{
			leftTouchStartPos.x = leftDefaultX;
			leftTouchStartPos.y = leftDefaultY;
			leftTouchPos.x = leftDefaultX;
			leftTouchPos.y = leftDefaultY;
			leftTouchID = -1; 
			leftVector.reset(0,0); 
			
            break;
		}	
		else
		{
			rightTouchStartPos.x = rightDefaultX;
			rightTouchStartPos.y = rightDefaultY;
			rightTouchPos.x = rightDefaultX;
			rightTouchPos.y = rightDefaultY;			
		}	
	}	
    touches = e.touches; 
}

function onMouseUp(event) 
{
	mousePressed = 0;
	mouseJoyLX = leftDefaultX;
	mouseJoyLY = leftDefaultY;
	mouseJoyRX = rightDefaultX;
	mouseJoyRY = rightDefaultY;	
}

function onMouseMove(event) 
{

	mouseX = event.clientX;
	mouseY = event.clientY;
/*	mouseX = event.offsetX;
	mouseY = event.offsetY;*/
	
	if (mousePressed > 0)
	{
		if(mouseX < halfWidth)
		{
			mouseJoyLX = mouseX;
			mouseJoyLY = mouseY;
			mouseJoyRX = rightDefaultX;
			mouseJoyRY = rightDefaultY;	
		}
		else
		{
			mouseJoyLX = leftDefaultX;
			mouseJoyLY = leftDefaultY;
			mouseJoyRX = mouseX;
			mouseJoyRY = mouseY;	
		}
	}
	else
	{
		mouseJoyLX = leftDefaultX;
		mouseJoyLY = leftDefaultY;
		mouseJoyRX = rightDefaultX;
		mouseJoyRY = rightDefaultY;	
	}
}

function onMouseDown(event) 
{
	mousePressed = 1;
	mouseJoyLX = leftDefaultX;
	mouseJoyLY = leftDefaultY;
	mouseJoyRX = rightDefaultX;
	mouseJoyRY = rightDefaultY;	
}



function setupCanvas() {
	
	canvas = document.getElementById("canvasFrame");
	c = canvas.getContext('2d');
	/*container = document.createElement( 'div' );
	container.className = "container";*/

	/*canvas.width = canvas.window.innerWidth; 
	canvas.height = window.innerHeight; */
	/*document.body.appendChild( container );
	container.appendChild(canvas);*/	
	
	c.strokeStyle = "#ffffff";
	c.lineWidth =2;	
	resetCanvas();
	leftTouchStartPos.x = leftDefaultX;
	leftTouchStartPos.y = leftDefaultY;
	leftTouchPos.x = leftDefaultX;
	leftTouchPos.y = leftDefaultY;
	rightTouchStartPos.x = rightDefaultX;
	rightTouchStartPos.y = rightDefaultY;
	rightTouchPos.x = rightDefaultX;
	rightTouchPos.y = rightDefaultY;		
}
