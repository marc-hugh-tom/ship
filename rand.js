var Rand = function()
{
};

Rand.choice = function( array )
{
    var random_index = Rand.int_range( 0, array.length );
    return array[ random_index ];
};

Rand.range = function( min, max )
{
    var diff = max - min;
    return min + ( diff * this.__rand() );
};

Rand.int_range = function( min, max )
{
    // the '| 0' turns it into an integer
    // http://stackoverflow.com/a/12837315
    return Rand.range( min, max ) | 0;
};

Rand.__rand = function()
{
    return Math.random();
};
