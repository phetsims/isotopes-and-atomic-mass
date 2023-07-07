// Copyright 2014-2022, University of Colorado Boulder

/**
 * The "Make Isotopes" screen
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import makeIsotopesIcon_png from '../../mipmaps/makeIsotopesIcon_png.js';
import isotopesAndAtomicMass from '../isotopesAndAtomicMass.js';
import IsotopesAndAtomicMassStrings from '../IsotopesAndAtomicMassStrings.js';
import MakeIsotopesModel from './model/MakeIsotopesModel.js';
import MakeIsotopesScreenView from './view/MakeIsotopesScreenView.js';

class MakeIsotopesScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    const options = {
      name: IsotopesAndAtomicMassStrings.isotopesStringProperty,
      homeScreenIcon: new ScreenIcon( new Image( makeIsotopesIcon_png ), {
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