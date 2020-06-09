// Copyright 2014-2020, University of Colorado Boulder

/**
 * The "Mix Isotopes" screen
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author James Smith
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import inherit from '../../../phet-core/js/inherit.js';
import Image from '../../../scenery/js/nodes/Image.js';
import mixIsotopesIcon from '../../mipmaps/mix-isotopes-icon_png.js';
import isotopesAndAtomicMass from '../isotopesAndAtomicMass.js';
import isotopesAndAtomicMassStrings from '../isotopesAndAtomicMassStrings.js';
import MixIsotopesModel from './model/MixIsotopesModel.js';
import MixIsotopesScreenView from './view/MixIsotopesScreenView.js';

const mixturesString = isotopesAndAtomicMassStrings.mixtures;


/**
 * @param {Tandem} tandem
 * @constructor
 */
function MixIsotopesScreen( tandem ) {

  const options = {
    name: mixturesString,
    homeScreenIcon: new ScreenIcon( new Image( mixIsotopesIcon ), {
      maxIconWidthProportion: 1,
      maxIconHeightProportion: 1
    } ),
    tandem: tandem
  };

  Screen.call( this,
    function() { return new MixIsotopesModel(); },
    function( model ) { return new MixIsotopesScreenView( model, tandem ); },
    options );
}

isotopesAndAtomicMass.register( 'MixIsotopesScreen', MixIsotopesScreen );

inherit( Screen, MixIsotopesScreen );
export default MixIsotopesScreen;