// Copyright 2014-2026, University of Colorado Boulder

/**
 * The "Isotopes" screen
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import Image from '../../../scenery/js/nodes/Image.js';
import Tandem from '../../../tandem/js/Tandem.js';
import isotopesIcon_png from '../../mipmaps/isotopesIcon_png.js';
import isotopesAndAtomicMass from '../isotopesAndAtomicMass.js';
import IsotopesAndAtomicMassStrings from '../IsotopesAndAtomicMassStrings.js';
import IsotopesModel from './model/IsotopesModel.js';
import IsotopesScreenView from './view/IsotopesScreenView.js';

class IsotopesScreen extends Screen<IsotopesModel, IsotopesScreenView> {

  public constructor( tandem: Tandem ) {

    const options = {
      name: IsotopesAndAtomicMassStrings.isotopesStringProperty,
      homeScreenIcon: new ScreenIcon( new Image( isotopesIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      tandem: tandem
    };

    super(
      () => new IsotopesModel(),
      ( model: IsotopesModel ) => new IsotopesScreenView( model, tandem ),
      options
    );
  }
}

isotopesAndAtomicMass.register( 'IsotopesScreen', IsotopesScreen );
export default IsotopesScreen;