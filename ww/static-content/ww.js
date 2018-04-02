// Stage
// Note: Yet another way to declare a class, using .prototype.

function Stage(width, height, stageElementID){
	this.actors=[]; // all actors on this stage (monsters, player, boxes, ...)
	this.player=null; // a special actor, the player


	this.gameTime = 0; //score of the game
	// the logical width and height of the stage
	this.width=width;
	this.height=height;

	// the element containing the visual representation of the stage
	this.stageElementID=stageElementID;

	// take a look at the value of these to understand why we capture them this way
	// an alternative would be to use 'new Image()'
	this.blankImageSrc=document.getElementById('blankImage').src;
	this.monsterImageSrc=document.getElementById('monsterImage').src;
	this.playerImageSrc=document.getElementById('playerImage').src;
	this.boxImageSrc=document.getElementById('boxImage').src;
	this.wallImageSrc=document.getElementById('wallImage').src;
}

// initialize an instance of the game
Stage.prototype.initialize=function(){  //ALMOST DONE
	// Create a table of blank images, give each image an ID so we can reference it later
	var s="<table style='border:1px solid black;'>";
	for (var y=0; y<this.height; y++){
		s+="<tr>";
		for (var x=0; x<this.width;x++){
			s=s+'<td><img src="'+this.blankImageSrc+'" id="'+this.getStageId(x,y)+'"/></td>';
		}
		s+="</tr>";
	}
	// YOUR CODE GOES HERE
	s+="</table>";
	// Put it in the stageElementID (innerHTML)
	document.getElementById(this.stageElementID).innerHTML = s;
	// Add the player to the center of the stage
	var x = Math.floor(this.width/2);
	var y = Math.floor(this.height/2);
	this.setImage(x,y,this.playerImageSrc);
	this.player = new Player(x,y,this,this.playerImageSrc);

	//Adding actors

	this.addActor(this.player);



	// Add walls around the outside of the stage, so actors can't leave the stage
	for (var y=0; y<this.height; y++){
		if (y == 0 || y == this.height-1){ //top and bottom row
				for (var x=0; x<this.width; x++){
					this.setImage(x,y,this.wallImageSrc);
					this.addActor(new Wall(x,y,this,this.wallImageSrc));
				}
		} else {
			this.setImage(0,y,this.wallImageSrc);
			this.setImage(this.width - 1,y,this.wallImageSrc);
			this.addActor(new Wall(0,y,this,this.wallImageSrc));
			this.addActor(new Wall(this.width - 1, y, this, this.wallImageSrc));
		}
	}

	// Add some Boxes to the stage
	var boxLimit = (this.height * this.width) - this.height * 10;
	var count = 0;
	for (var i=0; i<boxLimit;i++){
			var x = Math.floor(Math.random()*this.height - 1) + 1;
			var y = Math.floor(Math.random()*this.width - 1) + 1;
			if (document.getElementById(this.getStageId(x,y)).src==this.blankImageSrc){
				this.setImage(x,y,this.boxImageSrc);
				this.addActor(new Box(x,y,this,this.boxImageSrc));
				count += 1;
			}
	}
	console.log("box count: " + count);
	console.log("possibilites: " + boxLimit);

	// Add in some Monsters
	var monsterCount = 0;
	var monsterLimit = (this.height * this.width) / (this.height * this.width / 10);

	for (var i=0;i<monsterLimit;i++){
		var x = Math.floor(Math.random()*this.height - 1) + 1;
		var y = Math.floor(Math.random()*this.width - 1) + 1;
		if (document.getElementById(this.getStageId(x,y)).src==this.blankImageSrc){
			this.setImage(x,y,this.monsterImageSrc);
			this.addActor(new Monster(x,y,this,this.monsterImageSrc));
			monsterCount += 1;
		}
	}
	console.log("monster count: " + monsterCount);
	console.log("possibilites: " + monsterLimit);
	document.getElementById('time').innerHTML = this.gameTime;

}
// Return the ID of a particular image, useful so we don't have to continually reconstruct IDs
Stage.prototype.getStageId=function(x,y){
	return "stage_"+x+"_"+y;
}

Stage.prototype.addActor=function(actor){ //DONE
	this.actors.push(actor);
}

Stage.prototype.removeActor=function(actor){ //DONE
	// Lookup javascript array manipulation (indexOf and splice).
	var index = this.actors.indexOf(actor);
	if (index > -1) {
		this.actors.splice(index, 1);
	}
}


// Set the src of the image at stage location (x,y) to src -- DONE
Stage.prototype.setImage=function(x, y, src){
		document.getElementById(this.getStageId(x,y)).src=src;
}


Stage.prototype.monsterCount=function(){
	var monsterCount = 0;
	for (var i=0;i<this.actors.length;i++){
				if (this.actors[i] instanceof Monster){
					monsterCount += 1;
				}
	}
	return monsterCount;
}

// Take one step in the animation of the game.
Stage.prototype.step=function(){
	if (this.player==null){//lose case scenario;
			return false;
	}else if(this.monsterCount() == 0){ //winning scenario
			return true;
	}
	for(var i=0;i<this.actors.length;i++){
		//step for actors
		this.actors[i].step();
	}
	this.gameTime++;
	document.getElementById('time').innerHTML = this.gameTime;
	//update html for time

}


// return the first actor at coordinates (x,y) return null if there is no such actor
// there should be only one actor at (x,y)!
Stage.prototype.getActor=function(x, y){
	actor = null;
	for (var i = 0; i <this.actors.length;i++){
		if(this.actors[i].x == x && this.actors[i].y == y){
			actor = this.actors[i];
		}
	}
	return actor;
}




//moves Player
Stage.prototype.movePlayer=function(x,y){
	this.player.move(this.player,x,y);
}


//ACTOR SUPER CLASS
function Actor(x,y,stage,src){
	this.x = x;
	this.y = y;
	this.stage = stage;
	this.src = src;
}

Actor.prototype.step=function(){
	return;
}

Actor.prototype.move=function(newX,newY){
	this.stage.setImage(this.x,this.y, this.stage.blankImageSrc);
	this.x = newX;
	this.y = newY;
	this.stage.setImage(this.x, this.y, this.src);
}

//END ACTOR SUPER CLASS

function Player(x,y,stage,src){
	Actor.call(this,x,y,stage,src);
}

Player.prototype = Object.create(new Actor());

//Move Player -- DONE
Player.prototype.move=function(actor,x,y){ //true if move was made, false otherwise
	var newCoord = [this.x + x, this.y + y];
	if (actor instanceof Monster){
		this.stage.setImage(this.x,this.y,this.stage.blankImageSrc);
		this.stage.removeActor(this.stage.player);
		this.stage.player = null;
		return true;
	} else{
		var nearActor = this.stage.getActor(newCoord[0],newCoord[1]);
			if (nearActor instanceof Monster){
				this.stage.setImage(this.x,this.y,this.stage.blankImageSrc);
				this.stage.removeActor(this.stage.player);
				this.stage.player = null;
				return false;
			} else if(nearActor == null || nearActor.move(this,x,y)){
				Actor.prototype.move.call(this,newCoord[0],newCoord[1]);
				return true;
			} else {
				return false;
			}
	}
}


//connecting to the super class


function Box(x,y,stage,src){
		Actor.call(this,x,y,stage,src);
}

Box.prototype = Object.create(new Actor());

Box.prototype.move=function(actor,x,y){
	var newCoord = [this.x + x, this.y + y];
	var nearActor = this.stage.getActor(newCoord[0],newCoord[1]);

	if ((actor instanceof Player || actor instanceof Box) && (nearActor == null || nearActor.move(this,x,y))){
		Actor.prototype.move.call(this,newCoord[0],newCoord[1]);
		return true;
	} else {
		return false;
	}
}


function Wall(x,y,stage,src){
	Actor.call(this,x,y,stage,src);
}

Wall.prototype = Object.create(new Actor());


Wall.prototype.move=function(actor,x,y){
	return false;
}



//Monster Class
function Monster(x,y,stage,src){
	Actor.call(this,x,y,stage,src);
	this.xPossible = [-1, 0, 1, -1, 1, -1, 0, 1];
	this.yPossible = [-1, -1, -1, 0, 0, 1, 1, 1];
}

Monster.prototype = Object.create(new Actor());


Monster.prototype.step=function(){
	if (this.isDead()==true){
		this.stage.setImage(this.x,this.y,this.stage.blankImageSrc);
		this.stage.removeActor(this);
	} else {
		var canMove = false;
		while (canMove == false){
			var newMove = Math.floor(Math.random() * 8);
			var actor = this.stage.getActor(this.x + this.xPossible[newMove], this.y + this.yPossible[newMove]);
			if (!(actor instanceof Box || actor instanceof Monster || actor instanceof Wall)){
				this.move(this, this.xPossible[newMove], this.yPossible[newMove]);
				canMove = true;
			}
		}
	}
}

Monster.prototype.move=function(actor,x,y){
	if(!(actor === this)){
		return false;
	}
	var newCoord = [this.x + x,this.y + y];
	var nearActor = this.stage.getActor(newCoord[0],newCoord[1]);
	if (nearActor == null  || nearActor.move(this,x,y)){
		Actor.prototype.move.call(this,newCoord[0],newCoord[1]);
		return true;
	} else {
		return false;
	}
}

Monster.prototype.isDead=function(){ // -- COMPLETE
	var surroundingActors = 0;
	var i = 0;
	for (var i = 0;i<this.xPossible.length;i++){
		exists = this.stage.getActor(this.x + this.xPossible[i], this.y + this.yPossible[i]);
		if (exists instanceof Box || exists instanceof Wall || exists instanceof Monster){
				surroundingActors += 1;
		}
	}
	if (surroundingActors == 8){
		return true;
	} else {
		return false;
	}
}
