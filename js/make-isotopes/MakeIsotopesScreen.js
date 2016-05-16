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
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var isotopesAndAtomicMass = require( 'ISOTOPES_AND_ATOMIC_MASS/isotopesAndAtomicMass' );
  var MakeIsotopesModel = require( 'ISOTOPES_AND_ATOMIC_MASS/make-isotopes/model/MakeIsotopesModel' );
  var MakeIsotopesScreenView = require( 'ISOTOPES_AND_ATOMIC_MASS/make-isotopes/view/MakeIsotopesScreenView' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var isotopesString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/isotopes' );

  // images
  var makeIsotopesIcon = require( 'mipmap!ISOTOPES_AND_ATOMIC_MASS/make-isotopes-icon.png' );

  /**
   * @param {Tandem} tandem
   * @constructor
   */
  function MakeIsotopesScreen( tandem ) {

    Screen.call( this, isotopesString, new Image( makeIsotopesIcon ),
      function() {
        return new MakeIsotopesModel(); },
      function( model ) {
        return new MakeIsotopesScreenView( model, tandem ); }, {
        tandem: tandem
      }
    );
  }

  isotopesAndAtomicMass.register( 'MakeIsotopesScreen', MakeIsotopesScreen );
  return inherit( Screen, MakeIsotopesScreen );
} );
