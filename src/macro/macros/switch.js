/***********************************************************************************************************************

	macro/macros/switch.js

	Copyright © 2013–2024 Thomas Michael Edwards <thomasmedwards@gmail.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

***********************************************************************************************************************/
/* global Config, Macro, Scripting, Wikifier, getErrorMessage */

/*
	<<switch>>, <<case>>, & <<default>>
*/
Macro.add('switch', {
	skipArgs : ['switch'],
	tags     : ['case', 'default'],

	handler() {
		if (this.args.full.length === 0) {
			return this.error('no expression specified');
		}

		const len = this.payload.length;

		// if (len === 1 || !this.payload.some(p => p.name === 'case')) {
		if (len === 1) {
			return this.error('no cases specified');
		}

		let i;

		// Sanity checks.
		for (/* declared previously */ i = 1; i < len; ++i) {
			switch (this.payload[i].name) {
				case 'default': {
					if (this.payload[i].args.length > 0) {
						return this.error(`<<default>> does not accept values, invalid: ${this.payload[i].args.raw}`);
					}

					if (i + 1 !== len) {
						return this.error('<<default>> must be the final case');
					}

					break;
				}

				default: {
					if (this.payload[i].args.length === 0) {
						return this.error(`no value(s) specified for <<${this.payload[i].name}>> (#${i})`);
					}

					break;
				}
			}
		}

		let result;

		try {
			result = Scripting.evalJavaScript(this.args.full);
		}
		catch (ex) {
			return this.error(`bad evaluation: ${getErrorMessage(ex)}`);
		}

		// Evaluate the clauses.
		for (/* declared previously */ i = 1; i < len; ++i) {
			// Case test(s).
			if (this.payload[i].name === 'default' || this.payload[i].args.some(val => val === result)) {
				new Wikifier(this.output, this.payload[i].contents);
				break;
			}
		}
	}
});
