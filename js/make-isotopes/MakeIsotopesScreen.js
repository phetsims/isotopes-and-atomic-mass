// Copyright 2014-2021, University of Colorado Boulder

/**
 * The "Make Isotopes" screen
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import makeIsotopesIcon from '../../mipmaps/make-isotopes-icon_png.js';
import isotopesAndAtomicMass from '../isotopesAndAtomicMass.js';
import isotopesAndAtomicMassStrings from '../isotopesAndAtomicMassStrings.js';
import MakeIsotopesModel from './model/MakeIsotopesModel.js';
import MakeIsotopesScreenView from './view/MakeIsotopesScreenView.js';

class MakeIsotopesScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    const options = {
      name: isotopesAndAtomicMassStrings.isotopes,
      homeScreenIcon: new ScreenIcon( new Image( makeIsotopesIcon ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      tandem: tandem
    };

    super(
      () => new MakeIsotopesModel(),
      model => new MakeIsotopesScreenView( model, tandem ),
      options );
  }
}

isotopesAndAtomicMass.register( 'MakeIsotopesScreen', MakeIsotopesScreen );
export default MakeIsotopesScreen;