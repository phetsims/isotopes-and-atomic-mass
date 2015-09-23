// Copyright 2002-2013, University of Colorado Boulder

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
  var AtomIdentifier = require( 'SHRED/AtomIdentifier' );
  var IsotopeElectronCloudView = require( 'SHRED/view/IsotopeElectronCloudView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
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
   * @param {NumberAtom} numberAtom Model that representa the atom as a collection of numbers
   * @param {Vector2} bottomPoint desired bottom point of the atom which holds the atom in position as the size changes.
   * @param {ModelViewTransform2} modelViewTransform Model-View transform
   * @constructor
   */
  function IsotopeAtomNode( particleAtom, numberAtom, bottomPoint, modelViewTransform ) {

    Node.call( this ); // Call super constructor.
    var thisAtomView = this;

    this.atom = numberAtom;
    this.modelViewTransform = modelViewTransform;

    // Add the electron cloud.
    var isotopeElectronCloud = new IsotopeElectronCloudView( numberAtom, modelViewTransform );
    this.addChild( isotopeElectronCloud );

    // Create the textual readout for the element name.
    this.elementName = new Text( '', { font: new PhetFont( { size: ELEMENT_NAME_FONT_SIZE, weight: 'bold' } ) } );
    this.addChild( this.elementName );

    // Define the update function for the element name.
    var updateElementName = function( numProtons ) {
      // get element name and append mass number to identify isotope
      var name = AtomIdentifier.getName( thisAtomView.atom.protonCount ) + '-' + thisAtomView.atom.massNumber;
      if ( name.length === 0 ) {
        name = '';
      }
      thisAtomView.elementName.text = name;
      thisAtomView.elementName.setScaleMagnitude( 1 );
      var maxLabelWidth = modelViewTransform.modelToViewDeltaX( particleAtom.innerElectronShellRadius * 1.4 );
      thisAtomView.elementName.setScaleMagnitude( Math.min( maxLabelWidth / thisAtomView.elementName.width, 1 ) );
      thisAtomView.elementName.center = modelViewTransform.modelToViewPosition( particleAtom.position.plus( new Vector2( 0, isotopeElectronCloud.radius * 0.60) ) );
    };

    // Create the textual readout for the stability indicator.
    this.stabilityIndicator = new Text( '', { font: new PhetFont( { size: 12, weight: 'bold' } ) } );
    this.addChild( this.stabilityIndicator );

    // Define the update function for the stability indicator.
    var updateStabilityIndicator = function() {
      var stabilityIndicatorCenterPos = modelViewTransform.modelToViewPosition( particleAtom.position.plus( new Vector2( 0, -isotopeElectronCloud.radius * 0.60 ) ) );
      if ( thisAtomView.atom.protonCount > 0 ) {
        if ( AtomIdentifier.isStable( thisAtomView.atom.protonCount, thisAtomView.atom.neutronCount ) ) {
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
    var updateAtomPosition = function( numProtons ) {
      var newCenter = new Vector2( bottomPoint.x, bottomPoint.y - isotopeElectronCloud.getElectronShellDiameter( numProtons ) / 2 );
      particleAtom.position = modelViewTransform.viewToModelPosition( newCenter );
      isotopeElectronCloud.center = new Vector2( bottomPoint.x, bottomPoint.y - isotopeElectronCloud.getElectronShellDiameter( numProtons ) / 2 );
    };

    numberAtom.protonCountProperty.link( function( numProtons ) {
      updateAtomPosition( numProtons );
      updateElementName();
    });

    numberAtom.neutronCountProperty.link( function( numNeutrons ) {
      updateElementName();
      updateStabilityIndicator();
    } );

  }

  // Inherit from Node.
  return inherit( Node, IsotopeAtomNode );
} );
