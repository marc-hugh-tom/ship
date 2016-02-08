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
        camera_cutoff_x: 500,

		physics_type: Phaser.Physics.P2JS,

		render_body_debug_info: true
    },

    __origin : new Phaser.Point(0, 0),

	_ship_previous_position : null,

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
        this.game.physics.startSystem(this.__parameters.physics_type);

		this.__sprites.ship = this.__createShip();
		this.__sprites.blackHole = this.__createBlackHole();
        this.__non_player_objects.push(this.__sprites.blackHole);
    },

	render : function()
	{
		if (this.__parameters.render_body_debug_info )
		{
			this.game.debug.body( this.__sprites.ship );
			this.game.debug.body( this.__sprites.blackHole );
		}
	},

	__createShip : function()
	{
		var ship = this.game.add.sprite(
			100, 200, this.__assets.ship.name);
		ship.anchor.set(0.5, 0.5);
		this.game.physics.p2.enable(ship);
		ship.body.mass = this.__parameters.ship_mass;
		ship.checkWorldBounds = true;
		ship.events.onOutOfBounds.add(this.__shipOutOfBounds, true);
		this.__ship_previous_position = ship.position;

		window.ship = ship;

		return ship;
	},

	__createBlackHole : function()
	{
		var blackHole = this.game.add.sprite(
			200, 300, this.__assets.blackHole.name);
		blackHole.anchor.set(0.5, 0.5);
		this.game.physics.p2.enable(blackHole);
		blackHole.body.mass = this.__parameters.blackHole_mass;

		window.blackHole = blackHole;

		return blackHole;
	},

	__shipOutOfBounds : function()
	{
		//Core.startState( STATE_NAME.GAME_OVER );
	},

    update : function()
    {
        var ship = this.__sprites.ship;
        var blackHole = this.__sprites.blackHole;

        var totalGravity = (ship.body.mass * blackHole.body.mass) /
            Phaser.Math.distanceSq(ship.body.x, ship.body.y, blackHole.x, blackHole.y);

        var angleBetweenShipBH = Phaser.Math.angleBetweenPoints(ship.position,
																blackHole.position);
		ship.body.force.x = Math.cos(angleBetweenShipBH) * totalGravity;
		ship.body.force.y = Math.sin(angleBetweenShipBH) * totalGravity;

		ship.body.thrust(100);

        ship.body.angle = 270 + Phaser.Math.radToDeg(
            Phaser.Math.angleBetweenPoints(ship.body.velocity, this.__origin));

        if (this.input.activePointer.leftButton.isDown) {
            blackHole.body.x = this.camera.x + this.input.mousePointer.position.x;
            blackHole.body.y = this.camera.y + this.input.mousePointer.position.y;
        }

		var shipPositionPastCutoff = ship.position.x > this.__parameters.camera_cutoff_x;
		var shipMovingForwards = ship.body.velocity.x > 0;
        if (shipPositionPastCutoff && shipMovingForwards) {
			var shipXPositionDiff = ship.position.x - ship.previousPosition.x;

            this.__non_player_objects.forEach(function(npo_sprite) {
                npo_sprite.body.x -= shipXPositionDiff;
			});

			//ship.x = this.__ship_previous_position.x;
			//ship.position.x = this.__ship_previous_position.x;
			//ship.body.x = ship.previousPosition.x;

			//ship.x = this.__parameters.camera_cutoff_x;
			//ship.position.x = this.__parameters.camara_cutoff_x;
			//ship.body.x = this.__parameters.camera_cutoff_x;
        }


		this.__checkCollisions();

		blackHole.reset( blackHole.body.x, blackHole.body.y, true );
    },

	__checkCollisions: function()
	{
		this.__non_player_objects.forEach(function(npo) {
			this.game.physics.arcade.collide(
				this.__sprites.ship,
				npo,
				this.__onCollision
			)
		}.bind(this));
	},

	__onCollision: function(player, npo)
	{
		// For now, everything kills the player to we can go straight...
		//...to the game over state
		//Core.startState( STATE_NAME.GAME_OVER );
	}
};

Core.addState( STATE_NAME.GAME, Game )
