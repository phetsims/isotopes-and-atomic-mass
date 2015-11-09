// Copyright 2014-2015, University of Colorado Boulder

/**
 * The "Mix Isotopes" screen
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author James Smith
 */
define( function( require ) {
  'use strict';

  // modules
  var MixIsotopesModel = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/model/MixIsotopesModel' );
  var MixIsotopesScreenView = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/view/MixIsotopesScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // strings
  var mixIsotopesModuleTitleString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/mix-isotopes-module.title' );

  /**
   * @constructor
   */
  function MixIsotopesScreen() {

    //If this is a single-screen sim, then no icon is necessary.
    //If there are multiple screens, then the icon must be provided here.
    var icon = new Rectangle( 0, 0, 548, 373, { fill: 'blue' } );

    Screen.call( this, mixIsotopesModuleTitleString, icon,
      function() { return new MixIsotopesModel(); },
      function( model ) { return new MixIsotopesScreenView( model ); },
      { backgroundColor: '#FFFF99' }
    );
  }

  return inherit( Screen, MixIsotopesScreen );
} );