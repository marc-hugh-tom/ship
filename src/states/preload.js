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
