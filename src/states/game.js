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

    __stars : [],

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
        last_asteroid_spawn_distance: 0,
        // Distance travelled between star spawns
        star_spawn_distance: 70,
        last_star_spawn_distance: 0
    },

    __origin : new Phaser.Point(0, 0),

    init : function()
    {
        this.__sprites = {};
        this.__non_player_objects.length = 0;
        this.__stars.length = 0;
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
        
        if (this.__parameters.render_body_debug_info )
        {
            this.debug_graphics = this.game.add.graphics();
        }
        
        var bmd = this.game.add.bitmapData(10, 10);
        bmd.context.beginPath();
        bmd.context.fillStyle = 'white';
        bmd.context.arc(5, 5, 3, 0, 2 * Math.PI);
        bmd.context.fill();
        this.game.cache.addBitmapData('star3', bmd);

        var bmd = this.game.add.bitmapData(10, 10);
        bmd.context.beginPath();
        bmd.context.fillStyle = 'white';
        bmd.context.arc(5, 5, 2, 0, 2 * Math.PI);
        bmd.context.fill();
        this.game.cache.addBitmapData('star2', bmd);

        var bmd = this.game.add.bitmapData(10, 10);
        bmd.context.beginPath();
        bmd.context.fillStyle = 'white';
        bmd.context.arc(5, 5, 1, 0, 2 * Math.PI);
        bmd.context.fill();
        this.game.cache.addBitmapData('star1', bmd);        
    },

    __createShip : function()
    {
        var ship = this.game.add.sprite(
            100, 200, this.__assets.ship.name);
        ship.anchor.set(0.5, 0.5);
        this.game.physics.arcade.enable(ship);
        ship.body.setSize(60, 60, 0, 0);
        ship.body.mass = this.__parameters.ship_mass;
        ship.checkWorldBounds = true;
        ship.events.onOutOfBounds.add(this.__shipOutOfBounds, this);
        ship.body.velocity.setTo(60, 0);
        ship.hitCircles = [{x: 0, y: 20, r: 10},
                           {x: 0, y: -15, r: 15}];
        ship.parallax_multiplier = 1;
        return ship;
    },

    __createBlackHole : function()
    {
        var blackHole = this.game.add.sprite(
            200, 300, this.__assets.blackHole.name);
        blackHole.anchor.set(0.5, 0.5);
        this.game.physics.arcade.enable(blackHole);
        blackHole.body.mass = this.__parameters.blackHole_mass;
        blackHole.hitCircles = [{x: 0, y: 0, r: 30}];
        this.input.activePointer.leftButton.onDown.add(function() {
            blackHole.position.setTo(
                this.camera.x + this.input.mousePointer.position.x,
                this.camera.y + this.input.mousePointer.position.y)}, this);
        blackHole.parallax_multiplier = 1;
        return blackHole;
    },

    render : function()
    {
        if (this.__parameters.render_body_debug_info )
        {
            this.game.debug.body( this.__sprites.ship );

            this.__non_player_objects.forEach(function(npo)
            {
                this.game.debug.body(npo);
            }.bind(this));
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

        var shipPositionPastCutoff = ship.body.position.x > this.__parameters.camera_cutoff_x;
        var shipMovingForwards = ship.body.velocity.x > 0;
        if (shipPositionPastCutoff && shipMovingForwards) {
            var shipXPositionDiff = ship.body.position.x - ship.body.prev.x;
            this.__non_player_objects.forEach(function(npo_sprite) {
                npo_sprite.body.position.x -= shipXPositionDiff;
            });

            this.__stars.forEach(function(star) {
                star.x -= shipXPositionDiff * star.parallax_multiplier;
            });

            this.offset_x += shipXPositionDiff;

            ship.body.position.setTo(ship.body.prev.x,
                                     ship.body.position.y);
        }

        this.__update_score();
        this.__update_asteroid_spawn();

        this.__checkCollisions();
        
        if (this.__parameters.render_body_debug_info )
        {
            this.debug_graphics.clear();
            var objects = [this.__sprites.ship].concat(this.__non_player_objects);
            objects.forEach(function(object)
            {
                object.hitCircles.forEach(function(circle)
                {
                    this.debug_graphics.lineStyle(0);
                    this.debug_graphics.beginFill(0x0000FF, 0.5);
                    var radAngle = Phaser.Math.degToRad(object.body.rotation);
                    this.debug_graphics.drawCircle(
                        object.x + circle.y * Math.sin(radAngle) + circle.x * Math.cos(radAngle),
                        object.y - circle.y * Math.cos(radAngle) + circle.x * Math.sin(radAngle),
                        circle.r * 2);
                    this.debug_graphics.endFill();
                }.bind(this));
            }.bind(this));
        }
    },

    __update_score : function()
    {
        var ship = this.__sprites.ship;
        var distance_travelled = this.offset_x +
            ship.body.position.x + ship.body.halfWidth -
            this.__parameters.start_position.x;

        var currentScore = this.__parameters.score_constant * distance_travelled;
        if (currentScore > this.maxScore) {
            this.maxScore = currentScore
        }
        this.scoreText.setText(this.maxScore.toFixed(0))
    },

    __update_asteroid_spawn : function()
    {
        var distance_travelled = this.offset_x;
        var difference = distance_travelled -
            this.__parameters.last_asteroid_spawn_distance;
        if ( difference > this.__parameters.asteroid_spawn_distance )
        {
            this.__spawn_asteroid();
            this.__parameters.last_asteroid_spawn_distance =
                distance_travelled;
        }
        if ( difference > this.__parameters.star_spawn_distance )
        {
            this.__spawn_star();
            this.__parameters.last_star_spawn_distance =
                distance_travelled;
        }
    },

    __checkCollisions: function()
    {
        this.__non_player_objects.forEach(function(npo) {
            this.game.physics.arcade.overlap(
                this.__sprites.ship,
                npo,
                this.__onCollision,
                this.__circleOverlapCheck
            )
        }.bind(this));
    },

    __circleOverlapCheck: function(object1, object2)
    {
        var overlap = false;
        object1.hitCircles.forEach(function(circle1)
        {
            object2.hitCircles.forEach(function(circle2)
            {
                var radAngle1 = Phaser.Math.degToRad(object1.body.rotation);
                var circle1_x = object1.x + circle1.y * Math.sin(radAngle1) + circle1.x * Math.cos(radAngle1);
                var circle1_y = object1.y - circle1.y * Math.cos(radAngle1) + circle1.x * Math.sin(radAngle1);
                var radAngle2 = Phaser.Math.degToRad(object2.body.rotation);
                var circle2_x = object2.x + circle2.y * Math.sin(radAngle2) + circle2.x * Math.cos(radAngle2);
                var circle2_y = object2.y - circle2.y * Math.cos(radAngle2) + circle2.x * Math.sin(radAngle2);
                var distance = Phaser.Math.distance(circle1_x, circle1_y, circle2_x, circle2_y);
                overlap = overlap || (distance < (circle1.r + circle2.r))
                if (overlap) {
                    return(overlap);
                }
            });
        });
        return(overlap);
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

        asteroid.body.angularVelocity = Rand.range(-20, 20);
        asteroid.anchor.set(0.5, 0.5);
        asteroid.body.velocity.setTo(
            Rand.range(-2, 0),
            Rand.range(-10, 10)
        );

        asteroid.checkWorldBounds = true;
        asteroid.events.onOutOfBounds.add(
            this.__asteroid_out_of_bounds, this);

        asteroid.uuid = this.__get_uuid();

        asteroid.hitCircles = [{x: 0, y: 0, r: 10}];
        this.__non_player_objects.push(asteroid);
    },

    __spawn_star : function()
    {
        var size = Rand.int_range(1, 4);
        console.log(size);
        var star = this.game.add.sprite(
            SCREEN_DIMENSIONS[0] + 50,
            Rand.range(4, SCREEN_DIMENSIONS[1] - 5),
            this.game.cache.getBitmapData('star' + size)
        );
        this.game.physics.arcade.enable(star);
        star.anchor.set(0.5, 0.5);
        star.parallax_multiplier = size / 3;
        star.hitCircles = [{x: 0, y: 0, r: 0}];
        star.parallax_multiplier = size / 3;
        this.__stars.push(star);
    },

    __uuid : 0,
    __get_uuid : function()
    {
        this.__uuid += 1;
        return this.__uuid;
    },

    __asteroid_out_of_bounds : function(asteroid)
    {
        if (asteroid.position.x > SCREEN_DIMENSIONS[1])
        {
            return;
        }

        asteroid.destroy();
        this.__non_player_objects =
            this.__non_player_objects.filter(function(item)
            {
                if (typeof item.uuid ==='undefined')
                {
                    return true;
                }

                return item.uuid != asteroid.uuid;
            });
    },
};

Core.addState( STATE_NAME.GAME, Game )
