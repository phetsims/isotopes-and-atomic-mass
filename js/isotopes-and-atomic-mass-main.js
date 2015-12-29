// Copyright 2014-2015, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var MakeIsotopesScreen = require( 'ISOTOPES_AND_ATOMIC_MASS/make-isotopes/MakeIsotopesScreen' );
  var MixIsotopesScreen = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/MixIsotopesScreen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );
  var Tandem = require( 'TANDEM/Tandem' );

  // strings
  var isotopesAndAtomicMassTitleString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/isotopes-and-atomic-mass.title' );

  var tandem = new Tandem( 'isotopesAndAtomicMass' );

  var simOptions = {
    credits: {
      //TODO fill in proper credits, all of these fields are optional, see joist.AboutDialog
      leadDesign: '',
      softwareDevelopment: '',
      team: '',
      qualityAssurance: '',
      graphicArts: '',
      thanks: ''
    },
    tandem: tandem
  };

  // Appending '?dev' to the URL will enable developer-only features.
  if ( phet.chipper.getQueryParameter( 'dev' ) ) {
    simOptions = _.extend( {
      // add dev-specific options here
    }, simOptions );
  }

  SimLauncher.launch( function() {
    var makeIsotopeScreenTandem = tandem.createTandem( 'makeIsotopeScreen' );
    var mixIsotopeScreenTandem = tandem.createTandem( 'mixIsotopeScreen' );

    var sim = new Sim( isotopesAndAtomicMassTitleString, [ new MakeIsotopesScreen( makeIsotopeScreenTandem ), new MixIsotopesScreen( mixIsotopeScreenTandem ) ], simOptions );
    sim.start();
  } );
} );