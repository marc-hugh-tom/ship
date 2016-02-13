var Game = function( game )
{
};

Object.defineProperty(Game, "ASSETS_URL_PREFIX",
	{ value: "../../assets" });

Game.prototype =
{
	__assetsUrlPrefix : "../../assets",
    __assets :
    {
        ship : {
            name : "ship",
            url : Game.ASSETS_URL_PREFIX + "/ship.png"
        },
        blackHole : {
            name : "black_hole",
            url : Game.ASSETS_URL_PREFIX + "/black_hole.png"
        },

		asteroids :
		[
			{
				name : "asteroid_1",
				url : Game.ASSETS_URL_PREFIX + "/asteroid_1.png"
			},
			{
				name : "asteroid_2",
				url : Game.ASSETS_URL_PREFIX + "/asteroid_2.png"
			},
			{
				name : "asteroid_3",
				url : Game.ASSETS_URL_PREFIX + "/asteroid_3.png"
			}
		]
    },

    __sprites : null,

    __non_player_objects : [],

	__asteroids : [],

    __parameters :
    {
        ship_mass: 1,
        blackHole_mass: 500000,
        camera_cutoff_x: 300,
        start_position: {
            x: 100,
            y: 300
        },
        score_constant: 0.05,
        score_font: 'RobotoMono-Regular',
		render_body_debug_info: true,

		// Distance travelled between asteroid spawns
		asteroid_spawn_distance: 100,
		last_asteroid_spawn_distance: 0
    },

    __origin : new Phaser.Point(0, 0),

	init : function()
	{
		this.__sprites = {};
		this.__non_player_objects.length = 0;
		this.__parameters.last_asteroid_spawn_distance = 0;
		this.__asteroids.length = 0;
	},

    onload : function()
    {
        preloadState = Core.getState( STATE_NAME.PRELOAD );

        Object.keys( this.__assets ).forEach( function( assetKey )
        {
			var preloadImage = function(name, url)
			{
				preloadState.addImage(name, url);
			};

			var asset = this.__assets[ assetKey ]
			if (Core.isArray(asset))
			{
				asset.forEach(function(asset)
				{
					preloadImage(asset.name, asset.url);
				});
			}
			else
			{
				preloadImage(asset.name, asset.url);
			}
        }.bind( this ));
    },

    create : function()
    {
        this.game.physics.startSystem(Phaser.Physics.Arcade);

		this.__sprites.ship = this.__createShip();
		this.__sprites.blackHole = this.__createBlackHole();
        this.__non_player_objects.push(this.__sprites.blackHole);

		// Score
        this.maxScore = 0;
        this.scoreText = this.add.bitmapText(this.world.centerX, 45,
            this.__parameters.score_font, this.maxScore.toFixed(0), 62);
        this.scoreText.anchor.set(0.5);
        this.offset_x = 0;
    },

	__createShip : function()
	{
		var ship = this.game.add.sprite(
			100, 200, this.__assets.ship.name);
		ship.anchor.set(0.5, 0.5);
		this.game.physics.arcade.enable(ship);
		ship.body.mass = this.__parameters.ship_mass;
		ship.checkWorldBounds = true;
		ship.events.onOutOfBounds.add(this.__shipOutOfBounds, true);
		ship.body.velocity.setTo(60, 0);

		return ship;
	},

	__createBlackHole : function()
	{
		var blackHole = this.game.add.sprite(
			200, 300, this.__assets.blackHole.name);
		blackHole.anchor.set(0.5, 0.5);
		this.game.physics.arcade.enable(blackHole);
		blackHole.body.mass = this.__parameters.blackHole_mass;

		return blackHole;
	},

	render : function()
	{
		if (this.__parameters.render_body_debug_info )
		{
			this.game.debug.body( this.__sprites.ship );
			this.game.debug.body( this.__sprites.blackHole );
		}
	},

    update : function()
    {
        var ship = this.__sprites.ship;
        var blackHole = this.__sprites.blackHole;

        var totalGravity = (ship.body.mass * blackHole.body.mass) /
            Phaser.Math.distanceSq(ship.x, ship.y, blackHole.x, blackHole.y);

        var angleBetweenShipBH = Phaser.Math.angleBetweenPoints(ship.position,
																blackHole.position);
		ship.body.gravity.setTo(Math.cos(angleBetweenShipBH) * totalGravity,
								Math.sin(angleBetweenShipBH) * totalGravity);

        ship.body.rotation = 270 + Phaser.Math.radToDeg(
            Phaser.Math.angleBetweenPoints(ship.body.velocity, this.__origin));

        if (this.input.activePointer.leftButton.isDown) {
            blackHole.position.setTo(this.camera.x + this.input.mousePointer.position.x,
									 this.camera.y + this.input.mousePointer.position.y);
        }

		var shipPositionPastCutoff = ship.body.position.x > this.__parameters.camera_cutoff_x;
		var shipMovingForwards = ship.body.velocity.x > 0;
        if (shipPositionPastCutoff && shipMovingForwards) {
			var shipXPositionDiff = ship.body.position.x - ship.body.prev.x;

            this.__non_player_objects.forEach(function(npo_sprite) {
                npo_sprite.body.position.x -= shipXPositionDiff;
			});

            this.offset_x += shipXPositionDiff;

			ship.body.position.setTo(ship.body.prev.x,
									 ship.body.position.y);
        }

		var distance_travelled = this.offset_x +
			ship.body.position.x + ship.body.halfWidth -
			this.__parameters.start_position.x;
		this.__update_score(distance_travelled);
		this.__update_asteroid_spawn(this.offset_x);

		this.__checkCollisions();
    },

	__update_score : function(distance_travelled)
	{
        var currentScore = this.__parameters.score_constant * distance_travelled;
        if (currentScore > this.maxScore) {
            this.maxScore = currentScore
        }
        this.scoreText.setText(this.maxScore.toFixed(0))
	},

	__update_asteroid_spawn : function( distance_travelled )
	{
		var difference = distance_travelled -
			this.__parameters.last_asteroid_spawn_distance;
		if ( difference > this.__parameters.asteroid_spawn_distance )
		{
			this.__spawn_asteroid();
			this.__parameters.last_asteroid_spawn_distance =
				distance_travelled;
		}
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

	__shipOutOfBounds : function()
	{
		Core.startState( STATE_NAME.GAME_OVER );
	},

	__onCollision: function(player, npo)
	{
		// For now, everything kills the player to we can go straight...
		//...to the game over state
		Core.startState( STATE_NAME.GAME_OVER );
	},

	__spawn_asteroid : function()
	{
		var asteroid_asset = Rand.choice( this.__assets.asteroids );
		var asteroid = this.game.add.sprite(
			SCREEN_DIMENSIONS[0] + 50,
			Rand.range(100, SCREEN_DIMENSIONS[1] - 100),
			asteroid_asset.name
		);

		this.game.physics.arcade.enable(asteroid);

		this.__non_player_objects.push(asteroid);
	}
};

Core.addState( STATE_NAME.GAME, Game )
