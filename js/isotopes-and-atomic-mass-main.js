//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var MakeIsotopesScreen = require( 'ISOTOPES_AND_ATOMIC_MASS/make-isotopes/MakeIsotopesScreen' );
  // TODO: Getting the MakeIsotopesScreen to work first for simplicity
//  var MixIsotopesScreen = require( 'ISOTOPES_AND_ATOMIC_MASS/isotopes-and-atomic-mass/IsotopesAndAtomicMassScreen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );

  // strings
  var simTitle = require( 'string!ISOTOPES_AND_ATOMIC_MASS/isotopes-and-atomic-mass.name' );

  var simOptions = {
    credits: {
      //TODO fill in proper credits, all of these fields are optional, see joist.AboutDialog
      leadDesign: '',
      softwareDevelopment: '',
      team: '',
      qualityAssurance: '',
      graphicArts: '',
      thanks: ''
    }
  };

  // Appending '?dev' to the URL will enable developer-only features.
  if ( phet.phetcommon.getQueryParameter( 'dev' ) ) {
    simOptions = _.extend( {
      // add dev-specific options here
    }, simOptions );
  }

  SimLauncher.launch( function() {
    var sim = new Sim( simTitle, [ new MakeIsotopesScreen() ], simOptions );
    sim.start();
  } );
} );