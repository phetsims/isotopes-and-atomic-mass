// Copyright 2015, University of Colorado Boulder

/**
 * View representation of the atom.  Mostly, this is responsible for displaying and updating the labels, since the atom
 * itself is represented by particles, which take care of themselves in the view.  This view element also maintains
 * the electron cloud.  This is essentially identical to AtomNode of 'Build an Atom' with some reduced functionality.
 *
 * TODO: Perhaps IsotopeAtomNode and AtomNode should inherit from some other base class to be located in shred.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  // modules
  var isotopesAndAtomicMass = require( 'ISOTOPES_AND_ATOMIC_MASS/isotopesAndAtomicMass' );
  var AtomIdentifier = require( 'SHRED/AtomIdentifier' );
  var IsotopeElectronCloudView = require( 'SHRED/view/IsotopeElectronCloudView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Vector2 = require( 'DOT/Vector2' );

  // strings
  var stableString = require( 'string!SHRED/stable' );
  var unstableString = require( 'string!SHRED/unstable' );

  // constants
  var ELEMENT_NAME_FONT_SIZE = 16;

  /**
   * Constructor for an IsotopeAtomNode.
   *
   * @param {ParticleAtom} particleAtom Model that represents the atom, including particle positions
   * @param {NumberAtom} numberAtom Model that representa the atom as a collection of numbers
   * @param {Vector2} bottomPoint desired bottom point of the atom which holds the atom in position as the size changes.
   * @param {ModelViewTransform2} modelViewTransform Model-View transform
   * @constructor
   */
  function IsotopeAtomNode( particleAtom, numberAtom, bottomPoint, modelViewTransform ) {

    Node.call( this ); // Call super constructor.
    var thisAtomView = this;

    this.atom = particleAtom;
    this.modelViewTransform = modelViewTransform;

    // Add the electron cloud.
    var isotopeElectronCloud = new IsotopeElectronCloudView( particleAtom, modelViewTransform );
    this.addChild( isotopeElectronCloud );



    // Add the handler that keeps the bottom of the atom in one place.  This was added due to a request to make the
    // atom get larger and smaller but to stay on the scale.
    var updateAtomPosition = function( numProtons ) {
      //modelViewTransform.modelToViewDeltaX( thisNode.getElectronShellDiameter( numElectrons ) / 2 )
      var newCenter = new Vector2( bottomPoint.x, bottomPoint.y - modelViewTransform.modelToViewDeltaX( isotopeElectronCloud.getElectronShellDiameter( numProtons ) / 2 ) * 1.2);
      particleAtom.position = modelViewTransform.viewToModelPosition( newCenter );
      isotopeElectronCloud.center = newCenter;
    };

    particleAtom.protonCountProperty.link( function( numProtons ) {
      updateAtomPosition( numProtons );
    });
  }

  isotopesAndAtomicMass.register( 'IsotopeAtomNode', IsotopeAtomNode );
  // Inherit from Node.
  return inherit( Node, IsotopeAtomNode );
} );
