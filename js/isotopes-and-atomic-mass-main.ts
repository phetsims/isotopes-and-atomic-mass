// Copyright 2014-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author John Blanco
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import IsotopesAndAtomicMassStrings from './IsotopesAndAtomicMassStrings.js';
import MakeIsotopesScreen from './make-isotopes/MakeIsotopesScreen.js';
import MixIsotopesScreen from './mix-isotopes/MixIsotopesScreen.js';

const isotopesAndAtomicMassTitleStringProperty = IsotopesAndAtomicMassStrings[ 'isotopes-and-atomic-mass' ].titleStringProperty;

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

simLauncher.launch( () => {
  const makeIsotopeScreenTandem = tandem.createTandem( 'makeIsotopeScreen' );
  const mixIsotopeScreenTandem = tandem.createTandem( 'mixIsotopeScreen' );

  const sim = new Sim( isotopesAndAtomicMassTitleStringProperty, [ new MakeIsotopesScreen( makeIsotopeScreenTandem ), new MixIsotopesScreen( mixIsotopeScreenTandem ) ], simOptions );
  sim.start();
} );