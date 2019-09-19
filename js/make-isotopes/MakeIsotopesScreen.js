// Copyright 2014-2017, University of Colorado Boulder

/**
 * The "Make Isotopes" screen
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */
define( require => {
  'use strict';

  // modules
  const Image = require( 'SCENERY/nodes/Image' );
  const inherit = require( 'PHET_CORE/inherit' );
  const isotopesAndAtomicMass = require( 'ISOTOPES_AND_ATOMIC_MASS/isotopesAndAtomicMass' );
  const MakeIsotopesModel = require( 'ISOTOPES_AND_ATOMIC_MASS/make-isotopes/model/MakeIsotopesModel' );
  const MakeIsotopesScreenView = require( 'ISOTOPES_AND_ATOMIC_MASS/make-isotopes/view/MakeIsotopesScreenView' );
  const Screen = require( 'JOIST/Screen' );

  // strings
  const isotopesString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/isotopes' );

  // images
  const makeIsotopesIcon = require( 'mipmap!ISOTOPES_AND_ATOMIC_MASS/make-isotopes-icon.png' );

  /**
   * @param {Tandem} tandem
   * @constructor
   */
  function MakeIsotopesScreen( tandem ) {

    const options = {
      name: isotopesString,
      homeScreenIcon: new Image( makeIsotopesIcon ),
      tandem: tandem
    };

    Screen.call( this,
      function() { return new MakeIsotopesModel(); },
      function( model ) { return new MakeIsotopesScreenView( model, tandem ); },
      options );
  }

  isotopesAndAtomicMass.register( 'MakeIsotopesScreen', MakeIsotopesScreen );

  return inherit( Screen, MakeIsotopesScreen );
} );
