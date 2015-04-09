// Copyright 2002-2014, University of Colorado Boulder

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
  var Image = require( 'SCENERY/nodes/Image' );

  // strings
  var makeIsotopesString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/make-isotopes-module.title' );

  // images
  var blackBoxImage = require( 'image!ISOTOPES_AND_ATOMIC_MASS/BlackBox.png' );

  /**
   * @constructor
   */
  function IsotopesAndAtomicMassScreen() {

    //If this is a single-screen sim, then no icon is necessary.
    //If there are multiple screens, then the icon must be provided here.
    var icon = new Image( blackBoxImage );

    Screen.call( this, makeIsotopesString, icon,
      function() { return new MakeIsotopesModel(); },
      function( model ) { return new MakeIsotopesScreenView( model ); },
      { backgroundColor: '#FFFF99' }
    );
  }

  return inherit( Screen, IsotopesAndAtomicMassScreen );
} );