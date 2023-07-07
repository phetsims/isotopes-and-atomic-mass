// Copyright 2014-2022, University of Colorado Boulder

/**
 * The "Mix Isotopes" screen
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author James Smith
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import mixIsotopesIcon_png from '../../mipmaps/mixIsotopesIcon_png.js';
import isotopesAndAtomicMass from '../isotopesAndAtomicMass.js';
import IsotopesAndAtomicMassStrings from '../IsotopesAndAtomicMassStrings.js';
import MixIsotopesModel from './model/MixIsotopesModel.js';
import MixIsotopesScreenView from './view/MixIsotopesScreenView.js';

class MixIsotopesScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    const options = {
      name: IsotopesAndAtomicMassStrings.mixturesStringProperty,
      homeScreenIcon: new ScreenIcon( new Image( mixIsotopesIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      tandem: tandem
    };

    super(
      () => new MixIsotopesModel(),
      model => new MixIsotopesScreenView( model, tandem ),
      options );
  }
}

isotopesAndAtomicMass.register( 'MixIsotopesScreen', MixIsotopesScreen );
export default MixIsotopesScreen;