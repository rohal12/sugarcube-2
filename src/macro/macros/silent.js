/***********************************************************************************************************************

	macro/macros/silent.js

	Copyright © 2013–2024 Thomas Michael Edwards <thomasmedwards@gmail.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

***********************************************************************************************************************/
/* global  Macro, Wikifier */

/*
	<<silent>>
*/
Macro.add('silent', {
	skipArgs : true,
	tags     : null,

	handler() {
		const frag = document.createDocumentFragment();
		new Wikifier(frag, this.payload[0].contents.trim());
		// Discard the output, unless there were errors.
		const errList = Array.from(frag.querySelectorAll('.error')).map(errEl => errEl.textContent);

		if (errList.length > 0) {
			return this.error(`error${errList.length === 1 ? '' : 's'} within contents (${errList.join('; ')})`);
		}
	}
});
