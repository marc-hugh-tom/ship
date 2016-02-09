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
        this.load.bitmapFont('RobotoMono-Regular',
                             '../../assets/RobotoMono-Regular.png',
                             '../../assets/RobotoMono-Regular.fnt');
    },

    create : function()
    {
        Core.startState( STATE_NAME.GAME );
    },

    addImage : function( name, path )
    {
        this.__images[ name ] = path;
    }
};

Core.addState( STATE_NAME.PRELOAD, Preload );
