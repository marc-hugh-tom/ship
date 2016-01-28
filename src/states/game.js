var Game = function( game )
{
};

Game.prototype =
{
	__assets :
	{
		ship : { name : "ship", url : "../../assets/ship.png" },
		blackHole : { name : "black_hole", url : "../../assets/black_hole.png" }
	},

	__sprites : {},

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
        	100, 300, this.__assets.ship.name );
        this.__sprites.ship.anchor.set( 0.5, 0.5 );

        this.__sprites.blackHole = this.game.add.sprite(
        	200, 300, this.__assets.blackHole.name );
        this.__sprites.blackHole.anchor.set( 0.5, 0.5 );

        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.physics.enable(this.__sprites.ship, Phaser.Physics.ARCADE);
        this.game.physics.enable(this.__sprites.blackHole, Phaser.Physics.ARCADE);

        // this.__sprites.ship.body.mass = 100000;
        // this.__sprites.blackHole.body.mass = 1;
	},

	update : function()
	{
		var ship = this.__sprites.ship;
		var blackHole = this.__sprites.blackHole

		var angle = this.game.physics.arcade.angleBetween(ship, blackHole)
		
                var vel = 100
		ship.body.velocity.setTo( +vel*Math.sin(ship.rotation), -vel*Math.cos(ship.rotation) );
                var velocity = 50 - this.game.time.totalElapsedSeconds();
                if (velocity < 0) {velocity = 0}
                ship.body.angularVelocity = velocity;

		// this.game.physics.arcade.accelerateToObject(
		// 	ship, blackHole, ( ship.body.mass ) / r );
	}
};

Core.addState( STATE_NAME.GAME, Game )