// Copyright 2014-2015, University of Colorado Boulder

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
  var MakeIsotopesScreenView = require( 'ISOTOPES_AND_ATOMIC_MASS/make-isotopes/view/MakeIsotopesScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // strings
  var makeIsotopesString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/make-isotopes-module.title' );

  /**
   * @constructor
   */
  function IsotopesAndAtomicMassScreen() {

    //If this is a single-screen sim, then no icon is necessary.
    //If there are multiple screens, then the icon must be provided here.
    var icon = new Rectangle( 0, 0, 548, 373, { fill: 'red' } );

    Screen.call( this, makeIsotopesString, icon,
      function() { return new MakeIsotopesModel(); },
      function( model ) { return new MakeIsotopesScreenView( model ); }
    );
  }

  return inherit( Screen, IsotopesAndAtomicMassScreen );
} );