// Copyright 2014-2025, University of Colorado Boulder

/**
 * This class defines a Node that represents an atom in made out of particles and allows users to add or remove
 * neutrons to form different isotopes.  The neutrons that are not part of the atom reside in a bucket.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Aadish Gupta
 */

import { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import BucketFront from '../../../../scenery-phet/js/bucket/BucketFront.js';
import BucketHole from '../../../../scenery-phet/js/bucket/BucketHole.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import ShredStrings from '../../../../shred/js/ShredStrings.js';
import BucketDragListener from '../../../../shred/js/view/BucketDragListener.js';
import ParticleView from '../../../../shred/js/view/ParticleView.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import IsotopesAndAtomicMassStrings from '../../IsotopesAndAtomicMassStrings.js';
import IsotopeAtomNode from './IsotopeAtomNode.js';
import MakeIsotopesModel from '../model/MakeIsotopesModel.js';
import Particle from '../../../../shred/js/model/Particle.js';

const myIsotopeString = IsotopesAndAtomicMassStrings.myIsotope;
const stableString = ShredStrings.stable;
const unstableString = ShredStrings.unstable;

// constants
const NUM_NUCLEON_LAYERS = 6; // This is based on max number of particles, may need adjustment if that changes.
const ELEMENT_NAME_FONT_SIZE = 16;

class InteractiveIsotopeNode extends Node {

  private readonly modelViewTransform: ModelViewTransform2;

  public constructor(
    makeIsotopesModel: MakeIsotopesModel,
    modelViewTransform: ModelViewTransform2,
    bottomPoint: Vector2
  ) {
    super();
    this.modelViewTransform = modelViewTransform;

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

    const neutronBucketHole = new BucketHole( makeIsotopesModel.neutronBucket, modelViewTransform );
    const neutronBucketFront = new BucketFront( makeIsotopesModel.neutronBucket, modelViewTransform );
    neutronBucketFront.addInputListener( new BucketDragListener(
      makeIsotopesModel.neutronBucket,
      neutronBucketFront,
      modelViewTransform
    ) );

    this.addChild( neutronBucketHole );

    const nucleonLayersNode = new Node();
    const nucleonLayers: Node[] = [];
    for ( let i = 0; i < NUM_NUCLEON_LAYERS; i++ ) {
      const nucleonLayer = new Node();
      nucleonLayers.push( nucleonLayer );
      nucleonLayersNode.addChild( nucleonLayer );
    }
    nucleonLayers.reverse();

    const adjustZLayer = ( addedAtom: Particle, zLayer: number ): void => {
      assert && assert( nucleonLayers.length > zLayer,
        'zLayer for proton exceeds number of layers, max number may need increasing.' );
      let onCorrectLayer = false;
      nucleonLayers[ zLayer ].children.forEach( ( particleView: Node ) => {
        if ( particleView instanceof ParticleView && particleView.particle === addedAtom ) {
          onCorrectLayer = true;
        }
      } );
      if ( !onCorrectLayer ) {
        let particleView: Node | null = null;
        for ( let layerIndex = 0; layerIndex < nucleonLayers.length && particleView === null; layerIndex++ ) {
          for ( let childIndex = 0; childIndex < nucleonLayers[ layerIndex ].children.length; childIndex++ ) {
            const potentialParticleView = nucleonLayers[ layerIndex ].children[ childIndex ];
            if ( potentialParticleView instanceof ParticleView && potentialParticleView.particle === addedAtom ) {
              particleView = potentialParticleView;
              nucleonLayers[ layerIndex ].removeChildAt( childIndex );
              break;
            }
          }
        }
        assert && assert( particleView !== null, 'Particle view not found during relayering' );
        nucleonLayers[ zLayer ].addChild( particleView! );
      }
    };

    const addParticleView = ( addedParticle: Particle ): void => {
      assert && assert(
        addedParticle.type === 'proton' || addedParticle.type === 'neutron',
        'unrecognized particle type'
      );

      const particleView = new ParticleView( addedParticle, this.modelViewTransform );
      particleView.center = this.modelViewTransform.modelToViewPosition( addedParticle.positionProperty.get() );
      particleView.pickable = addedParticle.type === 'neutron';

      nucleonLayers[ addedParticle.zLayerProperty.get() ].addChild( particleView );

      const adjustZLayerLink = ( zLayer: number ): void => {
        adjustZLayer( addedParticle, zLayer );
      };

      addedParticle.zLayerProperty.link( adjustZLayerLink );

      const moveParticleToFront = ( value: boolean ): void => {
        if ( value ) {
          particleView.moveToFront();
        }
      };
      addedParticle.isDraggingProperty.link( moveParticleToFront );

      let temp: ObservableArray<Particle>;
      if ( addedParticle.type === 'proton' ) {
        temp = makeIsotopesModel.protons;
      }
      else {
        assert && assert( addedParticle.type === 'neutron', 'addedParticle must be either a proton or neutron' );
        temp = makeIsotopesModel.neutrons;
      }

      const removalListener = function( removedAtom: Particle ): void {
        if ( removedAtom === addedParticle ) {
          nucleonLayers[ addedParticle.zLayerProperty.get() ].removeChild( particleView );
          particleView.dispose();
          addedParticle.zLayerProperty.unlink( adjustZLayerLink );
          addedParticle.isDraggingProperty.unlink( moveParticleToFront );
          temp.removeItemRemovedListener( removalListener );
        }
      };
      temp.addItemRemovedListener( removalListener );
    };

    makeIsotopesModel.protons.forEach( ( proton: Particle ) => { addParticleView( proton ); } );
    makeIsotopesModel.neutrons.forEach( ( neutron: Particle ) => { addParticleView( neutron ); } );

    makeIsotopesModel.protons.addItemAddedListener( ( addedAtom: Particle ) => { addParticleView( addedAtom ); } );
    makeIsotopesModel.neutrons.addItemAddedListener( ( addedAtom: Particle ) => { addParticleView( addedAtom ); } );

    const elementName = new Text( '', { font: new PhetFont( { size: ELEMENT_NAME_FONT_SIZE, weight: 'bold' } ) } );
    this.addChild( elementName );

    const updateElementName = ( numProtons: number, numNeutrons: number ): void => {
      const mapElementToPosition: Record<number, number> = {
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

      let name = `${AtomIdentifier.getName( numProtons ).value}-${numProtons + numNeutrons}`;
      if ( name.length === 0 ) {
        name = '';
      }
      elementName.string = name;
      const isotopeAtomNodeRadius = isotopeAtomNode.centerY - isotopeAtomNode.top;
      let elementNameMaxWidth: number;
      if ( isotopeAtomNodeRadius > mapElementToPosition[ numProtons ] ) {
        elementNameMaxWidth = 2 * Math.sqrt(
          ( isotopeAtomNodeRadius * isotopeAtomNodeRadius ) -
          ( mapElementToPosition[ numProtons ] * mapElementToPosition[ numProtons ] )
        );
      }
      else {
        elementNameMaxWidth = 30;
      }
      elementName.maxWidth = elementNameMaxWidth;
      elementName.center = new Vector2(
        isotopeAtomNode.centerX,
        isotopeAtomNode.centerY - mapElementToPosition[ numProtons ]
      );
    };

    const stabilityIndicator = new Text( '', { font: new PhetFont( { size: 12, weight: 'bold' } ) } );
    this.addChild( stabilityIndicator );

    const updateStabilityIndicator = ( numProtons: number, numNeutrons: number ): void => {
      const mapStableUnstableToPosition: Record<number, number> = {
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
      let stabilityIndicatorMaxWidth: number;
      if ( isotopeAtomNodeRadius > mapStableUnstableToPosition[ numProtons ] ) {
        stabilityIndicatorMaxWidth = 2 * Math.sqrt(
          ( isotopeAtomNodeRadius * isotopeAtomNodeRadius ) -
          ( mapStableUnstableToPosition[ numProtons ] * mapStableUnstableToPosition[ numProtons ] )
        );
      }
      else {
        stabilityIndicatorMaxWidth = 30;
      }

      if ( numProtons > 0 ) {
        if ( AtomIdentifier.isStable( numProtons, numNeutrons ) ) {
          stabilityIndicator.string = stableString;
        }
        else {
          stabilityIndicator.string = unstableString;
        }
      }
      else {
        stabilityIndicator.string = '';
      }

      stabilityIndicator.maxWidth = stabilityIndicatorMaxWidth;
      stabilityIndicator.center = stabilityIndicatorCenterPos;
    };

    this.addChild( nucleonLayersNode );
    this.addChild( neutronBucketFront );

    makeIsotopesModel.atomReconfigured.addListener( (): void => {
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

    updateElementName(
      makeIsotopesModel.particleAtom.protonCountProperty.get(),
      makeIsotopesModel.particleAtom.neutronCountProperty.get()
    );
    updateStabilityIndicator(
      makeIsotopesModel.particleAtom.protonCountProperty.get(),
      makeIsotopesModel.particleAtom.neutronCountProperty.get()
    );
  }
}

isotopesAndAtomicMass.register( 'InteractiveIsotopeNode', InteractiveIsotopeNode );
export default InteractiveIsotopeNode;