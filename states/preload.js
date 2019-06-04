var Preload = function( game )
{
};

Preload.prototype =
{
    __images : {},

    preload : function()
    {
        Object.keys( this.__images ).forEach( function( imageName )
        {
            this.load.image( imageName, this.__images[ imageName ] );
        }.bind( this ));
        // Load the font used for the score display
        this.load.bitmapFont(CONSTS.FONT_NAME,
            CONSTS.ASSETS_URL_PREFIX + '/RobotoMono-Regular.png',
            CONSTS.ASSETS_URL_PREFIX + '/RobotoMono-Regular.fnt');
    },

    create : function()
    {
        Core.startState( CONSTS.STATE_NAME.GAME );
    },

    addImage : function( name, path )
    {
        this.__images[ name ] = path;
    }
};

Core.addState( CONSTS.STATE_NAME.PRELOAD, Preload );
