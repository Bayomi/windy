/*
State variable
*/

var _State = function (xCoord, yCoord) {
  this.x = xCoord;
  this.y = yCoord;
};

_State.prototype.print = function() {
	//console.log('x coordinate: '+this.x + "; y coordinate: "+this.y);
}

_State.prototype.random = function(grid_x, grid_y) {
	this.x = getRandomInt(0, (grid_x-1));
	this.y = getRandomInt(0, (grid_y-1));
	return this;
}

/*
Action Variable
*/

var _Action = function (direction) {
	this.direction = direction;
	this.x = 0;
	this.y = 0;
	if (direction == 'NORTH') {
		this.x = 0;
		this.y = -1; 
	} else if (direction == 'SOUTH') {
		this.x = 0;
		this.y = 1;
	} else if (direction == 'EAST') {
		this.x = 1;
		this.y = 0;
	} else if (direction == 'WEST') {
		this.x = -1;
		this.y = 0;
	} else {
		this.direction = "EMPTY";
	}
};

_Action.prototype.print = function() {
	//console.log(this.direction);
}

_Action.prototype.random = function() {
	var rand = getRandomInt(0, 3);
	if(rand == 0) {
		return new _Action('NORTH');
	} else if(rand == 1) {
		return new _Action('SOUTH');
	} else if(rand == 2) {
		return new _Action('EAST');
	} else {
		return new _Action('WEST');
	}
}

_Action.prototype.id = function() {
	var direction = this.direction;
	if (direction == 'NORTH') {
		return 0;
	} else if (direction == 'SOUTH') {
		return 1;
	} else if (direction == 'EAST') {
		return 2;
	} else if (direction == 'WEST') {
		return 3;
	} else {
		return null;
	}
}

_Action.prototype.getById = function(id) {
	if(id == 0) {
		return new _Action('NORTH');
	} else if(id == 1) {
		return new _Action('SOUTH');
	} else if(id == 2) {
		return new _Action('EAST');
	} else {
		return new _Action('WEST');
	}
}

/*
Learning Variable
*/
var _Q = function(number_of_states, number_of_actions, grid_x, grid_y, initial_state) {
	this.gridX = grid_x;
	this.gridY = grid_y;
	this.numberOfStates = number_of_states;
	this.listOfValues = getZerosMatrix(number_of_states, number_of_actions, -0.05, 0.05);
	this.currentState = initial_state;
}

_Q.prototype.print = function(values) {
	//console.log(this.listOfValues);
}

_Q.prototype.getList = function(values) {
	return this.listOfValues;
}

_Q.prototype.initialize = function(values) {
	this.listOfValues = values;
}

_Q.prototype.getCurrentState = function() {
	return this.currentState;
}

_Q.prototype.updateCurrentState = function(action) {
	var addX = action.x;
	var addY = action.y;

	var wind = this.checkWind();
	this.currentState.x += addX;
	this.currentState.y += addY + wind

	if(this.currentState.x>=this.gridX) {
		this.currentState.x = this.gridX - 1;
	}

	if(this.currentState.y>=this.gridY) {
		this.currentState.y = this.gridY - 1;
	}

	if(this.currentState.x<0) {
		this.currentState.x = 0;
	}

	if(this.currentState.y<0) {
		this.currentState.y = 0;
	}

	return this;
}

_Q.prototype.goToState = function(state) {
	this.currentState = state;
}

_Q.prototype.getValue = function(state, action) {
	var x = state.x;
	var y = state.y;
	var coordID = getCoordinateID(x, y, this.gridX);
	var actionID = action.id();
	return this.listOfValues[coordID][actionID];
}

_Q.prototype.updateValue = function(state, action, newValue) {
	var x = state.x;
	var y = state.y;
	var coordID = getCoordinateID(x, y, this.gridX);
	var actionID = action.id();
	this.listOfValues[coordID][actionID] = newValue;
}

_Q.prototype.checkWind = function() {
	var x = this.currentState.x;
	var y = this.currentState.y;

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

_Q.prototype.isTerminal = function() {
	var x = this.currentState.x;
	var y = this.currentState.y;

	if((x==7) && (y==3)){
		//console.log('TERMINAL');
		return true;
	} else {
		return false;
	}
	
}

_Q.prototype.reward = function() {
	var x = this.currentState.x;
	var y = this.currentState.y;

	if((x==7) && (y==3)){
		return 0;
	} else {
		return -1;
	}
	
}

_Q.prototype.getBestAction = function() {
	var x = this.currentState.x;
	var y = this.currentState.y;
	var coordID = getCoordinateID(x, y, this.gridX);
	var max = this.listOfValues[coordID].max();
	//console.log(max);
	var index = this.listOfValues[coordID].indexOf(max);
	//console.log(indexes);
	var action = new _Action().getById(index);
	//action.print();
	return action;
}

_Q.prototype.printMap = function() {
	var state = this.currentState;
	var x = state.x;
	var y = state.y;
	var coordID = getCoordinateID(x, y);
	for(var i = 0; i<this.gridY; i++) {
		for(var j = 0; j<this.gridX; j++) {
			if(state.x == j && state.y == i){
				//process.stdout.write('  1  ');
			} else {
				//process.stdout.write('  0  ');
			}
		}
		//console.log('')
	}
}

_Q.prototype.getFinalResultMoves = function() {
	var state = new _State(0, 4);
	this.goToState(state);

	var arr = [];
	while(!this.isTerminal()) {
		action = this.getBestAction();
		this.updateCurrentState(action);
		arr.push(action.direction);
	}
	return arr;
}

/*
Aux functions
*/

function getRandomMatrix(nRows, nColumns, minValue, maxValue) {
	var arr = []
	for(var i = 0; i<nRows; i++) {
		aux = []
		for(var j = 0; j<nColumns; j++) {
			var el = (Math.random()*(maxValue - minValue)) + minValue;
			aux.push(el);
		}
		arr.push(aux);
	}
	return arr
}

function getZerosMatrix(nRows, nColumns, minValue, maxValue) {
	var arr = []
	for(var i = 0; i<nRows; i++) {
		aux = []
		for(var j = 0; j<nColumns; j++) {
			var el = 0;
			aux.push(el);
		}
		arr.push(aux);
	}
	return arr
}

function getCoordinateID(x, y, grid_x) {
	return (x + y*grid_x)
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getAllIndexes(arr, val) {
    var indexes = [], i = -1;
    while ((i = arr.indexOf(val, i+1)) != -1){
        indexes.push(i);
    }
    return indexes;
}

function getRandomItem(items) {
	return items[Math.floor(Math.random()*items.length)];
}

Array.prototype.max = function() {
  return Math.max.apply(null, this);
};



