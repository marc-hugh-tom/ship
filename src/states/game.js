var Game = function( game )
{
};

Game.prototype =
{
    __assets :
    {
        ship : {
            name : "ship",
            url : "../../assets/ship.png"
        },
        blackHole : {
            name : "black_hole",
            url : "../../assets/black_hole.png"
        }
    },

    __sprites : {},

    __non_player_objects : [],
    
    __parameters :
    {
        ship_mass: 1,
        blackHole_mass: 500000,
        camera_cutoff_x: 500
    },

    onload : function()
    {
        preloadState = Core.getState( STATE_NAME.PRELOAD );

        Object.keys( this.__assets ).forEach( function( assetKey )
        {
                var asset = this.__assets[ assetKey ]
                preloadState.addImage( asset.name, asset.url );
        }.bind( this ));
    },

    create : function()
    {
        this.__sprites.ship = this.game.add.sprite(
                100, 200, this.__assets.ship.name );
        this.__sprites.ship.anchor.set( 0.5, 0.5 );

        this.__sprites.blackHole = this.game.add.sprite(
                200, 300, this.__assets.blackHole.name );
        this.__sprites.blackHole.anchor.set( 0.5, 0.5 );

        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.physics.enable(this.__sprites.ship, Phaser.Physics.ARCADE);
        this.game.physics.enable(this.__sprites.blackHole,
                                 Phaser.Physics.ARCADE);

        this.__sprites.ship.body.velocity.setTo(60, 0);
        
        this.__sprites.ship.body.mass = this.__parameters.ship_mass;
        this.__sprites.blackHole.body.mass = this.__parameters.blackHole_mass;
        
        this.__non_player_objects.push(this.__sprites.blackHole);
    },

    update : function()
    {
        var ship = this.__sprites.ship;
        var blackHole = this.__sprites.blackHole;
        
        var totalGravity = (ship.body.mass * blackHole.body.mass) /
            Phaser.Math.distanceSq(ship.x, ship.y, blackHole.x, blackHole.y);
        
        var angleBetweenShipBH = Phaser.Math.angleBetweenPoints(ship.position,
            blackHole.position)
        
        ship.body.gravity = new Phaser.Point(totalGravity *
            Math.cos(angleBetweenShipBH), totalGravity *
            Math.sin(angleBetweenShipBH));

        ship.body.rotation = 270 + Phaser.Math.radToDeg(
            Phaser.Math.angleBetweenPoints(ship.body.velocity,
                                           new Phaser.Point(0, 0)));
        
        if (this.input.activePointer.leftButton.isDown) {
            blackHole.position = new Phaser.Point(
                this.camera.x + this.input.mousePointer.position.x,
                this.camera.y + this.input.mousePointer.position.y);
        }

        if (ship.body.position.x >
            this.__parameters.camera_cutoff_x &&
            ship.body.velocity.x > 0) {
            this.__non_player_objects.forEach(function(npo_sprite) {
                npo_sprite.body.position.setTo(npo_sprite.body.position.x -
                    (ship.body.position.x - ship.body.prev.x),
                    npo_sprite.body.position.y);
            });
            ship.body.position.setTo(ship.body.prev.x, ship.body.position.y);
        }
    }
};

Core.addState( STATE_NAME.GAME, Game )