// Copyright 2026, University of Colorado Boulder

/**
 * The function getIsotopeColor is used to get the color used in the view to portray an instance of the provided
 * isotope configuration.  The color values are based on the relative atomic number of the isotope.  Color values are
 * calculated the first time a given isotope configuration is encountered, and then stored for fast retrieval
 * thereafter.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import affirm from '../../../../perennial-alias/js/browser-and-node/affirm.js';
import Color from '../../../../scenery/js/util/Color.js';
import AtomInfoUtils from '../../../../shred/js/AtomInfoUtils.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';

const ISOTOPE_COLORS = [ new Color( 180, 82, 205 ), Color.green, new Color( 255, 69, 0 ), new Color( 72, 137, 161 ) ];

const isotopeColorCache: Color[][] = [];

const getIsotopeColor = ( protonCount: number, neutronCount: number ): Color => {

  // Use the cached color if it has already been calculated for this isotope configuration.
  if ( !isotopeColorCache[ protonCount ] || !isotopeColorCache[ protonCount ][ neutronCount ] ) {

    // Sort by mass number.
    const stableIsotopes = AtomInfoUtils.getStableIsotopesOfElement( protonCount );
    stableIsotopes.sort( ( isotope1, isotope2 ) => isotope1.neutronCount - isotope2.neutronCount );

    isotopeColorCache[ protonCount ] = [];
    stableIsotopes.forEach( ( isotopeConfig, index ) => {
      affirm( ISOTOPE_COLORS[ index ], 'not enough colors defined for the number of isotopes' );
      isotopeColorCache[ protonCount ][ isotopeConfig.neutronCount ] = ISOTOPE_COLORS[ index ];
    } );
  }

  return isotopeColorCache[ protonCount ][ neutronCount ] || Color.GRAY;
};

isotopesAndAtomicMass.register( 'getIsotopeColor', getIsotopeColor );

export default getIsotopeColor;