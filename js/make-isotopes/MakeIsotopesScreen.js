//  Copyright 2002-2014, University of Colorado Boulder

/**
 * The "Make Isotopes" screen
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  // modules
  var MakeIsotopesModel = require( 'ISOTOPES_AND_ATOMIC_MASS/make-isotopes/model/MakeIsotopesModel' );
  var IsotopesAndAtomicMassScreenView = require( 'ISOTOPES_AND_ATOMIC_MASS/make-isotopes/view/MakeIsotopesScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var isotopesAndAtomicMassSimString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/isotopes-and-atomic-mass.name' );

  /**
   * @constructor
   */
  function IsotopesAndAtomicMassScreen() {

    //If this is a single-screen sim, then no icon is necessary.
    //If there are multiple screens, then the icon must be provided here.
    var icon = null;

    Screen.call( this, isotopesAndAtomicMassSimString, icon,
      function() { return new MakeIsotopesModel(); },
      function( model ) { return new IsotopesAndAtomicMassScreenView( model ); },
      { backgroundColor: '#FFFF99' }
    );
  }

  return inherit( Screen, IsotopesAndAtomicMassScreen );
} );