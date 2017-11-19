// Copyright 2014-2017, University of Colorado Boulder

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

  var tandem = Tandem.rootTandem;

  var simOptions = {
    credits: {
      leadDesign: 'Amy Hanson, Kelly Lancaster',
      softwareDevelopment: 'John Blanco, Jesse Greenberg, Aadish Gupta, Sam Reid, James Smith',
      team: 'Jack Barbera, Suzanne Brahmia, Sue Doubler, Loretta Jones, Trish Loeblein, Emily B. Moore, Robert Parson, ' +
            'Ariel Paul, Kathy Perkins',
      qualityAssurance: 'Steele Dalton, Bryce Griebenow, Elise Morgan, Ben Roberts'
    }
  };

  SimLauncher.launch( function() {
    var makeIsotopeScreenTandem = tandem.createTandem( 'makeIsotopeScreen' );
    var mixIsotopeScreenTandem = tandem.createTandem( 'mixIsotopeScreen' );

    var sim = new Sim( isotopesAndAtomicMassTitleString, [ new MakeIsotopesScreen( makeIsotopeScreenTandem ), new MixIsotopesScreen( mixIsotopeScreenTandem ) ], simOptions );
    sim.start();
  } );
} );
