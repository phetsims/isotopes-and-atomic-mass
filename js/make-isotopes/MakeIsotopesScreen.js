// Copyright 2014-2020, University of Colorado Boulder

/**
 * The "Make Isotopes" screen
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */

import Screen from '../../../joist/js/Screen.js';
import inherit from '../../../phet-core/js/inherit.js';
import Image from '../../../scenery/js/nodes/Image.js';
import makeIsotopesIcon from '../../mipmaps/make-isotopes-icon_png.js';
import isotopesAndAtomicMassStrings from '../isotopes-and-atomic-mass-strings.js';
import isotopesAndAtomicMass from '../isotopesAndAtomicMass.js';
import MakeIsotopesModel from './model/MakeIsotopesModel.js';
import MakeIsotopesScreenView from './view/MakeIsotopesScreenView.js';

const isotopesString = isotopesAndAtomicMassStrings.isotopes;


/**
 * @param {Tandem} tandem
 * @constructor
 */
function MakeIsotopesScreen( tandem ) {

  const options = {
    name: isotopesString,
    homeScreenIcon: new Image( makeIsotopesIcon ),
    tandem: tandem
  };

  Screen.call( this,
    function() { return new MakeIsotopesModel(); },
    function( model ) { return new MakeIsotopesScreenView( model, tandem ); },
    options );
}

isotopesAndAtomicMass.register( 'MakeIsotopesScreen', MakeIsotopesScreen );

inherit( Screen, MakeIsotopesScreen );
export default MakeIsotopesScreen;