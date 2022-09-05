const Gpio = require('onoff').Gpio;

// GPIO Devices
const button = new Gpio(4, 'in', 'both');
const led = new Gpio(17, 'out');
const LIGHTSENSOR = new Gpio(18, 'in', 'both');
const MOTIONSENSOR = new Gpio(23, 'in', 'both');
const DETECTIFLIGHTISON = new Gpio(2, 'in', 'both');
const SIGNAL = new Gpio(3, 'out');
SIGNAL.writeSync(0)
console.log('Light reset to OFF')

// Device Actions
//button.watch((err, value) => led.writeSync(value) & console.log(`Button: ${value}`));
//LIGHTSENSOR.watch((err, value) => console.log(`Light: ${value}`));
//MOTIONSENSOR.watch((err, value) => console.log(`Motion: ${value}`));

//const LED = new Gpio(17, 'out');
//LED.writeSync(1)
//gpio 18 sensor
//gpio 23 move sensor

// check if light is on
//DETECTIFLIGHTISON.watch((err, value) => console.log(`Is light on?: ${value}`));

var executeMotionCheck;
var latestInputs = [];
var firstTime;
console.log(firstTime)

var waitForAllInputs;

DETECTIFLIGHTISON.watch((err, value) => {
	
	if (firstTime == undefined || firstTime == 0) {
	latestInputs.push(value);
	console.log(latestInputs)
	waitForAllInputs = setTimeout(CHECKER, 2000)
	console.log('FIRST TIME')
	firstTime = 1;
	} else {
	latestInputs.push(value);
	console.log(latestInputs)
	console.log('NOT FIRST TIME')
	}
});

var CHECKIFALREADYON;
CHECKIFALREADYON = 0;

function CHECKER() {
	clearTimeout(waitForAllInputs);
	var lastInput = latestInputs.slice(-1)
	console.log(lastInput)
	latestInputs = [];
	firstTime = 0;

	//console.log(`VALUE: ${value}` + executeMotionCheck + typeof executeMotionCheck)
	if (lastInput == 1) {
		if(CHECKIFALREADYON == 0){
		CHECKIFALREADYON = 1;
		SIGNAL.writeSync(1)
		console.log('Light turned ON in Auto Mode');
		//if (executeMotionCheck == undefined || typeof executeMotionCheck == 'object') {
		//executeMotionCheck = setInterval(motionSensorCheck, 2000);
		//}
		executeMotionCheck = setInterval(motionSensorCheck, 2000);
		}
	}
	if (lastInput == 0) {
		console.log('Light turned OFF in Auto Mode');
		SIGNAL.writeSync(0)
		CHECKIFALREADYON = 0;
		try {
		clearInterval(executeMotionCheck)
		noMoveCount = 0;
		//console.log('AFTER 1:' + executeMotionCheck)
		} catch(err) {
		console.log(err)
		}
	}
}

// movement checker
var noMoveCount;
noMoveCount = 0

MOTIONSENSOR.watch((err, value) => {
	if (value == 1) {
		console.log('! Movement detected !');
		noMoveCount = 0;
		console.log('noMoveCount reset');
	}
})

function motionSensorCheck() {
	MOTIONSENSOR.read((err, value) => {
	//console.log(value)
	if (value == 0) {
		console.log('No movement!');
		noMoveCount++;
		console.log(`New noMoveCount is ${noMoveCount}`);
	}

	if (noMoveCount == 10){
		console.log(`NO MOVEMENT for more than 10 noMoveCounts, light off`)
		clearInterval(executeMotionCheck)
		noMoveCount = 0;
		CHECKIFALREADYON = 0;
		SIGNAL.writeSync(0)
	}

	})
};



// const executeMotionCheck = setInterval(motionSensorCheck, 2000);
