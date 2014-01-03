lino-console
============

This is the remote side part of a more complex project that will use node.js to control a robot through web socket. Node.js will be installed on an Aria G25 ACME systems board. Right now it is a demo with all the capabilities to do it but with just a joystick direct feedback on instruments. The video stream is already working when the Aria G25 video stream is in a network visible by the client. Here an example: http://www.guiott.com/Lino/LinoConsoleNEW/index.html some instruments show fake values other show values changed by the joysticks. Tested on different browsers: Safari, Firefox, Chrome on Mac, Linux and Windows OSs. Explorer doesn't yet support canvas until version 9. Full touch features are available, of course, on mobile devices. Tested on Safari and Dolphin with iPad and iPhone, Dolphin and standard browser on Android 4. I've used the classes most compatible as possible. On touchable devices the joysticks are self-centering and multitouch. This is based on original jobs by Gerrit Grunwald for gauges http://harmoniccode.blogspot.it/2011/04/steelseries-javascript-edition.html and by Seb Lee-Delisle for multitouch joysticks http://seb.ly/2011/04/multi-touch-game-controller-in-javascripthtml5-for-ipad/. The video streaming is based on M-JPEG streamer http://www.acmesystems.it/video_streaming

December 2013

The whole system was ported on a Beaglebone Black board and completed with most of the scheduled functions. The GUI client exchanges data bidirectionally with the server. The server controls the navigation via the IMU and the obstacles via the Low Level Supervisor.
A demo video, demonstrating the basic operations of all of the subsystems with a manual navigation control, is available at http://www.guiott.com/Lino/HLS/LinoFirstSteps.htm

The full description of the robot at: http://www.guiott.com/Lino/index.html

