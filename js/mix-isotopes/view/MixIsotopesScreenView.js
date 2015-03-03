//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Screen view for the tab where the user makes isotopes of a given element by adding and removing neutrons.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Vector2 = require( 'DOT/Vector2' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Node = require( 'SCENERY/nodes/Node' );
  var BucketDragHandler = require( 'SHRED/view/BucketDragHandler' );
  var BucketFront = require( 'SCENERY_PHET/bucket/BucketFront' );
  var PeriodicTableNode = require( 'SHRED/view/PeriodicTableNode' );

  // class data

  /**
   * @param {MakeIsotopesModel} makeIsotopesModel
   * @constructor
   */
  function IsotopeElectronCloudView( makeIsotopesModel ) {
    // supertype constructor
    ScreenView.call( this, { renderer: 'svg', layoutBounds: new Bounds2( 0, 0, 768, 504 ) } );


  return inherit( ScreenView, MixIsotopesScreenView, {

    // Called by the animation loop. Optional, so if your view has no animation, you can omit this.
    step: function( dt ) {
      // Handle view animation here.
    }
  } );
} );
