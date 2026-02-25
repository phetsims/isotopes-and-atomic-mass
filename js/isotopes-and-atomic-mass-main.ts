// Copyright 2014-2026, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Sim, { SimOptions } from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import IsotopesScreen from './isotopes/IsotopesScreen.js';
import IsotopesAndAtomicMassStrings from './IsotopesAndAtomicMassStrings.js';
import MixturesScreen from './mixtures/MixturesScreen.js';

const isotopesAndAtomicMassTitleStringProperty = IsotopesAndAtomicMassStrings[ 'isotopes-and-atomic-mass' ].titleStringProperty;

const tandem = Tandem.ROOT;

const options: SimOptions = {
  credits: {
    leadDesign: 'Amy Hanson, Kelly Lancaster',
    softwareDevelopment: 'John Blanco, Jesse Greenberg, Aadish Gupta, Sam Reid, James Smith',
    team: 'Jack Barbera, Suzanne Brahmia, Sue Doubler, Loretta Jones, Trish Loeblein, Emily B. Moore, Robert Parson, ' +
          'Ariel Paul, Kathy Perkins',
    qualityAssurance: 'Steele Dalton, Bryce Griebenow, Elise Morgan, Ben Roberts'
  }
};

simLauncher.launch( () => {
  const isotopesScreenTandem = tandem.createTandem( 'isotopesScreen' );
  const mixturesScreenTandem = tandem.createTandem( 'mixturesScreen' );

  const sim = new Sim(
    isotopesAndAtomicMassTitleStringProperty,
    [ new IsotopesScreen( isotopesScreenTandem ), new MixturesScreen( mixturesScreenTandem ) ],
    options
  );
  sim.start();
} );