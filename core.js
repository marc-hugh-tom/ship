Core =
{
    __states : {},
    __startingState : null,

    __game : null,

    addState : function( name, state, start )
    {
        this.__states[ name ] = state

        if ( start !== null && start )
        {
            this.__startingState = name
        }
    },

    getState : function( name )
    {
        return this.__states[ name ].prototype;
    },

    startState : function( name, params )
    {
        params = params || {}
        this.__game.state.start( name, true, false, params );
    },

    onload : function()
    {
        // Create game
        this.__game = new Phaser.Game(
            CONSTS.SCREEN_DIMENSIONS[0], CONSTS.SCREEN_DIMENSIONS[1]
        );

        this.__add_states();
        this.__init_states();
        this.__startFirstState();
    },

    __add_states : function()
    {
        Object.keys( this.__states ).forEach( function( stateName )
        {
            this.__game.state.add( stateName, this.__states[ stateName ] );
        }.bind( this ));
    },

    __init_states : function()
    {
        Object.keys( this.__states ).forEach( function( stateName )
        {
            var onload = this.__states[ stateName ].prototype.onload
            if ( onload )
            {
                onload.apply( this.__states[ stateName ].prototype )
            }
        }.bind( this ));
    },

    __startFirstState : function()
    {
        if ( this.__startingState )
        {
            this.startState( this.__startingState );
        }
    },

    // Taken from: http://stackoverflow.com/a/16608045
    isArray : function(a)
    {
        return (!!a) && (a.constructor === Array);
    }
};
