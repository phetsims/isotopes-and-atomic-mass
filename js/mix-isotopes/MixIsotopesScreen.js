// Copyright 2014-2017, University of Colorado Boulder

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
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var isotopesAndAtomicMass = require( 'ISOTOPES_AND_ATOMIC_MASS/isotopesAndAtomicMass' );
  var MixIsotopesModel = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/model/MixIsotopesModel' );
  var MixIsotopesScreenView = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/view/MixIsotopesScreenView' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var mixturesString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/mixtures' );

  // images
  var mixIsotopesIcon = require( 'mipmap!ISOTOPES_AND_ATOMIC_MASS/mix-isotopes-icon.png' );

  /**
   * @param {Tandem} tandem
   * @constructor
   */
  function MixIsotopesScreen( tandem ) {

    var options = {
      name: mixturesString,
      homeScreenIcon: new Image( mixIsotopesIcon ),
      tandem: tandem
    };

    Screen.call( this,
      function() { return new MixIsotopesModel(); },
      function( model ) { return new MixIsotopesScreenView( model, tandem ); },
      options );
  }

  isotopesAndAtomicMass.register( 'MixIsotopesScreen', MixIsotopesScreen );

  return inherit( Screen, MixIsotopesScreen );
} );

