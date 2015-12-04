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
  var isotopesAndAtomicMass = require( 'ISOTOPES_AND_ATOMIC_MASS/isotopesAndAtomicMass' );
  var MixIsotopesModel = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/model/MixIsotopesModel' );
  var MixIsotopesScreenView = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/view/MixIsotopesScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );
  var Image = require( 'SCENERY/nodes/Image' );

  // strings
  var mixIsotopesModuleTitleString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/mix-isotopes-module.title' );

  // images
  var mixIsotopesIcon = require( 'mipmap!ISOTOPES_AND_ATOMIC_MASS/mix-isotopes-icon.png' );

  /**
   * @constructor
   */
  function MixIsotopesScreen() {

    Screen.call( this, mixIsotopesModuleTitleString, new Image( mixIsotopesIcon ),
      function() { return new MixIsotopesModel(); },
      function( model ) { return new MixIsotopesScreenView( model ); }
    );
  }

  isotopesAndAtomicMass.register( 'MixIsotopesScreen', MixIsotopesScreen)
  return inherit( Screen, MixIsotopesScreen );
} );