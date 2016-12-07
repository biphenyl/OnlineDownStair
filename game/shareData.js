
var playerList = new Array(20).fill(false);

var sentCharacters = new Array(20);

var sentPlatforms = new Array();

function sentCharacter()
{
	this.id = -1;
    this.name = "";
    this.x = 0;
    this.y = 0;

    this.vx = 0;
    this.vy = 0;

    this.hp = 10;
    this.score = 0;
    this.face = -1;

    this.keyState = 0;
    this.uuid = 0;
}

function sentPlatform()
{
    this.id = -1;
    
    this.x = 0;
    this.y = 0;
    
    this.type = -1;
}