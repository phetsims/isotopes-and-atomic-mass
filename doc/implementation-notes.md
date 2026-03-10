# Isotopes and Atomic Mass - Implementation Notes

This simulation was ported from a Java version, not started from scratch in HTML5.

The Java version of the simulation had two "flavors" - Build an Atom and Isotopes and Atomic Mass. Build an Atom has
been split into a separate simulation, and the code that is shared between the two is in a repository called
'shred'.

There are so many size relationships in this simulation that are not to scale that it was difficult to choose a very
accurate scaling unit. One could choose something like femtometers, and then use appropriate diameter values for
neutrons and protons, but the electron diameter would need to be way off, and the overall atom diameter would be too.
Ultimately, the scale that has been chosen is roughly pixels on the default size screen. This was called "screen units"
back in the Java/Piccolo days.

There are two main ways of representing an atom in the model, one where it is represented only by a set of numbers for
each type of constituent particle, and one that contains and manages references to constituent particles. The former is
called "NumberAtom" and the latter is "ParticleAtom". These are both pretty pervasive in the code.

There are several ways of representing atoms in the model. One is a "ParticleAtom" that contains and manages references
to constituent particles. This is used when the individual particles need to be tracked. Another is a "NumberAtom" that
is represented only by a set of Property<number> instances for each type of constituent particle. The third is an
immutable set of immutable numbers that define the atom configuration, called "AtomConfig". All three are pretty
pervasive in the code.

Both NumberAtom and ParticleAtom end up having a number of derived properties that are important to know, such as
charge, atomic number, and atomic mass. The types themselves generally track this information and make it available in
the form of DerivedProperty instances. AtomConfig has getters for these properties.

The "Mixtures" screen needed to have a movable version of the isotopes, and initially this used NumberAtom to define the
atom configuration. However, this turned out to lead to excessive memory use after the PhET-iO features were added, so
the code was revamped to use AtomConfig.

The type used for movable atoms in the "Mixtures" screen is called "PositionableAtom". It contains an AtomConfig, and
also has Properties for position and animation.

Four colors have been used to distinguish between different isotopes of an element, and these colors are assigned to
particles and buckets based on the number of neutrons in the atom. The colors are assigned in a repeating pattern, so
that for example the first isotope of an element is assigned the first color, the second isotope is assigned the second
color, and so on. This means that the same color may be used for different isotopes of different elements, but it is a
simple way to visually distinguish between isotopes of the same element.

The number of positionable atoms of various isotopes in the test chamber determines the percent composition and average
atomic mass for that element.