// Copyright 2014-2019, University of Colorado Boulder

/**
 * This class defines a Node that represents an atom in "schematic" (i.e. Bohr) form and allows users to add or remove
 * neutrons from/to a bucket in order to create different isotopes of a particular atom.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Aadish Gupta
 */


import Vector2 from '../../../../dot/js/Vector2.js';
import inherit from '../../../../phet-core/js/inherit.js';
import BucketFront from '../../../../scenery-phet/js/bucket/BucketFront.js';
import BucketHole from '../../../../scenery-phet/js/bucket/BucketHole.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import shredStrings from '../../../../shred/js/shred-strings.js';
import BucketDragHandler from '../../../../shred/js/view/BucketDragHandler.js';
import ParticleView from '../../../../shred/js/view/ParticleView.js';
import isotopesAndAtomicMassStrings from '../../isotopes-and-atomic-mass-strings.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import IsotopeAtomNode from './IsotopeAtomNode.js';

const myIsotopeString = isotopesAndAtomicMassStrings.myIsotope;
const stableString = shredStrings.stable;
const unstableString = shredStrings.unstable;

// constants
const NUM_NUCLEON_LAYERS = 5; // This is based on max number of particles, may need adjustment if that changes.
const ELEMENT_NAME_FONT_SIZE = 16;

/**
 * Constructor for an InteractiveIsotopeNode
 * @param {MakeIsotopesModel} makeIsotopesModel
 * @param {ModelViewTransform2} modelViewTransform
 * @param {Vector2} bottomPoint
 * @constructor
 */
function InteractiveIsotopeNode( makeIsotopesModel, modelViewTransform, bottomPoint ) {
  Node.call( this );
  const self = this;
  this.modelViewTransform = modelViewTransform; // extend scope of modelViewTransform.

  // Add the node that shows the textual labels and electron cloud.
  const isotopeAtomNode = new IsotopeAtomNode( makeIsotopesModel.particleAtom, bottomPoint, modelViewTransform );
  this.addChild( isotopeAtomNode );
  const myIsotopeLabel = new Text( myIsotopeString, {
    font: new PhetFont( { size: 16, weight: 'bold' } ),
    fill: 'black',
    centerX: isotopeAtomNode.centerX,
    maxWidth: 100
  } );
  this.addChild( myIsotopeLabel );
  myIsotopeLabel.bottom = isotopeAtomNode.top - 5;

  // Add the bucket components that hold the neutrons.
  const neutronBucketHole = new BucketHole( makeIsotopesModel.neutronBucket, modelViewTransform );
  const neutronBucketFront = new BucketFront( makeIsotopesModel.neutronBucket, modelViewTransform );
  neutronBucketFront.addInputListener( new BucketDragHandler(
    makeIsotopesModel.neutronBucket,
    neutronBucketFront,
    modelViewTransform
  ) );

  // Bucket hole is first item added to view for proper layering.
  this.addChild( neutronBucketHole );

  // Add the layers where the nucleons will be maintained.
  const nucleonLayersNode = new Node();
  const nucleonLayers = [];
  _.times( NUM_NUCLEON_LAYERS, function() {
    const nucleonLayer = new Node();
    nucleonLayers.push( nucleonLayer );
    nucleonLayersNode.addChild( nucleonLayer );
  } );
  nucleonLayers.reverse(); // Set up the nucleon layers so that layer 0 is in front.

  // Function to adjust z-layer ordering for a particle. This is to be linked to the particle's zLayer property.
  const adjustZLayer = function( addedAtom, zLayer ) {
    assert && assert( nucleonLayers.length > zLayer,
      'zLayer for proton exceeds number of layers, max number may need increasing.' );
    // Determine whether proton view is on the correct layer.
    let onCorrectLayer = false;
    nucleonLayers[ zLayer ].children.forEach( function( particleView ) {
      if ( particleView.particle === addedAtom ) {
        onCorrectLayer = true;
      }
    } );
    if ( !onCorrectLayer ) {
      // Remove particle view from its current layer.
      let particleView = null;
      for ( let layerIndex = 0; layerIndex < nucleonLayers.length && particleView === null; layerIndex++ ) {
        for ( let childIndex = 0; childIndex < nucleonLayers[ layerIndex ].children.length; childIndex++ ) {
          if ( nucleonLayers[ layerIndex ].children[ childIndex ].particle === addedAtom ) {
            particleView = nucleonLayers[ layerIndex ].children[ childIndex ];
            nucleonLayers[ layerIndex ].removeChildAt( childIndex );
            break;
          }
        }
      }
      // Add the particle view to its new layer.
      assert && assert( particleView !== null, 'Particle view not found during relayering' );
      nucleonLayers[ zLayer ].addChild( particleView );
    }
  };

  // function to add the view for a nucleon, i.e. a proton or neutron
  function addParticleView( addedParticle ) {
    assert && assert(
      addedParticle.type === 'proton' || addedParticle.type === 'neutron',
      'unrecognized particle type'
    );

    const particleView = new ParticleView( addedParticle, self.modelViewTransform );
    particleView.center = self.modelViewTransform.modelToViewPosition( addedParticle.positionProperty.get() );
    particleView.pickable = addedParticle.type === 'neutron';

    // add particle view to correct z layer.
    nucleonLayers[ addedParticle.zLayerProperty.get() ].addChild( particleView );

    const adjustZLayerLink = function( zLayer ) {
      adjustZLayer( addedParticle, zLayer );
    };

    // Add a listener that adjusts a nucleon's z-order layering.
    addedParticle.zLayerProperty.link( adjustZLayerLink );

    const moveParticleToFront = function( value ) {
      if ( value ) {
        particleView.moveToFront();
      }
    };
    addedParticle.userControlledProperty.link( moveParticleToFront );

    // Add the item removed listener.
    let temp;
    if ( addedParticle.type === 'proton' ) {
      temp = makeIsotopesModel.protons;
    }
    else if ( addedParticle.type === 'neutron' ) {
      temp = makeIsotopesModel.neutrons;
    }

    temp.addItemRemovedListener( function removalListener( removedAtom ) {
      if ( removedAtom === addedParticle ) {
        nucleonLayers[ addedParticle.zLayerProperty.get() ].removeChild( particleView );
        particleView.dispose();
        addedParticle.zLayerProperty.unlink( adjustZLayerLink );
        addedParticle.userControlledProperty.unlink( moveParticleToFront );
        temp.removeItemRemovedListener( removalListener );
      }
    } );
  }

  makeIsotopesModel.protons.forEach( function( proton ) { addParticleView( proton ); } );

  makeIsotopesModel.neutrons.forEach( function( neutron ) { addParticleView( neutron ); } );

  // add the item added listeners for particles of this isotope
  makeIsotopesModel.protons.addItemAddedListener( function( addedAtom ) { addParticleView( addedAtom ); } );

  // add the item added listeners for particles of this isotope
  makeIsotopesModel.neutrons.addItemAddedListener( function( addedAtom ) { addParticleView( addedAtom ); } );

  // Create the textual readout for the element name.
  const elementName = new Text( '', { font: new PhetFont( { size: ELEMENT_NAME_FONT_SIZE, weight: 'bold' } ) } );
  this.addChild( elementName );

  // Define the update function for the element name.
  const updateElementName = function( numProtons, numNeutrons ) {

    // This data structure maps the vertical distance of element name from the nucleus center for each supported
    // number of nucleons.  These values were empirically determined, and are set so that the label looks good and
    // doesn't overlap with the nucleus.
    const mapElementToPosition = {
      1: 35,
      2: 35,
      3: 40,
      4: 42,
      5: 44,
      6: 47,
      7: 47,
      8: 50,
      9: 50,
      10: 50
    };

    // get element name and append mass number to identify isotope
    let name = AtomIdentifier.getName( numProtons ) + '-' + ( numProtons + numNeutrons );
    if ( name.length === 0 ) {
      name = '';
    }
    elementName.text = name;
    const isotopeAtomNodeRadius = isotopeAtomNode.centerY - isotopeAtomNode.top;
    let elementNameMaxWidth;
    if ( isotopeAtomNodeRadius > mapElementToPosition[ numProtons ] ) {

      // limit the width of the element name to fit in the electron cloud
      elementNameMaxWidth = 2 * Math.sqrt(
        ( isotopeAtomNodeRadius * isotopeAtomNodeRadius ) -
        ( mapElementToPosition[ numProtons ] * mapElementToPosition[ numProtons ] )
      );
    }
    else {

      // This else clause can occur if there are no electrons.  In that case, use an empirically determined max width.
      elementNameMaxWidth = 30;
    }
    elementName.maxWidth = elementNameMaxWidth;
    elementName.center = new Vector2(
      isotopeAtomNode.centerX,
      isotopeAtomNode.centerY - mapElementToPosition[ numProtons ]
    );
  };

  // Create the textual readout for the stability indicator.
  const stabilityIndicator = new Text( '', { font: new PhetFont( { size: 12, weight: 'bold' } ) } );
  this.addChild( stabilityIndicator );

  // Define the update function for the stability indicator.
  const updateStabilityIndicator = function( numProtons, numNeutrons ) {

    // This data structure maps the vertical distance of stable/unstable label to the center of nucleus so that labels
    // look good and don't overlap with nucleons in the nucleus. These values have been empirically determined
    const mapStableUnstableToPosition = {
      1: 30,
      2: 35,
      3: 40,
      4: 42,
      5: 44,
      6: 47,
      7: 47,
      8: 50,
      9: 50,
      10: 50
    };
    const stabilityIndicatorCenterPos = new Vector2(
      isotopeAtomNode.centerX,
      isotopeAtomNode.centerY + mapStableUnstableToPosition[ numProtons ]
    );
    const isotopeAtomNodeRadius = isotopeAtomNode.centerY - isotopeAtomNode.top;
    let stabilityIndicatorMaxWidth;
    if ( isotopeAtomNodeRadius > mapStableUnstableToPosition[ numProtons ] ) {

      // limit stability indicator label to fit inside the electron cloud
      stabilityIndicatorMaxWidth = 2 * Math.sqrt(
        ( isotopeAtomNodeRadius * isotopeAtomNodeRadius ) -
        ( mapStableUnstableToPosition[ numProtons ] * mapStableUnstableToPosition[ numProtons ] )
      );
    }
    else {

      // This else clause can occur if there are no electrons.  In that case, use an empirically determined max width.
      stabilityIndicatorMaxWidth = 30;
    }

    // set the text of the stability indicator
    if ( numProtons > 0 ) {
      if ( AtomIdentifier.isStable( numProtons, numNeutrons ) ) {
        stabilityIndicator.text = stableString;
      }
      else {
        stabilityIndicator.text = unstableString;
      }
    }
    else {
      stabilityIndicator.text = '';
    }

    // position and limit the width
    stabilityIndicator.maxWidth = stabilityIndicatorMaxWidth;
    stabilityIndicator.center = stabilityIndicatorCenterPos;
  };

  self.addChild( nucleonLayersNode );
  // Add the neutron bucket child here for proper layering with neutrons.
  this.addChild( neutronBucketFront );

  makeIsotopesModel.atomReconfigured.addListener( function() {
    updateElementName(
      makeIsotopesModel.particleAtom.protonCountProperty.get(),
      makeIsotopesModel.particleAtom.neutronCountProperty.get()
    );
    updateStabilityIndicator(
      makeIsotopesModel.particleAtom.protonCountProperty.get(),
      makeIsotopesModel.particleAtom.neutronCountProperty.get()
    );
    myIsotopeLabel.bottom = isotopeAtomNode.top - 5;
  } );

  // initial update
  updateElementName(
    makeIsotopesModel.particleAtom.protonCountProperty.get(),
    makeIsotopesModel.particleAtom.neutronCountProperty.get()
  );
  updateStabilityIndicator(
    makeIsotopesModel.particleAtom.protonCountProperty.get(),
    makeIsotopesModel.particleAtom.neutronCountProperty.get()
  );
}

isotopesAndAtomicMass.register( 'InteractiveIsotopeNode', InteractiveIsotopeNode );
export default inherit( Node, InteractiveIsotopeNode, {} );