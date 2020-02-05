const durationRegex = /(-?\d*\.?\d+(?:e[-+]?\d+)?)\s*([a-zμ]*)/ig;
const unitsDefinition = require(__dirname + "/units.json");
const findUnit = (unit) => unitsDefinition.find(i => i.name === unit.toLowerCase() || i.aliases.some(j => j === unit));

/**
 * @typedef {string} TimeUnit
 */

/**
 * Parses strings containing time units into a time number.
 * @param string
 * @param {TimeUnit} target = "ms"
 * @param {boolean} ignoreError = true
 * @returns {number}
 */
module.exports = function parse (string, target = "ms", ignoreError = true) {
	const targetUnit = findUnit(target);
	if (!targetUnit) {
		throw new Error("Unrecognized target time unit: " + target);
	}

	let time = 0;
	string.replace(/(\d),(\d)/g, "$1$2").replace(durationRegex, (total, amount, unit) => {
		let foundUnit = findUnit(unit);
		if (!foundUnit) {
			if (!unit) {
				foundUnit = findUnit("second");
			}
			else {
				if (ignoreError) {
					return;
				}
				else {
					throw new Error("Unrecognized input time unit: " + unit);
				}
			}
		}

		time += parseFloat(amount) * foundUnit.value;
	});

	return time * (1 / targetUnit.value);
};