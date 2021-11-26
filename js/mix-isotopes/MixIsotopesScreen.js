// Copyright 2014-2021, University of Colorado Boulder

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
import mixIsotopesIcon from '../../mipmaps/mix-isotopes-icon_png.js';
import isotopesAndAtomicMass from '../isotopesAndAtomicMass.js';
import isotopesAndAtomicMassStrings from '../isotopesAndAtomicMassStrings.js';
import MixIsotopesModel from './model/MixIsotopesModel.js';
import MixIsotopesScreenView from './view/MixIsotopesScreenView.js';

class MixIsotopesScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    const options = {
      name: isotopesAndAtomicMassStrings.mixtures,
      homeScreenIcon: new ScreenIcon( new Image( mixIsotopesIcon ), {
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