// Copyright 2002-2013, University of Colorado Boulder

/**
 * View representation of the atom.  Mostly, this is responsible for displaying and updating the labels, since the atom
 * itself is represented by particles, which take care of themselves in the view.  This is essentially identical to
 * AtomNode of 'Build an Atom' with some reduced functionality.
 *
 * TODO: Perhaps IsotopeAtomNode and AtomNode should inherit from some other base class to be located in shred.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  // Imports
  var AtomIdentifier = require( 'SHRED/AtomIdentifier' );
  var IsotopeElectronCloudView = require( 'SHRED/view/IsotopeElectronCloudView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Vector2 = require( 'DOT/Vector2' );

  // Strings
  var stableString = require( 'string!SHRED/stable' );
  var unstableString = require( 'string!SHRED/unstable' );

  // Constants
  var ELEMENT_NAME_FONT_SIZE = 16;

  /**
   * Constructor for an IsotopeAtomNode.
   *
   * @param {ParticleAtom} particleAtom Model that represents the atom, including particle positions
   * @param {Vector2} bottomPoint desired bottom point of the atom which holds the atom in position as the size changes.
   * @param {ModelViewTransform2} mvt Model-View transform
   * @constructor
   */
  function IsotopeAtomNode( particleAtom, bottomPoint, mvt ) {

    Node.call( this ); // Call super constructor.
    var thisAtomView = this;

    this.atom = particleAtom;
    this.mvt = mvt;

    // Add the electron cloud.
    var isotopeElectronCloud = new IsotopeElectronCloudView( particleAtom, mvt );
    this.addChild( isotopeElectronCloud );

    // Create the textual readout for the element name.
    this.elementName = new Text( '', { font: new PhetFont( { size: ELEMENT_NAME_FONT_SIZE, weight: 'bold' } ) } );
    this.addChild( this.elementName );

    // Define the update function for the element name.
    var updateElementName = function() {
      var name = AtomIdentifier.getName( thisAtomView.atom.protons.length );
      if ( name.length === 0 ) {
        name = '';
      }
      thisAtomView.elementName.text = name;
      thisAtomView.elementName.setScaleMagnitude( 1 );
      var maxLabelWidth = mvt.modelToViewDeltaX( particleAtom.innerElectronShellRadius * 1.4 );
      thisAtomView.elementName.setScaleMagnitude( Math.min( maxLabelWidth / thisAtomView.elementName.width, 1 ) );
      thisAtomView.elementName.center = mvt.modelToViewPosition( particleAtom.position.plus( new Vector2( 0, particleAtom.innerElectronShellRadius * 0.33 ) ) );
    };
    updateElementName(); // Do the initial update.

    // Hook up update listeners.
    particleAtom.protons.lengthProperty.link( function() {
      updateElementName();
    } );

    // Create the textual readout for the stability indicator.
    this.stabilityIndicator = new Text( '', { font: new PhetFont( { size: 12, weight: 'bold' } ) } );
    this.addChild( this.stabilityIndicator );

    // Define the update function for the stability indicator.
    var updateStabilityIndicator = function() {
      var stabilityIndicatorCenterPos = mvt.modelToViewPosition( particleAtom.position.plus( new Vector2( 0, -particleAtom.innerElectronShellRadius * 0.33 ) ) );
      if ( thisAtomView.atom.protons.length > 0 ) {
        if ( AtomIdentifier.isStable( thisAtomView.atom.protons.length, thisAtomView.atom.neutrons.length ) ) {
          thisAtomView.stabilityIndicator.text = stableString;
        }
        else {
          thisAtomView.stabilityIndicator.text = unstableString;
        }
      }
      else {
        thisAtomView.stabilityIndicator.text = '';
      }
      thisAtomView.stabilityIndicator.center = stabilityIndicatorCenterPos;
    };
    updateStabilityIndicator(); // Do initial update.

    // Add the handler that keeps the bottom of the atom in one place.  This was added due to a request to make the
    // atom get larger and smaller but to stay on the scale.
    var updateAtomPosition = function() {
      var newCenter = new Vector2( bottomPoint.x, bottomPoint.y - isotopeElectronCloud.height / 2 );
      particleAtom.position = mvt.viewToModelPosition( newCenter );
      isotopeElectronCloud.center = newCenter; // view element does not need model view transform.
    };
    updateAtomPosition(); // Do initial update.

    // Add the listeners that control the atom position and label content.
    particleAtom.protons.lengthProperty.link( function() {
      updateAtomPosition();
      updateElementName();
      updateStabilityIndicator();
    } );
    particleAtom.neutrons.lengthProperty.link( updateStabilityIndicator );

  }

  // Inherit from Node.
  return inherit( Node, IsotopeAtomNode );
} );
