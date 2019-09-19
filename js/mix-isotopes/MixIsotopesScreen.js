// Copyright 2014-2017, University of Colorado Boulder

/**
 * The "Mix Isotopes" screen
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author James Smith
 */
define( require => {
  'use strict';

  // modules
  const Image = require( 'SCENERY/nodes/Image' );
  const inherit = require( 'PHET_CORE/inherit' );
  const isotopesAndAtomicMass = require( 'ISOTOPES_AND_ATOMIC_MASS/isotopesAndAtomicMass' );
  const MixIsotopesModel = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/model/MixIsotopesModel' );
  const MixIsotopesScreenView = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/view/MixIsotopesScreenView' );
  const Screen = require( 'JOIST/Screen' );

  // strings
  const mixturesString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/mixtures' );

  // images
  const mixIsotopesIcon = require( 'mipmap!ISOTOPES_AND_ATOMIC_MASS/mix-isotopes-icon.png' );

  /**
   * @param {Tandem} tandem
   * @constructor
   */
  function MixIsotopesScreen( tandem ) {

    const options = {
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

