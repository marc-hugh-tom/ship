Core =
{
	states : {},
	startingState : null,

	game : null,

	addState : function( name, state, start )
	{
		this.states[ name ] = state

		if ( start !== null && start )
		{
			this.startingState = name
		}
	},

	startState : function( name )
	{
		this.game.state.start( name );
	},

	onload : function( divName )
	{
		// Create game
		this.game = new Phaser.Game( 800, 600, Phaser.AUTO, divName );

		// Add states
		Object.keys( this.states ).forEach( function( stateName )
		{
			this.game.state.add( stateName, this.states[ stateName ] );
		}.bind( this ));

		// Start the first state
		if ( this.startingState )
		{
			this.startState( this.startingState );
		}
	}
};