//  Copyright 2002-2014, University of Colorado Boulder

/**
 * This is the primary model class for the Make Isotopes module.  This class acts as the main interface for model
 * actions, and contains the constituent model elements.  It watches all neutrons and, based on where they are placed by
 * the user, moves them between the neutron bucket and the atom. In this model, units are picometers (1E-12).
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var SphereBucket = require( 'PHETCOMMON/model/SphereBucket' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Color = require( 'SCENERY/util/Color' );
  var NumberAtom = require( 'SHRED/model/NumberAtom' );
  var AtomIdentifier = require( 'SHRED/AtomIdentifier' );
  var SharedConstants = require( 'SHRED/SharedConstants' );
  var PropertySet = require('AXON/PropertySet');


  // Strings
  var neutronsNameString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/neutrons.name' );


 /**
  * Constructor for the Mix Isotopes Model
  **/
  function MixIsotopesModel(){

  }

  return inherit( PropertySet, MixIsotopesModel, {

  } );
} );
