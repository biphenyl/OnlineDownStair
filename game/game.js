
const gameWidth = 2000;
const gameHeight = 600;

const upBound = 0;
const leftBound = 0;
const rightBound = 2000;

const platformWidth = 300;
const platformHeight = 64;
const platformUpSpeed = -120;

const playerHeight = 48;
const playerWidth = 32;
const playerSpeedX = 200;
const playerGravity = 400;

const maxHp = 10;

var windowWidth = $(window).width();
var game = new Phaser.Game(windowWidth, gameHeight, Phaser.AUTO, '', { preload: preload, create: create, update: update , render: render});

function preload() {

    game.load.image('sky', 'assets/background/inner.png');
    game.load.image('platformGreen', 'assets/platform/platformGreen.png');
    game.load.image('platformGray', 'assets/platform/platformGray.png');
    game.load.image('platformLeft', 'assets/platform/platformLeft.png');
    game.load.image('platformRight', 'assets/platform/platformRight.png');
    game.load.image('platformOrange', 'assets/platform/platformOrange.png');
    game.load.image('star', 'assets/star.png');
    game.load.spritesheet('dude1', 'assets/guys/guy1.png', 32, 48);
    game.load.spritesheet('dude2', 'assets/guys/guy2.png', 32, 48);

    game.load.image('hp1', 'assets/HP/hp1.png');
    game.load.image('hp2', 'assets/HP/hp2.png');
    game.load.image('hp3', 'assets/HP/hp3.png');
    game.load.image('hp4', 'assets/HP/hp4.png');
    game.load.image('hp5', 'assets/HP/hp5.png');
    game.load.image('hp6', 'assets/HP/hp6.png');
    game.load.image('hp7', 'assets/HP/hp7.png');
    game.load.image('hp8', 'assets/HP/hp8.png');
    game.load.image('hp9', 'assets/HP/hp9.png');
    game.load.image('hp10', 'assets/HP/hp10.png');

}

var userID;
var playerCount = 1;

// characters is our array store our data(hp, score...etc), players is a phaser group that do physic thing
var characters = new Array(20);
var players;

// stairs is our array store our data(type), platforms is a phaser group that do physic thing
var stairs = new Array();
var platforms;
var platformName = ["platformGreen", "platformGray", "platformLeft", "platformRight", "platformOrange"];

var cursors;
var ground;
var background;

var graphics;

var stars;
var score = 0;
var scoreText;
var idText;
var lastPlatformX = 0;
var reviveCounter = -1;
var reviveEvent;

// constructor of character class(?)
function character(newID, newName, posX, posY)
{
    this.id = newID;
    this.name = newName;
    
    if(this.id%2 == 0)    
        this.player = players.create(posX, posY, 'dude1');
    else
        this.player = players.create(posX, posY, 'dude2');
    initPlayer(this.player);

    //set text's center at top of player
    this.nameText = game.add.text(0, this.player.y - 16, this.name, { fontSize: '16px', fill: '#000' })
    this.nameText.x = this.player.centerX - this.nameText.width / 2;

    this.hp = 10;
    this.lastHp = 10;
    this.hpBar = game.add.image(this.player.x, this.player.y-26, 'hp10');

    this.score = 0; 
    
    // select what character looks like
    this.face = 0;

    // status of character, -1 as flying(not on platform), and postive number is which platform this character stand on
    this.standOn = 0;
}

function stair(x, newType)
{   
    //console.log("new type is " + newType); 
    
    this.platform = platforms.create(x, gameHeight, platformName[newType]);
    this.type = newType;

    initPlatform(this.platform);
}
//
function sentCharacter(id)
{
    this.id = id;
    this.name = characters[id].name;
    this.x = characters[id].player.x;
    this.y = characters[id].player.y;

    this.vx = characters[id].player.body.velocity.x;
    this.vy = characters[id].player.body.velocity.y;

    this.hp = characters[id].hp;
    this.score = characters[id].score;
    this.face = characters[id].face;
}

function create() {
    
    /* WORLD */

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    background = game.add.sprite(0, 0, 'sky');
    background.scale.setTo(gameWidth/background.width, gameHeight/background.height);

    game.world.setBounds(0, 0, gameWidth, gameHeight);

    graphics = game.add.graphics(0, 0);
    game.stage.backgroundColor = "#FFFFFF";

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();
    players = game.add.group();
    //

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Here we create the ground.
    ground = platforms.create(0, game.world.height - 64, 'platformGreen');

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    //ground.scale.setTo(2, 2);

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;
    //ground.body.velocity.y = -10;

    //  Now let's create two ledges
    var ledge = platforms.create(400, 400, 'platformGreen');
    ledge.body.immovable = true;
    //ledge.body.velocity.y = -10;

    ledge = platforms.create(-150, 250, 'platformGreen');
    ledge.body.immovable = true;
    //ledge.body.velocity.y = -10;

    /* PLAYER */

    // there should be an inputed name
    name = "1P";
    
    // wait sever give it an id and game info (if not the first player)
    userID = 0;
    
    // setup player
    characters[userID] = new character(userID, name, 32, game.world.height - 150);

    initPlayer(characters[userID].player);
    //  We need to enable physics on the player
    //game.physics.arcade.enable(characters[userID].player);

    //  Player physics properties. Give the little guy a slight bounce.
    //player.body.bounce.y = 0.2;
    //characters[userID].player.body.gravity.y = 400;
    //players.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    //characters[userID].player.animations.add('left', [0, 1, 2, 3], 10, true);
    //characters[userID].player.animations.add('right', [5, 6, 7, 8], 10, true);

    //  Finally some stars to collect
    //  The score
    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
    scoreText.fixedToCamera = true;

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();
    
    platforms.forEach(function(item)
    {
        item.body.velocity.y = platformUpSpeed;
    })

    game.time.events.loop(Phaser.Timer.SECOND * 1, createNewPlatform, this);
    game.time.events.loop(Phaser.Timer.SECOND * 0.03, mainLoop, this);

    game.time.events.loop(Phaser.Timer.SECOND * 5, playerJoin, this);

    game.camera.follow(characters[userID].player, Phaser.Camera.FOLLOW_LOCKON, 0.05, 0.1);

    drawBound();

}

function update() {

    /*
    game.physics.arcade.collide(players, topBound);
    game.physics.arcade.collide(players, leftBound);
    game.physics.arcade.collide(players, rightBound);
    */
    
    //  Collide the player and the stars with the platforms , when a platform too high to  player stand on it without beyond the upBound, it can be pass through 
    platforms.forEach(function(item){
        if(item.top > playerHeight)
        {
            for(i=0; i<playerCount; ++i)
                game.physics.arcade.collide(characters[i].player, platforms, standOnPlatform, null, this);
        }
    })

    //each player should collide
    game.physics.arcade.collide(players);

    for(i=0; i<playerCount; i++)
        for(j=0; j<playerCount; j++)
        {
            if(i==j)
                continue;    
            avoidStack(characters[i].player, characters[j].player);
        }
    
    /*
    for(i=0; i<playerCount; i++)
        for(j=i+1; j<playerCount; j++)
            game.physics.arcade.overlap(characters[i].player, characters[j].player, stars, avoidStack, null, this);
    */

    //game.physics.arcade.collide(stars, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    //game.physics.arcade.overlap(player, stars, collectStar, null, this);

    //  Reset the players velocity (movement)

    for(i=0; i<playerCount; ++i)
    {
        player = characters[i].player;
        
        player.body.velocity.x = 0;

        if (cursors.left.isDown)
        {
            //  Move to the left
            player.body.velocity.x = -playerSpeedX;
            player.animations.play('left');
        }
        else if (cursors.right.isDown)
        {
            //  Move to the right\
            player.body.velocity.x = playerSpeedX;
            player.animations.play('right');
            

        }
        else
        {
            //  Stand still
            player.animations.stop();

            player.frame = 4;
        }
        
        //jump
        /*
        if (cursors.up.isDown && player.body.touching.down)
        {
            player.body.velocity.y = -350;
        }
        */
        //Let ID follow player
        if(player.alive)
        {
            characters[i].nameText.x = player.centerX - characters[i].nameText.width/2;
            characters[i].nameText.y = player.y - 16;

            characters[i].hpBar.x = player.x;
            characters[i].hpBar.y = player.y-26;

            characters[i].hpBar.loadTexture('hp' + characters[i].hp);
        }
    }

    /*
    if(characters[userID].player.x > windowWidth/2 && characters[userID].player.x < gameWidth - (windowWidth/2))
    {
        cameraMove = characters[userID].player.deltaX;
        if(cameraMove > 5)
            cameraMove = 5;
        else if(cameraMove < -5)
            cameraMove = -5;
        
        game.camera.x += cameraMove;
    }
    */

    
    for(i=0; i<playerCount; i++)
    {
        player = characters[i].player;
        if(player.y < 0)
        {    
            player.y = 0;
            player.body.velocity.y = 0;
        }
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
      

    platforms.forEach(function(item)
    {
        if(item.top <= -64)
        {   
            platforms.remove(item);
            stairs.shift();
        }
    })


    //die event
    for(i=0; i<playerCount; i++)
    {
        player = characters[i].player;
        if((player.y > gameHeight) && player.alive)
         {  
            player.kill();
         
            console.log("player " + characters[i].name + " die~");

            //make id invisable
            characters[i].nameText.x = -100;
            characters[i].nameText.y = -100;

            characters[i].hpBar.x = -100;
            characters[i].hpBar.y = -100;



            // send message to server
            //let server handle the life and death

            if(i==userID)
            {
                player.hp = 0;
                player.score = 0;
                scoreText.text = "Revive in 3 sec";
                reviveEvent = game.time.events.loop(Phaser.Timer.SECOND * 1, reviveCount, this);
                reviveCounter = 3;

                game.camera.unfollow();
            }
            else
            {
                player.revive();
                player.x = lastPlatformX + 150;
                player.y = 300;
                player.body.velocity.y = 0;


            }
        }
    }

    //console.log("x is " + characters[userID].player.x);
}

function render()
{
    //game.debug.spriteCoords(player, 32, 500);
}

$(window).resize(function(){
    windowWidth = $(window).width();
    game.scale.setGameSize(windowWidth, gameHeight);
});

function standOnPlatform(player, platform)
{
    //should count your own
    player = characters[userID].player;
    if(player.y + player.body.height == platform.y)
    {
        score += 1;
        scoreText.text = "score: " + score;        
    }

}

function createMap()
{
    //count platform number

    //create them all
}

function createNewPlatform()
{
    //listen server for new platform
    newPlatformX = Math.random() * (gameWidth - platformWidth);
    while(newPlatformX < lastPlatformX + platformWidth && newPlatformX > lastPlatformX - platformWidth)
        newPlatformX = Math.random() * (gameWidth - platformWidth);

    newType = Math.floor((Math.random() * 5));
    stairs.push(new stair(newPlatformX, newType));

    lastPlatformX = newPlatformX;

    console.log(platforms.length);
    console.log(stairs.length);
}

function mainLoop()
{
    //render everyone's position
    //send keyboard status
}

function drawBound()
{
    graphics.lineStyle(5, 0xFF00FF, 1);
    graphics.drawRect(0, 0, gameWidth, gameHeight);
}

// don't use draw to display hp, I think
/*
function drawHp()
{
    for(int i=0; i<playerCount; i++)
    {
        player = character[i].player;
        
        graphics.lineStyle(2, 0x00000, 1);
        graphics.drawRect(player.x, player.y, player.height, player.width);
    }
}
*/

function reviveCount()
{
    reviveCounter -= 1;
    scoreText.text = "Revive in " + reviveCounter + " sec";

    player = characters[userID].player;

    if(reviveCounter == 0)
    {
        player.revive();
        player.x = lastPlatformX + 150;
        player.y = 300;
        player.body.velocity.y = 0;

        /*
        game.camera.x = player.x - (windowWidth/2);
        if(game.camera.x < 0)
            game.camera.x = 0;
        if(game.camera.x > gameWidth - windowWidth)
            game.camera.x = gameWidth - windowWidth;

        */
        game.time.events.remove(reviveEvent);
        scoreText.text = "score: 0";

        game.camera.follow(characters[userID].player, Phaser.Camera.FOLLOW_LOCKON, 0.05, 0.1);
    }
}

function playerJoin()
{
    if(playerCount > 20)
    {
        // if player number is over 20, refuse it
        return;
    }

    //wait server give its info
    var newPlayerID = playerCount;
    var newPlayerName = (newPlayerID + 1) + "P";

    // setup new player
    characters[newPlayerID] = new character(newPlayerID, newPlayerName, characters[userID].player.x, characters[userID].player.y - 100);
    initPlayer(characters[newPlayerID].player);

    //player.body.collideWorldBounds = true;

    playerCount++;
}

function initPlayer(player)
{
    game.physics.arcade.enable(player);
    player.body.gravity.y = playerGravity;

    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    player.body.maxVelocity = new Phaser.Point(200,300);
}

function initPlatform(platform)
{
    platform.body.immovable = true;
    platform.body.velocity.y = platformUpSpeed;
}

function avoidStack(player1, player2)
{

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
    offset = 0.5;
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