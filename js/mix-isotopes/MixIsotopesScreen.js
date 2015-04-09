// Copyright 2002-2014, University of Colorado Boulder

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
  var Image  = require('SCENERY/nodes/Image');

  // strings
  var mixIsotopesString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/mix-isotopes-module.title' );

  // images
  var blackBoxImage = require('image!ISOTOPES_AND_ATOMIC_MASS/BlackBox.png');

  /**
   * @constructor
   */
  function MixIsotopesScreen() {

    //If this is a single-screen sim, then no icon is necessary.
    //If there are multiple screens, then the icon must be provided here.
    var icon = new Image(blackBoxImage);

    Screen.call( this, mixIsotopesString, icon,
      function() { return new MixIsotopesModel(); },
      function( model ) { return new MixIsotopesScreenView( model ); },
      { backgroundColor: '#FFFF99' }
    );
  }

  return inherit( Screen, MixIsotopesScreen );
} );