// Copyright 2026, University of Colorado Boulder
// AUTOMATICALLY GENERATED – DO NOT EDIT.
// Generated from isotopes-and-atomic-mass-strings_en.yaml

/* eslint-disable */
/* @formatter:off */

import FluentLibrary from '../../chipper/js/browser-and-node/FluentLibrary.js';
import FluentContainer from '../../chipper/js/browser/FluentContainer.js';
import isotopesAndAtomicMass from './isotopesAndAtomicMass.js';
import IsotopesAndAtomicMassStrings from './IsotopesAndAtomicMassStrings.js';

// This map is used to create the fluent file and link to all StringProperties.
// Accessing StringProperties is also critical for including them in the built sim.
// However, if strings are unused in Fluent system too, they will be fully excluded from
// the build. So we need to only add actually used strings.
const fluentKeyToStringPropertyMap = new Map();

const addToMapIfDefined = ( key: string, path: string ) => {
  const sp = _.get( IsotopesAndAtomicMassStrings, path );
  if ( sp ) {
    fluentKeyToStringPropertyMap.set( key, sp );
  }
};

addToMapIfDefined( 'isotopes_and_atomic_mass_title', 'isotopes-and-atomic-mass.titleStringProperty' );
addToMapIfDefined( 'isotopes', 'isotopesStringProperty' );
addToMapIfDefined( 'mixtures', 'mixturesStringProperty' );
addToMapIfDefined( 'neutrons', 'neutronsStringProperty' );
addToMapIfDefined( 'massNumber', 'massNumberStringProperty' );
addToMapIfDefined( 'atomicMass', 'atomicMassStringProperty' );
addToMapIfDefined( 'symbol', 'symbolStringProperty' );
addToMapIfDefined( 'abundanceInNature', 'abundanceInNatureStringProperty' );
addToMapIfDefined( 'myIsotope', 'myIsotopeStringProperty' );
addToMapIfDefined( 'thisIsotope', 'thisIsotopeStringProperty' );
addToMapIfDefined( 'amu', 'amuStringProperty' );
addToMapIfDefined( 'myMix', 'myMixStringProperty' );
addToMapIfDefined( 'naturesMix', 'naturesMixStringProperty' );
addToMapIfDefined( 'isotopeMixture', 'isotopeMixtureStringProperty' );
addToMapIfDefined( 'percentComposition', 'percentCompositionStringProperty' );
addToMapIfDefined( 'averageAtomicMass', 'averageAtomicMassStringProperty' );
addToMapIfDefined( 'trace', 'traceStringProperty' );

// A function that creates contents for a new Fluent file, which will be needed if any string changes.
const createFluentFile = (): string => {
  let ftl = '';
  for (const [key, stringProperty] of fluentKeyToStringPropertyMap.entries()) {
    ftl += `${key} = ${FluentLibrary.formatMultilineForFtl( stringProperty.value )}\n`;
  }
  return ftl;
};

const fluentSupport = new FluentContainer( createFluentFile, Array.from(fluentKeyToStringPropertyMap.values()) );

const IsotopesAndAtomicMassFluent = {
  "isotopes-and-atomic-mass": {
    titleStringProperty: _.get( IsotopesAndAtomicMassStrings, 'isotopes-and-atomic-mass.titleStringProperty' )
  },
  isotopesStringProperty: _.get( IsotopesAndAtomicMassStrings, 'isotopesStringProperty' ),
  mixturesStringProperty: _.get( IsotopesAndAtomicMassStrings, 'mixturesStringProperty' ),
  neutronsStringProperty: _.get( IsotopesAndAtomicMassStrings, 'neutronsStringProperty' ),
  massNumberStringProperty: _.get( IsotopesAndAtomicMassStrings, 'massNumberStringProperty' ),
  atomicMassStringProperty: _.get( IsotopesAndAtomicMassStrings, 'atomicMassStringProperty' ),
  symbolStringProperty: _.get( IsotopesAndAtomicMassStrings, 'symbolStringProperty' ),
  abundanceInNatureStringProperty: _.get( IsotopesAndAtomicMassStrings, 'abundanceInNatureStringProperty' ),
  myIsotopeStringProperty: _.get( IsotopesAndAtomicMassStrings, 'myIsotopeStringProperty' ),
  thisIsotopeStringProperty: _.get( IsotopesAndAtomicMassStrings, 'thisIsotopeStringProperty' ),
  otherIsotopesPatternStringProperty: _.get( IsotopesAndAtomicMassStrings, 'otherIsotopesPatternStringProperty' ),
  amuStringProperty: _.get( IsotopesAndAtomicMassStrings, 'amuStringProperty' ),
  myMixStringProperty: _.get( IsotopesAndAtomicMassStrings, 'myMixStringProperty' ),
  naturesMixStringProperty: _.get( IsotopesAndAtomicMassStrings, 'naturesMixStringProperty' ),
  isotopeMixtureStringProperty: _.get( IsotopesAndAtomicMassStrings, 'isotopeMixtureStringProperty' ),
  percentCompositionStringProperty: _.get( IsotopesAndAtomicMassStrings, 'percentCompositionStringProperty' ),
  averageAtomicMassStringProperty: _.get( IsotopesAndAtomicMassStrings, 'averageAtomicMassStringProperty' ),
  traceStringProperty: _.get( IsotopesAndAtomicMassStrings, 'traceStringProperty' )
};

export default IsotopesAndAtomicMassFluent;

isotopesAndAtomicMass.register('IsotopesAndAtomicMassFluent', IsotopesAndAtomicMassFluent);
