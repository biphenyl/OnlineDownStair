
var gameWidth = 2000;
var gameHeight = 800;

var game = new Phaser.Game($(window).width(), gameHeight, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {

    game.load.image('sky', 'assets/sky.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);

}

var player;
var platforms;
var cursors;
var ground;

var graphics;

var stars;
var score = 0;
var scoreText;
var idText;
var lastPlatformX = 0;

function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    //background = game.add.sprite(0, 0, 'sky');
    //background.scale.setTo($(window).width()/800, gameHeight/600);

    game.world.setBounds(0, 0, gameWidth, gameHeight);

    graphics = game.add.graphics(0, 0);
    game.stage.backgroundColor = "#FFFFFF";

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Here we create the ground.
    ground = platforms.create(0, game.world.height - 64, 'ground');

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    //ground.scale.setTo(2, 2);

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;
    //ground.body.velocity.y = -10;

    //  Now let's create two ledges
    var ledge = platforms.create(400, 400, 'ground');
    ledge.body.immovable = true;
    //ledge.body.velocity.y = -10;

    ledge = platforms.create(-150, 250, 'ground');
    ledge.body.immovable = true;
    //ledge.body.velocity.y = -10;
    
    // The player and its settings
    player = game.add.sprite(32, game.world.height - 150, 'dude');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    //  Player physics properties. Give the little guy a slight bounce.
    //player.body.bounce.y = 0.2;
    player.body.gravity.y = 400;
    //player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    //  Finally some stars to collect
    
    /*stars = game.add.group();

    //  We will enable physics for any star that is created in this group
    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 12; i++)
    {
        //  Create a star inside of the 'stars' group
        var star = stars.create(i * 70, 0, 'star');

        //  Let gravity do its thing
        star.body.gravity.y = 300;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
    }
    */
    //  The score
    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
    idText = game.add.text(player.x - 16, player.y - 16, "playerID", { fontSize: '16px', fill: '#000' })

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();
    
    platforms.forEach(function(item)
    {
        item.body.velocity.y = -40;
    })

    game.time.events.loop(Phaser.Timer.SECOND * 3, createNewPlatform, this);
    game.time.events.loop(Phaser.Timer.SECOND * 0.2, showNewSize, this);
    game.time.events.loop(Phaser.Timer.SECOND * 0.03, mainLoop, this);

    game.camera.follow(player);

    drawBound();

}

function update() {

    //  Collide the player and the stars with the platforms
    game.physics.arcade.collide(player, platforms, standOnPlatform, null, this);
    //game.physics.arcade.collide(stars, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    //game.physics.arcade.overlap(player, stars, collectStar, null, this);

    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -150;

        player.animations.play('left');
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 150;

        player.animations.play('right');
    }
    else
    {
        //  Stand still
        player.animations.stop();

        player.frame = 4;
    }
    
    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.touching.down)
    {
        player.body.velocity.y = -350;
    }

    idText.x = player.x - 8;
    idText.y = player.y - 16;

    scoreText.x = game.camera.x + 16;
    scoreText.y = game.camera.y + 16;

}

/*
function collectStar (player, star) {
    
    // Removes the star from the screen
    star.kill();

    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;

}
*/

$(window).resize(function(){
    game.scale.setGameSize($(window).width(), gameHeight);
});

function standOnPlatform(player, platform)
{
    if(player.y + player.body.height == platform.y)
    {
        score += 10;
        scoreText.text = "score:" + score;
        
    }

    player.body.velocity.y = 0;
}

function createNewPlatform()
{
    newPlatformX = Math.random() * (gameWidth - 300);
    while(newPlatformX < lastPlatformX + 300 && newPlatformX > lastPlatformX - 300)
        newPlatformX = Math.random() * (gameWidth - 300);
    var ledge = platforms.create(newPlatformX, gameHeight, 'ground');
    ledge.body.immovable = true;
    ledge.body.velocity.y = -40;

    lastPlatformX = newPlatformX;
}

function showNewSize()
{
    platforms.forEach(function(item)
    {
        if(item.top <= -64)
            platforms.remove(item);
    })

    if(player.body.y > gameHeight)
     {  
        player.kill();
        console.log("he die~");
    }
}

function mainLoop()
{
    //render everyone's position
    //send keyboard status

    if(player.y < 0)
    {    
        player.y = 0;
        player.body.velocity.y = 0;
    }
    if(player.body.x < 0)
    {
        player.x = 0;
        player.body.velocity.x = 0;
    }

    if(player.body.x > gameWidth-player.width)
    {
        player.x = gameWidth - player.width;
        player.body.velocity.x = 0;
    }

}

function drawBound()
{
    graphics.lineStyle(2, 0x0000FF, 1);
    graphics.drawRect(0, 0, gameWidth, gameHeight);
}