// Copyright 2014-2025, University of Colorado Boulder

/**
 * The "Mixtures" screen
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author James Smith
 */

import Screen, { ScreenOptions } from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import Image from '../../../scenery/js/nodes/Image.js';
import Tandem from '../../../tandem/js/Tandem.js';
import mixturesIcon_png from '../../mipmaps/mixturesIcon_png.js';
import isotopesAndAtomicMass from '../isotopesAndAtomicMass.js';
import IsotopesAndAtomicMassStrings from '../IsotopesAndAtomicMassStrings.js';
import MixturesModel from './model/MixturesModel.js';
import MixturesScreenView from './view/MixturesScreenView.js';

class MixturesScreen extends Screen<MixturesModel, MixturesScreenView> {

  /**
   * @param tandem - Tandem instance for instrumentation
   */
  public constructor( tandem: Tandem ) {

    const options: ScreenOptions = {
      name: IsotopesAndAtomicMassStrings.mixturesStringProperty,
      homeScreenIcon: new ScreenIcon( new Image( mixturesIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      tandem: tandem
    };

    super(
      () => new MixturesModel(),
      model => new MixturesScreenView( model, tandem ),
      options
    );
  }
}

isotopesAndAtomicMass.register( 'MixturesScreen', MixturesScreen );
export default MixturesScreen;