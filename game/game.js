$(document).ready(function(){

const gameWidth = 2000;
const gameHeight = 600;

const upBound = 25;
const leftBound = 0;
const rightBound = 2000;

const platformWidth = 250;
const platformHeight = 32;
const platformUpSpeed = -120;

const playerHeight = 48;
const playerWidth = 32;
const playerSpeedX = 200;
const playerGravity = 400;

const maxHp = 10;

var touchOn = false;
var windowWidth = $(window).width();
var windowHeight = $(window).height();

var game = new Phaser.Game(windowWidth, gameHeight, Phaser.AUTO, 'room', { preload: preload, create: create, update: update , render: render});
// scale
function myScale() {
    var r;
    windowWidth = $(window).width();
    windowHeight = $(window).height();
    if (windowHeight < gameHeight) {
        r = windowHeight / gameHeight;
        if (r < 0.5)
            r = 0.5;
    }else
        r = 1;
    game.scale.setGameSize(windowWidth / r, gameHeight);
    game.scale.setUserScale(r, r, 0, 0);
    console.log('changing canvas size');
}
function preload() {

    game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
    game.scale.setResizeCallback(myScale);
    game.stage.disableVisibilityChange = true;

    game.load.image('sky', 'assets/background/inner.png');
    game.load.image('platformGreen', 'assets/platform/platformGreen.png');
    game.load.image('platformSpike', 'assets/platform/platformSpike.png');
    game.load.spritesheet('platformLeft', 'assets/platform/platformLeft.png', 284, 45);
    game.load.spritesheet('platformRight', 'assets/platform/platformRight.png', 284, 45);
    game.load.image('platformJump', 'assets/platform/platformJump.png');

    game.load.image('topSpike', 'assets/background/topSpike.png');

    game.load.spritesheet('dude1', 'assets/guys/guy1.png', 32, 48);
    game.load.spritesheet('dude2', 'assets/guys/guy2.png', 32, 48);
    game.load.spritesheet('dude3', 'assets/guys/guy3.png', 32, 48);
    game.load.spritesheet('dude4', 'assets/guys/guy4.png', 32, 48);
    game.load.spritesheet('dude5', 'assets/guys/guy5.png', 32, 48);
    game.load.spritesheet('dude6', 'assets/guys/guy6.png', 32, 48);
    game.load.spritesheet('dude7', 'assets/guys/guy7.png', 32, 48);
    game.load.spritesheet('dude8', 'assets/guys/guy8.png', 32, 48);
    game.load.spritesheet('dude9', 'assets/guys/guy9.png', 32, 48);
    game.load.spritesheet('dude10', 'assets/guys/guy10.png', 32, 48);

    game.load.spritesheet('hp', 'assets/HP/hpBar2.png', 32, 10);


}

var userID;
var playerCount = MAX_PLAYER;

// characters is our array store our data(hp, score...etc), players is a phaser group that do physic thing
var characters = new Array(MAX_PLAYER);
var players;
var localPlayerList = new Array(MAX_PLAYER).fill(false);


// stairs is our array store our data(type), platforms is a phaser group that do physic thing
var stairs = new Array();
var platforms;
var platformName = ["platformGreen", "platformSpike", "platformLeft", "platformRight", "platformJump"];

var cursors;
var ground;
var background;

var graphics;

var stars;
var score = 0;
var scoreText;
var lastPlatformX = 0;
var reviveCounter = -1;
var reviveEvent;
var lastKeyStatus;
var guyName = ["dude1", "dude2", "dude3", "dude4", "dude5", "dude6", "dude7", "dude8", "dude9", "dude10"];

var hpBar;

var counter;
var platformUuid = 0;

// constructor of character class(?)
function character(newID, newName, posX, posY)
{
    this.id = newID;
    this.name = newName;

    this.player = players.create(posX, posY, guyName[newID % 10]);
    initPlayer(this.player);

    //set text's center at top of player
    this.nameText = game.add.text(0, this.player.y - 16, this.name, { fontSize: '16px', fill: '#000' })
    this.nameText.x = this.player.centerX - this.nameText.width / 2;
    this.nameText.stroke = '#FFFFFF';
    this.nameText.strokeThickness = 4;

    this.hp = 10;
    this.lastHp = 10;

    this.score = 0; 
    
    // select what character looks like
    this.face = 0;

    // status of character, -1 as flying(not on platform), and postive number is which platform this character stand on
    this.spikeState = 0;
    this.onPlatform = false;
    this.status = 0;
    this.keyState = 0;
    this.uuid = 0;
}

function stair(x, newType)
{   
    //console.log("new type is " + newType); 
    
    this.platform = platforms.create(x, game.height, platformName[newType]);
    this.platform.scale.setTo(platformWidth/this.platform.width, platformHeight/this.platform.height);

    if(newType==2 || newType==3)
    {
        console.log("create a rolling floor");
        this.platform.animations.add('rolling', [0, 1], 5, true);
        this.platform.animations.play('rolling');

    }
    
    this.type = newType;

    initPlatform(this.platform);
}


/* PHASER FUNCTIONS */
function create() {
    
    /* WORLD */

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    background = game.add.sprite(0, 0, 'sky');
    background.scale.setTo(gameWidth/background.width, gameHeight/background.height);

    game.world.setBounds(0, 0, gameWidth, game.height);


    graphics = game.add.graphics(0, 0);
    game.stage.backgroundColor = "#FFFFFF";

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();
    platforms.enableBody = true;

    createFirstMap();

    /* PLAYER */
    players = game.add.group();

    // there should be an inputed name
    name = my.name;
    
    // wait sever give it an id and game info (if not the first player)
    userID = my.id;
    console.log("I'm " + name + " , id: " + userID);
    

    // setup player
    characters[userID] = new character(userID, name, 32, game.world.height - game.height / 4);
    playerList[userID] = true;

    hpBar = game.add.sprite(characters[userID].player.x, characters[userID].player.y-26, 'hp');
    hpBar.frame = maxHp - 1;

    localPlayerList[userID] = true;
    scoreText = game.add.text(16, 48, 'Score: 0', { fontSize: '32px', fill: '#000' });
    scoreText.fixedToCamera = true;

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();
    
    platforms.forEach(function(item)
    {
        item.body.velocity.y = platformUpSpeed;
    })

    game.time.events.loop(Phaser.Timer.SECOND * 0.03, mainLoop, this);

    game.camera.follow(characters[userID].player, Phaser.Camera.FOLLOW_LOCKON, 0.05, 0.1);

    lastKeyStatus = 0;
    drawBound();

    for(i=0; i<MAX_PLAYER; i++)
    {
        if(playerList[i]==true && localPlayerList[i]==false)
            playerJoin(i);
    }

    var topSpike = game.add.sprite(0, 0, 'topSpike');

}

function update() {

    if(platformUuid!=newPlatform.uuid)
    {
        //console.log("local uuid is" + platformUuid + " app uuid is " + newPlatform.uuid);
        createNewPlatform(newPlatform.x, newPlatform.type);
        platformUuid = newPlatform.uuid;
    }


    for(i=0; i<playerCount; i++)
    {
        if(playerList[i]==true && localPlayerList[i]==false)
            playerJoin(i);
        if(playerList[i]==false && localPlayerList[i]==true)
            playerLeave(i);
    }

    // updata other players data
    for(i=0; i<playerCount; i++)
    {
        if(localPlayerList[i]==false || i==userID)
            continue;

        if(characters[i].uuid!=sentCharacters[i].uuid)
        {   
            /*
            console.log("sync id:" + i);
            console.log(sentCharacters[i].uuid); 
            */
            sentToLocal(i);
        }
    }
    
    //  Collide the player and the stars with the platforms , when a platform too high to  player stand on it without beyond the upBound, it can be pass through 
    //each player should collide
    game.physics.arcade.collide(players);

    //  Reset the players velocity (movement)
    
    players.forEach(function(item){
        item.body.velocity.x = 0;
    })

    if(!touchOn)
    {
        if(game.input.pointer1.isDown)
            touchOn = true;
    }

    if(!touchOn)
    {
        if(cursors.left.isDown)
            characters[userID].keyState = -1;
        else if(cursors.right.isDown)
            characters[userID].keyState = 1;
        else 
            characters[userID].keyState = 0;
    }
    else
    {
        var nowPointer;
        if(!game.input.pointer1.isDown && game.input.pointer2.isDown)
            now_pointer = game.input.pointer2;
        else
            now_pointer = game.input.pointer1;

        if(now_pointer.isDown)
        {
            if(now_pointer.worldX < characters[userID].player.x)
                characters[userID].keyState = -1;
            else
                characters[userID].keyState = 1;
        }
        else
            characters[userID].keyState = 0;
    }

    if (characters[userID].keyState == -1)
    {
        //  Move to the left
        characters[userID].player.body.velocity.x = -playerSpeedX;
        //characters[userID].player.animations.play('left');
    }
    else if(characters[userID].keyState == 1)
    {
        //  Move to the right
        characters[userID].player.body.velocity.x = playerSpeedX;
        //characters[userID].player.animations.play('right');
    }
    else if(characters[userID].keyState == 0)
    {
        //  Stand still
        characters[userID].player.body.velocity.x = 0;
    }
    
    for(i=0; i<playerCount; i++)
    {
        if(localPlayerList[i]==false || i==userID)
            continue;

        characters[i].player.body.velocity.x = characters[i].keyState * playerSpeedX;
    }

    
    for(i=0; i<playerCount; ++i)
    {
        if(localPlayerList[i] == false)
            continue;

        characters[i].onPlatform = false;
        platforms.forEach(function(item)
        {
            if(item.top > playerHeight)
            {
                //console.log("I count to " + i);
                counter = i;
                game.physics.arcade.collide(characters[i].player, item, standOnPlatform, null, this);
            }
        });
    }

    for(i=0; i<playerCount; ++i)
    {
        if(localPlayerList[i] == false)
            continue;
        
        //Let ID follow player
        if(characters[i].player.alive)
        {
            characters[i].nameText.x = characters[i].player.centerX - characters[i].nameText.width/2;
            characters[i].nameText.y = characters[i].player.y - 16;

            if(i == userID)
            {
                hpBar.x = characters[i].player.x;
                hpBar.y = characters[i].player.y-26;

                hpBar.frame = characters[i].hp - 1;
            }
        }
    }
    
    for(i=0; i<playerCount; i++)
    {
        if(localPlayerList[i] == false)
            continue;

        player = characters[i].player;
        if(player.y < upBound)
        {   
            player.y = upBound;
            player.body.velocity.y = 0;

            // hurt detection
            if(characters[i].spikeState==0)
            {
                characters[i].hp-=3;
                characters[i].spikeState = 1
                console.log("hurt by top spike!");
            }
            
            if(characters[i].hp <= 0 && characters[i].player.alive )
            {
                playerDie(i);
            }
            
            
        }
        else if(characters[i].spikeState == 1)
            characters[i].spikeState = 0;
        
        if(player.body.left < 0)
        {
            player.x = 0;
            player.body.velocity.x = 0;
        }

        if(player.body.right > gameWidth)
        {
            player.x = gameWidth - player.width;
            player.body.velocity.x = 0;
        }

    }
    
    // Let scoreText always at left-top
    //scoreText.x = game.camera.x + 16;
    //scoreText.y = game.camera.y + 16;     

    // remove the platforms that over top
    platforms.forEach(function(item)
    {
        if(item.top <= -platformHeight)
        {   
            platforms.remove(item);
            stairs.shift();
            for(i=0; i<playerCount; i++)
            {
                if(localPlayerList[i] == false)
                    continue;

                if(characters[i].status >= 0)
                    characters[i].status--;
            }
        }
    })

    //die event
    for(i=0; i<playerCount; i++)
    {
        if(localPlayerList[i] == false)
            continue;

        player = characters[i].player;
        if((player.y > game.height) && player.alive)
            playerDie(i);
        
    }
    
    for(i=0; i<playerCount; ++i)
    {
        if(localPlayerList[i]==false)
            continue;

        if(characters[i].keyState == 1)
            characters[i].player.animations.play("right");
        else if(characters[i].keyState == -1)
            characters[i].player.animations.play("left");
        else if(characters[i].keyState == 0)
        {
            if(characters[i].onPlatform)
            {
                characters[i].player.animations.stop();
                characters[i].player.frame = 4;
            }
            else
                characters[i].player.animations.play("flying");
        }

    }

    /*
    for(i=0; i<playerCount; i++)
    {
        if(localPlayerList[i] == false)
            continue;
        
        for(j=0; j<playerCount; j++)
        {
            if(i==j || localPlayerList[j] == false)
                continue;    
            avoidStack(characters[i].player, characters[j].player);
        }
    }
    */

    if(playerList[userID] == true)
        localToSent(userID);
    
    if(lastKeyStatus != characters[userID].keyState)
    {
        posUpdate(sentCharacters[i]);
        lastKeyStatus = characters[userID].keyState;
    }

}

function render()
{
    //game.debug.pointer(game.input.pointer1);
}
/*
function onTouchStart(event)
{
    event.preventDefault();
    if(event.pageX < windowWidth/2)
        characters[userID].keyState = -1;
    else if(event.pageX >= windowWidth/2)
        characters[userID].keyState = 1;

}


function onTouchMove(event)
{
    event.preventDefault();
    if(event.changedTouches[0].pageX < windowWidth/2)
        characters[userID].keyState = -1;
    else if(event.changedTouches[0].pageX >= windowWidth/2)
        characters[userID].keyState = 1; 
}

function onTouchEnd(event)
{
    event.preventDefault();
    characters[userID].keyState = 0; 
}
*/
function standOnPlatform(player, platform)
{
    //should count your own
    //player = characters[userID].player;

    platformID = platforms.getChildIndex(platform);
    stairType = stairs[platformID].type;
    if(player.bottom <= platform.top)   //avoid side collision 
    {
        if(counter == userID && platformID != characters[i].status)
        {
            characters[userID].score += 1;
            scoreText.text = "Score: " + characters[userID].score;
        }

        
        if(stairType == 0)
        {
            if(platformID != characters[counter].status)
            {
                characters[counter].hp += 3;
                if(characters[counter].hp > 10)
                    characters[counter].hp = 10;
            }
        }
        else if(stairType == 1)
        {
            if(platformID != characters[counter].status)
            {
                characters[counter].hp -= 3;
                if(characters[counter].hp <= 0 && characters[i].player.alive)
                    playerDie(counter);   
            }
        }
        else if(stairType == 2) //left
        {
            /*
            if(player.body.velocity.x == -playerSpeedX)
                player.body.velocity.x -= 100;
            else if(player.body.velocity.x == playerSpeedX)
                player.body.velocity.x += 100;
            else
                player.body.velocity.x -= 100;
            */
            characters[counter].player.body.velocity.x -= 100;

            if(platformID != characters[counter].status)
            {
                if(characters[counter].hp+1 <= 10)
                    characters[counter].hp++;
            }
        }
        else if(stairType == 3) //right
        {
            /*
            if(player.body.velocity.x == playerSpeedX)
                player.body.velocity.x += 100;
            else if(player.body.velocity.x == -playerSpeedX)
                player.body.x -= 100;
            else
                player.body.x += 100;
            */
            characters[counter].player.body.velocity.x += 100;

            if(platformID != characters[counter].status)
            {
                if(characters[counter].hp+1 < 10)
                    characters[counter].hp++;
            }
        }
        else if(stairType == 4)
        {
            player.body.velocity.y = -game.height / 2;

            if(platformID != characters[counter].status)
            {
                if(characters[counter].hp < 10)
                    characters[counter].hp++;
            }
        }


        characters[counter].status = platformID;
        characters[counter].onPlatform = true;
    }
}


function createFirstMap()
{
    
    var ledge = new stair(400, 0);
    stairs.push(ledge);
    ledge.platform.y = 400;
    ledge.platform.body.immovable = true;

    ledge = new stair(-150, 0);
    stairs.push(ledge);
    ledge.platform.y = 250;
    ledge.platform.body.immovable = true;

    ledge = new stair(0, 0);
    stairs.push(ledge);
    ledge.platform.y = game.world.height - 64;
    ledge.platform.body.immovable = true;
}

function createMap()
{
    //count platform number

    //create them all
}

function createNewPlatform(newPlatformX, newType)
{
    //listen server for new platform
    /*
    newPlatformX = Math.random() * (gameWidth - platformWidth);
    while(newPlatformX < lastPlatformX + platformWidth && newPlatformX > lastPlatformX - platformWidth)
        newPlatformX = Math.random() * (gameWidth - platformWidth);

    newType = Math.floor((Math.random() * 5));
    */
    stairs.push(new stair(newPlatformX, newType));
    lastPlatformX = newPlatformX;

}

function mainLoop()
{
    //render everyone's position
    //send keyboard status
}

/* DRWA PRETTY BOUND */

function drawBound()
{
    graphics.lineStyle(5, 0x1111FF, 1);
    graphics.drawRect(0, 0, gameWidth, game.height);
}

/* Resurrection of player after die three second */

function reviveCount()
{

    reviveCounter -= 1;
    scoreText.text = "Revive in " + reviveCounter + " sec...";

    player = characters[userID].player;

    if(reviveCounter == 0)
    {
        player.revive();
        player.x = lastPlatformX + 150;
        player.y = game.height / 2;
        player.body.velocity.y = 0;

        game.time.events.remove(reviveEvent);
        scoreText.text = "Score: 0";

        game.camera.follow(characters[userID].player, Phaser.Camera.FOLLOW_LOCKON, 0.05, 0.1);
    }
}


function playerDie(playerID)
{
    // kill part
    player = characters[playerID].player;
    player.y = game.height;
    player.kill();
     
    console.log("player " + characters[i].name + " die~");

    //make id invisable
    characters[playerID].nameText.x = -100;
    characters[playerID].nameText.y = -100;

    // revive part
    characters[playerID].hp = 10;
    characters[playerID].score = 0;
    if(playerID == userID)
        scoreText.text = "Score: 0";
    
    characters[playerID].player.x = lastPlatformX + 150;
    characters[playerID].player.y = game.height / 2;
    characters[playerID].player.body.velocity.y = 0;

    player.revive();
    
}

/* PLAYER JOIN AND LEAVE */

function playerJoin(newPlayerID)
{
    if(playerCount > MAX_PLAYER)
    {
        // if player number is over 20, refuse it
        return;
    }

    //wait server give its info
    var newCharacter = sentCharacters[newPlayerID];
    console.log("a new comer " + newPlayerID);
    var newPlayerName = newCharacter.name;

    // setup new player
    characters[newPlayerID] = new character(newPlayerID, newPlayerName, lastPlatformX, newCharacter.y);

    //player.body.collideWorldBounds = true;

    localPlayerList[newPlayerID] = true;
}

function playerLeave(leavePlayerID)
{
    console.log(leavePlayerID + " is leaving");
    
    // remove form players group and characters array
    players.remove(characters[leavePlayerID].player);
    characters[leavePlayerID].nameText.destroy();

    localPlayerList[leavePlayerID] = false;
}

/* INITIALIZE FUNCTOINS */

function initPlayer(player)
{
    game.physics.arcade.enable(player);
    player.body.gravity.y = playerGravity;

    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);
    player.animations.add('flying', [9, 10, 11], 10, true);
}

function initPlatform(platform)
{
    platform.body.immovable = true;
    platform.body.velocity.y = platformUpSpeed;
}

function avoidStack(player1, player2)
{
    // use to saperate two player object away, 
    // basically very annoying and complex algorithm, don't need to dig in it
    x11 = player1.left;
    x12 = player1.right;
    x21 = player2.left;
    x22 = player2.right;

    y11 = player1.top;
    y12 = player1.bottom;
    y21 = player2.top;
    y22 = player2.bottom;

    /*
    if(y11 == y22)
    {
        console.log("p1 at " + y11 + " to " + y12);
        console.log("p2 at " + y21 + " to " + y22);
    }
    */
    offset = 0;
    if(x11-offset > x21 && x11+offset < x22)
    {
        centerX = (x11 + x22) / 2;
        if(y11-offset > y21 && y11+offset < y22)
        {
            centerY = (y11 + y22) / 2;
            moveX = centerX - x21;
            moveY = centerY - y22;

            player1.x -= moveX;
            //player1.y -= moveY;
            player2.x += moveX;
            //player2.y += moveY;
            //console.log("we move them " + moveX);
        }
        else if(y21-offset > y11 && y21+offset < y12)
        {
            centerY = (y21 + y12) / 2;
            moveX = centerX - x12;
            moveY = centerY - y12;

            player1.x += moveX;
            //player1.y += moveY;
            player2.x -= moveX;
            //player2.y -= moveY;
            //console.log("we move them " + moveX);
        }
    }
    else if(x21-offset > x11 && x21+offset < x12)
    {
        centerX = (x21 + x12) /2;
        if(y11-offset > y21 && y11+offset < y22)
        {
            centerY = (y11 + y22) / 2;
            moveX = centerX - x22;
            moveY = centerY - y22;

            player1.x -= moveX;
            //player1.y -= moveY;
            player2.x += moveX;
            //player2.y += moveY;
            //console.log("we move them " + moveX);
        }
        else if(y21-offset > y11 && y21+offset < y12)
        {
            centerY = (y21 + y12) / 2;
            moveX = centerX - x11;
            moveY = centerY - y12;

            player1.x += moveX;
            //player1.y += moveY;
            player2.x -= moveX;
            //player2.y -= moveY;
            //console.log("we move them " + moveX);
        }
    }
    else if(game.math.difference(x11, x21) < offset  && game.math.difference(y11, y21) < offset)
    {
        player1.x -= player1.width/2;
        player2.x += player2.width/2;
    }    
}

/* TRANFORM FROM LOCAL DATA TO SENT DATA */

function localToSent(ltsID)
{
    // pass characters data from game.js to shareData.js
    sentCharacters[ltsID].x = characters[ltsID].player.x;
    sentCharacters[ltsID].y = (characters[ltsID].player.y);

    sentCharacters[ltsID].vx = characters[ltsID].player.body.velocity.x;
    sentCharacters[ltsID].vy = (characters[ltsID].player.body.velocity.y);

    sentCharacters[ltsID].hp = characters[ltsID].hp;
    sentCharacters[ltsID].score = characters[ltsID].score;
    sentCharacters[ltsID].face = -1;

    sentCharacters[ltsID].keyState = characters[ltsID].keyState;
    sentCharacters[ltsID].uuid = characters[ltsID].uuid;
}

function sentToLocal(stlID)
{
    // pass characters from shareData.js/app.js to game.js
    
    offset = 6;
    if(game.math.difference(sentCharacters[stlID].x, characters[stlID].player.x) > offset)
        characters[stlID].player.x = sentCharacters[stlID].x;
    if((sentCharacters[stlID].vy) != platformUpSpeed)
        characters[stlID].player.y = (sentCharacters[stlID].y);
    

    characters[stlID].player.body.velocity.x = sentCharacters[stlID].vx;
    characters[stlID].player.body.velocity.y = (sentCharacters[stlID].vy);

    characters[stlID].hp = sentCharacters[stlID].hp;
    characters[stlID].score = sentCharacters[stlID].score;
    characters[stlID].face = -1;

    characters[stlID].keyState = sentCharacters[stlID].keyState;
    characters[stlID].uuid = sentCharacters[stlID].uuid;
}
});
