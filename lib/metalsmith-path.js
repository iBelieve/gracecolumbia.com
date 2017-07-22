const path = require('path');

module.exports = plugin;

function plugin(options) {
	options = options || {};
	options = {
		property		: "path",
		baseDirectory	: options.baseDirectory || "",
		directoryIndex	: options.directoryIndex || false
	}

	return function(files, metalsmith, done) {
		setImmediate(done);

		// Loop through each file
		Object.keys(files).forEach(function(file) {

			// Only process HTML files
			if (!isHTML(file)) {
				return;
			}

			let url = file;

			if (options.directoryIndex) {
				if (path.basename(url) == options.directoryIndex) {
					url = path.dirname(url);
				}
			}

      if (url === '.') {
        url = '';
      }

			if (options.baseDirectory) {
				url = options.baseDirectory + url;
			}

      if (!url.endsWith('/')) {
        url += '/';
      }

			// add to path data for use in links in templates
			files[file][options.property] = url;
		});
	};
}

// Check if filename is HTML
function isHTML(file) {
	return path.extname(file) == ".html";
}
