/***********************************************************************************************************************

	config.js

	Copyright © 2013–2024 Thomas Michael Edwards <thomasmedwards@gmail.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

***********************************************************************************************************************/
/* global Save, State, Story, getTypeOf */

var Config = (() => { // eslint-disable-line no-unused-vars, no-var
	// General settings.
	let _addVisitedLinkClass     = false;
	let _cleanupWikifierOutput   = false;
	let _debug                   = false;
	let _enableOptionalDebugging = false;
	let _loadDelay               = 0;

	// State history settings.
	let _historyControls  = true;
	let _historyMaxStates = 40;

	// Macros settings.
	let _macrosMaxLoopIterations   = 1000;
	let _macrosTypeSkipKey         = '\x20'; // Space
	let _macrosTypeVisitedPassages = true;

	// Navigation settings.
	let _navigationDisallow;
	let _navigationOverride;

	// Passages settings.
	let _passagesDisplayTitles = false;
	let _passagesNobr          = false;
	let _passagesStart; // Set by `Story.init()`
	let _passagesOnProcess;
	let _passagesTransitionOut;

	// Saves settings.
	let _savesDescriptions;
	let _savesId; // NOTE: Initially set by `Story.init()`.
	let _savesIsAllowed;
	let _savesMaxAuto      = 0;
	let _savesMaxSlot      = 8;
	let _savesMetadata;
	let _savesVersion;

	// UI settings.
	let _uiStowBarInitially    = 800;
	let _uiUpdateStoryElements = true;


	/*******************************************************************************
		Object Exports.
	*******************************************************************************/

	return Object.freeze({
		/*
			General settings.
		*/
		get addVisitedLinkClass() { return _addVisitedLinkClass; },
		set addVisitedLinkClass(value) { _addVisitedLinkClass = Boolean(value); },

		get cleanupWikifierOutput() { return _cleanupWikifierOutput; },
		set cleanupWikifierOutput(value) { _cleanupWikifierOutput = Boolean(value); },

		get debug() { return _debug; },
		set debug(value) { _debug = Boolean(value); },

		get enableOptionalDebugging() { return _enableOptionalDebugging; },
		set enableOptionalDebugging(value) { _enableOptionalDebugging = Boolean(value); },

		get loadDelay() { return _loadDelay; },
		set loadDelay(value) {
			if (!Number.isSafeInteger(value) || value < 0) {
				throw new RangeError('Config.loadDelay must be a non-negative integer');
			}

			_loadDelay = value;
		},


		/*
			State history settings.
		*/
		history : Object.freeze({
			// TODO: (v3) This should be under UI settings → `Config.ui.historyControls`.
			get controls() { return _historyControls; },
			set controls(value) {
				const controls = Boolean(value);

				if (_historyMaxStates === 1 && controls) {
					throw new Error('Config.history.controls must be false when Config.history.maxStates is 1');
				}

				_historyControls = controls;
			},

			get maxStates() { return _historyMaxStates; },
			set maxStates(value) {
				if (!Number.isSafeInteger(value) || value < 1) {
					throw new RangeError('Config.history.maxStates must be a positive integer');
				}

				_historyMaxStates = value;

				// Force `Config.history.controls` to `false`, when limited to `1` moment.
				if (_historyControls && value === 1) {
					_historyControls = false;
				}
			}
		}),

		/*
			Macros settings.
		*/
		macros : Object.freeze({
			get maxLoopIterations() { return _macrosMaxLoopIterations; },
			set maxLoopIterations(value) {
				if (!Number.isSafeInteger(value) || value < 1) {
					throw new RangeError('Config.macros.maxLoopIterations must be a positive integer');
				}

				_macrosMaxLoopIterations = value;
			},

			get typeSkipKey() { return _macrosTypeSkipKey; },
			set typeSkipKey(value) { _macrosTypeSkipKey = String(value); },

			get typeVisitedPassages() { return _macrosTypeVisitedPassages; },
			set typeVisitedPassages(value) { _macrosTypeVisitedPassages = Boolean(value); },

		}),

		/*
			Navigation settings.
		*/
		navigation : Object.freeze({
			get override() { return _navigationOverride; },
			set override(value) {
				if (!(value == null || value instanceof Function)) { // lazy equality for null
					throw new TypeError(`Config.navigation.override must be a function or null/undefined (received: ${getTypeOf(value)})`);
				}

				_navigationOverride = value;
			},
			get disallow() { return _navigationDisallow; },
			set disallow(value) {
				if (!(value == null || value instanceof Function)) { // lazy equality for null
					throw new TypeError(`Config.navigation.disallow must be a function or null/undefined (received: ${getTypeOf(value)})`);
				}
				_navigationDisallow = value;
			}


		}),

		/*
			Passages settings.
		*/
		passages : Object.freeze({
			// TODO: (v3) This should be under Navigation settings → `Config.navigation.updateTitle`.
			get displayTitles() { return _passagesDisplayTitles; },
			set displayTitles(value) { _passagesDisplayTitles = Boolean(value); },

			get nobr() { return _passagesNobr; },
			set nobr(value) { _passagesNobr = Boolean(value); },

			get onProcess() { return _passagesOnProcess; },
			set onProcess(value) {
				if (value != null) { // lazy equality for null
					const valueType = getTypeOf(value);

					if (valueType !== 'function') {
						throw new TypeError(`Config.passages.onProcess must be a function or null/undefined (received: ${valueType})`);
					}
				}

				_passagesOnProcess = value;
			},

			// TODO: (v3) This should be under Navigation settings → `Config.navigation.(start|startingPassage)`.
			get start() { return _passagesStart; },
			set start(value) {
				if (value != null) { // lazy equality for null
					const valueType = getTypeOf(value);

					if (valueType !== 'string') {
						throw new TypeError(`Config.passages.start must be a string or null/undefined (received: ${valueType})`);
					}
				}

				_passagesStart = value;
			},

			// TODO: (v3) This should be under Navigation settings → `Config.navigation.transitionOut`.
			get transitionOut() { return _passagesTransitionOut; },
			set transitionOut(value) {
				if (value != null) { // lazy equality for null
					const valueType = getTypeOf(value);

					if (
						valueType !== 'string'
						&& (valueType !== 'number' || !Number.isSafeInteger(value) || value < 0)
					) {
						throw new TypeError(`Config.passages.transitionOut must be a string, non-negative integer, or null/undefined (received: ${valueType})`);
					}
				}

				_passagesTransitionOut = value;
			},

		}),

		/*
			Saves settings.
		*/
		saves : Object.freeze({
			get descriptions() { return _savesDescriptions; },
			set descriptions(value) {
				if (!(value == null || value instanceof Function)) { // lazy equality for null
					throw new TypeError(`Config.saves.descriptions must be a function or null/undefined (received: ${getTypeOf(value)})`);
				}

				_savesDescriptions = value;
			},

			get id() { return _savesId; },
			set id(value) {
				if (typeof value !== 'string' || value === '') {
					throw new TypeError(`Config.saves.id must be a non-empty string (received: ${getTypeOf(value)})`);
				}

				_savesId = value;
			},

			get isAllowed() { return _savesIsAllowed; },
			set isAllowed(value) {
				if (!(value == null || value instanceof Function)) { // lazy equality for null
					throw new TypeError(`Config.saves.isAllowed must be a function or null/undefined (received: ${getTypeOf(value)})`);
				}

				_savesIsAllowed = value;
			},

			get maxAutoSaves() { return _savesMaxAuto; },
			set maxAutoSaves(value) {
				if (!Number.isInteger(value)) {
					throw new TypeError('Config.saves.maxAutoSaves must be an integer');
				}
				else if (value < 0 || value > Save.MAX_INDEX + 1) {
					throw new RangeError(`Config.saves.maxAutoSaves out of bounds (range: 0–${Save.MAX_INDEX + 1}; received: ${value})`);
				}

				_savesMaxAuto = value;
			},

			get maxSlotSaves() { return _savesMaxSlot; },
			set maxSlotSaves(value) {
				if (!Number.isInteger(value)) {
					throw new TypeError('Config.saves.maxSlotSaves must be an integer');
				}
				else if (value < 0 || value > Save.MAX_INDEX + 1) {
					throw new RangeError(`Config.saves.maxSlotSaves out of bounds (range: 0–${Save.MAX_INDEX + 1}; received: ${value})`);
				}

				_savesMaxSlot = value;
			},

			get metadata() { return _savesMetadata; },
			set metadata(value) {
				if (!(value == null || value instanceof Function)) { // lazy equality for null
					throw new TypeError(`Config.saves.metadata must be a function or null/undefined (received: ${getTypeOf(value)})`);
				}

				_savesMetadata = value;
			},

			get version() { return _savesVersion; },
			set version(value) { _savesVersion = value; },

		}),

		/*
			UI settings.
		*/
		ui : Object.freeze({
			get stowBarInitially() { return _uiStowBarInitially; },
			set stowBarInitially(value) {
				const valueType = getTypeOf(value);

				if (
					valueType !== 'boolean'
					&& (valueType !== 'number' || !Number.isSafeInteger(value) || value < 0)
				) {
					throw new TypeError(`Config.ui.stowBarInitially must be a boolean or non-negative integer (received: ${valueType})`);
				}

				_uiStowBarInitially = value;
			},

			get updateStoryElements() { return _uiUpdateStoryElements; },
			set updateStoryElements(value) { _uiUpdateStoryElements = Boolean(value); }
		})
	});
})();
