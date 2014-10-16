//  Copyright 2002-2014, University of Colorado Boulder

/**
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var IsotopesAndAtomicMassModel = require( 'ISOTOPES_AND_ATOMIC_MASS/isotopes-and-atomic-mass/model/IsotopesAndAtomicMassModel' );
  var IsotopesAndAtomicMassScreenView = require( 'ISOTOPES_AND_ATOMIC_MASS/isotopes-and-atomic-mass/view/IsotopesAndAtomicMassScreenView' );
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
      function() { return new IsotopesAndAtomicMassModel(); },
      function( model ) { return new IsotopesAndAtomicMassScreenView( model ); },
      { backgroundColor: 'white' }
    );
  }

  return inherit( Screen, IsotopesAndAtomicMassScreen );
} );