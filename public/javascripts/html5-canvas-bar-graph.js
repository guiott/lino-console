// Copyright 2011 William Malone (www.williammalone.com)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

function BarGraph(ctx) {

  // Private properties and methods
	
  var that = this;
  var startArr;
  var endArr;
  var looping = false;
		
  // Loop method adjusts the height of bar and redraws if neccessary
	var loop = function () {

	  var delta;
	  var animationComplete = true;

	  // Boolean to prevent update function from looping if already looping
	  looping = true;
	  
	  // For each bar
	  for (var i = 0; i < endArr.length; i += 1) {
		// Change the current bar height toward its target height
		delta = (endArr[i] - startArr[i]) / that.animationSteps;
		that.curArr[i] += delta;
		// If any change is made then flip a switch
		if (delta) {
		  animationComplete = false;
		}
	  }
	  // If no change was made to any bars then we are done
	  if (animationComplete) {
		looping = false;
	  } else {
		// Draw and call loop again
		draw(that.curArr);
		setTimeout(loop, that.animationInterval / that.animationSteps);
	  }
	};
		
  // Draw method updates the canvas with the current display
	var draw = function (arr) {
							
	  var numOfBars = arr.length;
	  var barWidth;
	  var barHeight;
	  var border = 2;
	  var ratio;
	  var maxBarHeight;
	  var gradient;
	  var largestValue;
	  var graphAreaX = 0;
	  var graphAreaY = 0;
	  var graphAreaWidth = that.width;
	  graphAreaHeight = that.height;
	  var i;
	  /*var Angle = [// sonar sensors range by position (in radians) 7 beams
	  				[-65,-40, -52],	// LL -52°
	  			  	[-40,-15, -27],  // LC -27°
	  			  	[-15,-10, -12],	// CL -12°
	  			  	[-10, 10,   0], // CC 0°
	  			  	[10, 15,   12],  // CR  12° 
	  			  	[15, 40,   27],  // RC  27°
	  			  	[40, 65,   52]   // RR  52°
	  			  ];
	  	*/
	   var Angle = [// sonar sensors range by position (in radians) 4 beams
	  				[-65,-15, -40],	// LL -40°
	  			  	[-40, 10, -15],	// CL -15°
	  			  	[-10, 40,  15], // CR  15° 
	  			  	[ 15, 65,  40]  // RR  40°
	  			   ];
		// Update the dimensions of the canvas only if they have changed
	  if (ctx.canvas.width !== that.width || ctx.canvas.height !== that.height) {
		ctx.canvas.width = that.width;
		ctx.canvas.height = that.height;
	  }
				
	  // Draw the background color
	  ctx.fillStyle = that.backgroundColor;
	  ctx.fillRect(0, 0, that.width, that.height);
					
	  // If x axis labels exist then make room	
	  if (that.xAxisLabelArr.length) {
		graphAreaHeight -= 25;
	  }
				
	  // Calculate dimensions of the bar
	  barWidth = graphAreaWidth / numOfBars - that.margin * 2;
	  maxBarHeight = graphAreaHeight - 25;
				
	  // Determine the largest value in the bar array
	  var largestValue = 0;
	  for (i = 0; i < arr.length; i += 1) {
		if (arr[i] > largestValue) {
		  largestValue = arr[i];	
		}
	  }
	  
	  // For each bar
	  for (i = 0; i < arr.length; i += 1) {
		// Set the ratio of current bar compared to the maximum
		if (that.maxValue) {
		  ratio = arr[i] / that.maxValue;
		} else {
		  ratio = arr[i] / largestValue;
		}
		
		barHeight = ratio * maxBarHeight;
		  
		// Turn on shadow
		ctx.shadowOffsetX = 2;
		ctx.shadowOffsetY = 2;
		ctx.shadowBlur = 2;
		ctx.shadowColor = "#999";
						
		// Draw bar background
		ctx.fillStyle = "#333";	
		/*		
		ctx.fillRect(that.margin + i * that.width / numOfBars,
		  graphAreaHeight - barHeight,
		  barWidth,
		  barHeight);
		*/ 
		  // triangles showing the sonars range
		  ctx.beginPath();
		  ctx.moveTo(tX(0), tY(0));

		  ctx.lineTo(tX(Math.sin(tT(Angle[i][0])) * barHeight), tY(Math.cos(tT(Angle[i][0])) * barHeight));
		  ctx.lineTo(tX(Math.sin(tT(Angle[i][2])) * barHeight), tY(Math.cos(tT(Angle[i][2])) * barHeight));
		  ctx.lineTo(tX(Math.sin(tT(Angle[i][1])) * barHeight), tY(Math.cos(tT(Angle[i][1])) * barHeight));
		  
		// Turn off shadow
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;
		ctx.shadowBlur = 0;

		// Draw bar color if it is large enough to be visible
		if (barHeight > border * 2) {
			// Create gradient
			gradient = ctx.createLinearGradient(0, 0, 0, graphAreaHeight);
			gradient.addColorStop(1, that.colors[i % that.colors.length]);
			gradient.addColorStop(1-ratio, "#ffffff");

			ctx.fillStyle = gradient;
			/*
			// Fill rectangle with gradient
			ctx.fillRect(that.margin + i * that.width / numOfBars + border,
			  graphAreaHeight - barHeight + border,
			  barWidth - border * 2,
			  barHeight - border * 2);
			*/
			  ctx.fill();

		}

		// Write bar value
		ctx.fillStyle = "#333";
		ctx.font = "bold 12px sans-serif";
		ctx.textAlign = "center";
		// Use try / catch to stop IE 8 from going to error town
		try {
		  ctx.fillText(parseInt(arr[i],10),
			tX(Math.sin(tT(Angle[i][2])) * (barHeight+10)), 
			tY(Math.cos(tT(Angle[i][2])) * (barHeight+10)));

		} catch (ex) {}
		// Draw bar label if it exists
		if (that.xAxisLabelArr[i]) {					
		  // Use try / catch to stop IE 8 from going to error town				
		  ctx.fillStyle = that.colorsLabel[i % that.colorsLabel.length];
		  ctx.font = "bold 18px sans-serif";
		  ctx.textAlign = "center";
		  try{
			ctx.fillText(that.xAxisLabelArr[i],
			  i * that.width / numOfBars + (that.width / numOfBars) / 2,
			  that.height - 5);
			} catch (ex) {}
		  }
		}
	  };

	var tX = function(xCord)
	{// translate the 0,0 = top,left coordinate system to 0,0 = middle, bottom
		var xT = xCord + that.margin + that.width / 2;
		return xT;
	}
	
	var tY = function(yCord)
	{// translate the 0,0 = top,left coordinate system to 0,0 = middle, bottom
		var yT = yCord + graphAreaHeight;
		return yT;
	}
	
	var tT = function(Degrees)
	{// translate the angle in degrees with trigonometric convention in radians from -PI/2 to PI/2
		var Radians = (Degrees * Math.PI/180) - (Math.PI);
		return -Radians;
	}
  // Public properties and methods
	
  this.width = 300;
  this.height = 150;	
  this.maxValue;
  this.margin = 5;
  this.colors = ["purple", "red", "green", "yellow"];
  this.colorsLabel = ["purple", "red", "green", "yellow"];
  this.curArr = [];
  this.backgroundColor = "#fff";
  this.xAxisLabelArr = [];
  this.yAxisLabelArr = [];
  this.animationInterval = 100;
  this.animationSteps = 10;
	
  // Update method sets the end bar array and starts the animation
	this.update = function (newArr) {

	  // If length of target and current array is different 
	  if (that.curArr.length !== newArr.length) {
		that.curArr = newArr;
		draw(newArr);
	  } else {
		// Set the starting array to the current array
		startArr = that.curArr;
		// Set the target array to the new array
		endArr = newArr;
		// Animate from the start array to the end array
		if (!looping) {	
		  loop();
		}
	  }
	}; 
}