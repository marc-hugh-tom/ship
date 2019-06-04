var Boot = function( game )
{
};

Boot.prototype =
{
    create : function()
    {
        this.stage.backgroundColor = "#171642";

        Core.startState( CONSTS.STATE_NAME.PRELOAD );
    }
};

Core.addState( CONSTS.STATE_NAME.BOOT, Boot, true );
