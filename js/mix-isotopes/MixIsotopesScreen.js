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
   * @constructor
   * @param {Tandem} tandem
   */
  function MixIsotopesScreen( tandem ) {

    Screen.call( this, mixturesString, new Image( mixIsotopesIcon ),
      function() {
        return new MixIsotopesModel(); },
      function( model ) {
        return new MixIsotopesScreenView( model, tandem ); }, {
        tandem: tandem
      }
    );
  }

  isotopesAndAtomicMass.register( 'MixIsotopesScreen', MixIsotopesScreen );
  return inherit( Screen, MixIsotopesScreen );
} );

