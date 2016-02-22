var GameOver = function( game ) {};

GameOver.prototype = {
    __assets:
    {
        gameOver:
        {
            name: "game_over",
            url: CONSTS.ASSETS_URL_PREFIX + "/game_over.png"
        },

        replay:
        {
            name: "replay",
            url: CONSTS.ASSETS_URL_PREFIX + "/replay.png"
        }
    },

    __objects:
    {},

    __score_text : null,

    init: function(params)
    {
        var score = params.score || 0;
        this.__score_text = this.add.bitmapText(this.world.centerX,
            45, CONSTS.FONT_NAME, score.toFixed(0), 62);
        this.__score_text.anchor.set(0.5);
    },

    onload: function()
    {
        preloadState = Core.getState( CONSTS.STATE_NAME.PRELOAD );

        Object.keys( this.__assets ).forEach( function( assetKey )
        {
            var asset = this.__assets[ assetKey ];
            preloadState.addImage( asset.name, asset.url );
        }.bind( this ) );
    },

    create: function()
    {
        this.__objects.gameOver = this.__createGameOver();
        this.__objects.replayButton = this.__createReplayButton();
    },

    __createGameOver: function()
    {
        var gameOver = this.game.add.sprite(
            this.game.world.centerX,
            this.game.world.centerY - 100,
            this.__assets.gameOver.name
        );
        gameOver.anchor.set(0.5, 0.5);
        gameOver.scale.set(2, 2);

        return gameOver;
    },

    __createReplayButton: function()
    {
        var replayButton = this.game.add.button(
            this.game.world.centerX,
            this.game.world.centerY + 50,
            this.__assets.replay.name,
            this.__onReplayButtonClicked
        );
        replayButton.anchor.set(0.5, 0.5);

        return replayButton;
    },

    __onReplayButtonClicked: function()
    {
        Core.startState( CONSTS.STATE_NAME.GAME );
    }
}

Core.addState( CONSTS.STATE_NAME.GAME_OVER, GameOver );
