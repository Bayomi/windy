var Grid = function (grid_x, grid_y, block_size, initial_x, initial_y, goal_x, goal_y) {

	this.gridX = grid_x;
	this.gridY = grid_y;
	this.blockSize = block_size;

	this.width = block_size*this.gridX;
	this.height = block_size*this.gridY;
	//padding around grid
	this.padding = 10;
	//size of canvas
	this.canvasWidth = this.width + (this.padding*2) + 1;
	this.canvasHeight = this.height + (this.padding*2) + 1;

	this.lastState = {};
	this.lastState.x = initial_x;
	this.lastState.y = initial_y;

	this.initialState = {};
	this.initialState.x = initial_x;
	this.initialState.y = initial_y;


	this.isExecuting = false;

	this.goal = {};
	this.goal.x = goal_x;
	this.goal.y = goal_y;

	this.context = {};
};



Grid.prototype.drawBoard = function(){
	var canvas = $('<canvas/>').attr({width: this.canvasWidth, height: this.canvasHeight}).appendTo('body');
	this.context = canvas.get(0).getContext("2d");

    for (var x = 0; x <= this.width; x += this.blockSize) {
        this.context.moveTo(0.5 + x + this.padding, this.padding);
        this.context.lineTo(0.5 + x + this.padding, this.height + this.padding);
    }


    for (var x = 0; x <= this.height; x += this.blockSize) {
        this.context.moveTo(this.padding, 0.5 + x + this.padding);
        this.context.lineTo(this.width + this.padding, 0.5 + x + this.padding);
    }

    this.context.strokeStyle = "black";
    this.context.stroke();
}

Grid.prototype.checkWind = function(state) {
	var x = state.x;
	var y = state.y;

	if((x>2) && (x<9)){
		if((x==6) || (x==7)) {
			return -2;
		} else {
			return -1;
		}
	} else {
		return 0;
	}
}

Grid.prototype.drawVisit = function() {
	this.context.fillStyle="black";
	var x = this.lastState.x*this.blockSize;
	var y = this.lastState.y*this.blockSize;

	this.context.fillRect((10+x),(10+y),this.blockSize,this.blockSize);
	this.context.stroke();
}

Grid.prototype.drawCurrent = function(state) {
	var x = state.x*this.blockSize;
	var y = state.y*this.blockSize;

	if((state.x == this.goal.x) && (state.y == this.goal.y)){
		this.context.fillStyle="#00FF00";
	} else {
		this.context.fillStyle="#FF0000";
	}
	
	this.context.fillRect((10+x),(10+y),this.blockSize,this.blockSize);
	this.context.stroke();
	this.lastState = state;
}


Grid.prototype.reset = function(){
	$('canvas').remove();
	this.drawBoard();
	this.lastState.x = this.initialState.x;
	this.lastState.y = this.initialState.y;
}

Grid.prototype.checkLastState = function(move) {

	var status = {};
	status.isOK = false;
	status.windProblem = false;
	var oldX = this.lastState.x;
	var oldY = this.lastState.y;
	var wind = this.checkWind(this.lastState);

	////console.log(oldX);

	if(move == "NORTH") {
		x = oldX;
		y = oldY - 1 + wind;
	} else if(move == "SOUTH") {
		x = oldX;
		y = oldY + 1 + wind;
	} else if(move == "EAST") {
		x = oldX + 1;
		y = oldY + wind;
	} else {
		x = oldX - 1;
		y = oldY + wind;
	}

	//console.log(x);
	//console.log(this.gridX);

	if((x>=this.gridX) || (x<0)) {
		//console.log('LOCK');
		return status;
	} else if((y>=this.gridY) || (y<0)) {
		y = y - wind;
		if((y>=this.gridY) || (y<0)) {
			//console.log('LOCK');
			return status;
		}
		status.isOK = true;
		status.windProblem = true;
		return status;
	} else {
		status.isOK = true;
		return status;
	}
}

Grid.prototype.oneMove = function(move) {
	if(move) {
		var oldX = this.lastState.x;
		var oldY = this.lastState.y;
		var x = oldX;
		var y = oldY;

		var wind = this.checkWind(this.lastState);
		var status = this.checkLastState(move);

		if(status['windProblem']) {
			var wind = 0;
		}

		if(move == "NORTH") {
			if(status['isOK']) {
				y = oldY - 1 + wind;
			}
		} else if(move == "SOUTH") {
			if(status['isOK']) {
				y = oldY + 1 + wind;
			}
		} else if(move == "EAST") {
			if(status['isOK']) {
				x = oldX + 1;
				y = oldY + wind;
			}
		} else {
			if(status['isOK']) {
				x = oldX - 1;
				y = oldY + wind;
			}
		}

		if(status['isOK']) {
			var newState = {};
			newState.x = x;
			newState.y = y;
			this.drawCurrent(newState);
			return true;
		} else {
			this.drawCurrent(this.lastState);
			return false;
		}

	} else {
		this.drawCurrent(this.lastState);
		return false;
	}
}

Grid.prototype.makePath = function(delay, param) {
  var intervalFunction, timeoutId, clear;
  var n = 0;
  var allow = false;
  var self = this;
  // Call to clear the interval.
  clear = function () {
    clearTimeout(timeoutId);
  };
  intervalFunction = function () {
  	if(!self.isExecuting || allow) {
  		self.isExecuting = true;
  		allow = true;

  		if(n<=(param.length-1)) {
  			self.drawVisit();
		    self.oneMove(param[n]);
		    timeoutId = setTimeout(intervalFunction, delay);
		    n++;
  		} else {
  			//console.log('hey');
  			timeoutId = setTimeout(intervalFunction, 600);
  			n++;
  		}

	    if(n>(param.length+3)){
	    	self.reset();
	    	self.isExecuting = false;
	    	clear();
	    }
  	} else {
  		timeoutId = setTimeout(intervalFunction, delay);
  	}
  }
  // Delay start.
  timeoutId = setTimeout(intervalFunction, delay);
  // You should capture the returned function for clearing.
  return clear;
};

var Queue = (function(){

    function Queue() {};

    Queue.prototype.running = false;

    Queue.prototype.queue = [];

    Queue.prototype.add = function(callback) { 
        var _this = this;
        //add callback to the queue
        this.queue.push(function(){
            var finished = callback();
            if(typeof finished === "undefined" || finished) {
               //  if callback returns `false`, then you have to 
               //  call `next` somewhere in the callback
               _this.next();
            }
        });

        if(!this.running) {
            // if nothing is running, then start the engines!
            this.next();
        }

        return this; // for chaining fun!
    }

    Queue.prototype.next = function(){
        this.running = false;
        //get the first element off the queue
        var shift = this.queue.shift(); 
        if(shift) { 
            this.running = true;
            shift(); 
        }
    }

    return Queue;

})();

// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});


	
