const durationRegex = /(-?\d*\.?\d+(?:e[-+]?\d+)?)\s*([a-zμ]*)/ig;
const unitsDefinition = require(__dirname + "/units.json");
const findUnit = (unit) => unitsDefinition.find(i => i.name === unit.toLowerCase() || i.aliases.some(j => j === unit));

/**
 * Parses strings containing time units into a time number.
 * @param string
 * @param {string} string = "ms"
 * @param {object} options = true
 * @returns {number}
 */
module.exports = function parse (string, options = {}) {
	options.target = options.target || "ms";
	options.ignoreError = (typeof options.ignoreError === "boolean") ? options.ignoreError : true;

	const targetUnit = findUnit(options.target);
	if (!targetUnit) {
		throw new Error("Unrecognized target time unit: " + options.target);
	}

	const ranges = [];
	let time = 0;
	string.replace(/(\d),(\d)/g, "$1.$2").replace(durationRegex, (total, amount, unit, index) => {
		let foundUnit = findUnit(unit);
		if (!foundUnit) {
			if (!targetUnit) {
				foundUnit = findUnit("second");
			}
			else {
				if (options.ignoreError) {
					return;
				}
				else {
					throw new Error("Unrecognized input time unit: " + unit);
				}
			}
		}

		const deltaTime = parseFloat(amount) * foundUnit.value * (1 / targetUnit.value);

		ranges.push({
			string: total,
			time: deltaTime,
			start: index,
			end: index + total.length
		});

		time += deltaTime;
	});

	return (options.returnData)
		? { time, ranges }
		: time;
};