var Boot = function( game )
{
};

Boot.prototype =
{
    create : function()
    {
        this.stage.backgroundColor = "#171642";

        Core.startState( STATE_NAME.PRELOAD );
    }
};

Core.addState( STATE_NAME.BOOT, Boot, true );
