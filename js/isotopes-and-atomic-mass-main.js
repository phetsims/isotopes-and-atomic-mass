// Copyright 2014-2019, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const MakeIsotopesScreen = require( 'ISOTOPES_AND_ATOMIC_MASS/make-isotopes/MakeIsotopesScreen' );
  const MixIsotopesScreen = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/MixIsotopesScreen' );
  const Sim = require( 'JOIST/Sim' );
  const SimLauncher = require( 'JOIST/SimLauncher' );
  const Tandem = require( 'TANDEM/Tandem' );

  // strings
  const isotopesAndAtomicMassTitleString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/isotopes-and-atomic-mass.title' );

  const tandem = Tandem.ROOT;

  const simOptions = {
    credits: {
      leadDesign: 'Amy Hanson, Kelly Lancaster',
      softwareDevelopment: 'John Blanco, Jesse Greenberg, Aadish Gupta, Sam Reid, James Smith',
      team: 'Jack Barbera, Suzanne Brahmia, Sue Doubler, Loretta Jones, Trish Loeblein, Emily B. Moore, Robert Parson, ' +
            'Ariel Paul, Kathy Perkins',
      qualityAssurance: 'Steele Dalton, Bryce Griebenow, Elise Morgan, Ben Roberts'
    }
  };

  SimLauncher.launch( function() {
    const makeIsotopeScreenTandem = tandem.createTandem( 'makeIsotopeScreen' );
    const mixIsotopeScreenTandem = tandem.createTandem( 'mixIsotopeScreen' );

    const sim = new Sim( isotopesAndAtomicMassTitleString, [ new MakeIsotopesScreen( makeIsotopeScreenTandem ), new MixIsotopesScreen( mixIsotopeScreenTandem ) ], simOptions );
    sim.start();
  } );
} );
