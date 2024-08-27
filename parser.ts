import { units } from "./units.json";

const durationRegex = /(-?\d*\.?\d+(?:e[-+]?\d+)?)\s*([a-zμ]*)/ig;

/** @type {DurationParserModuleTimeUnit[]} */
const unitsDefinition = require(__dirname + "/units.json");

/**
 * @param {string} unit
 * @returns {DurationParserModuleTimeUnit}
 */
const findUnit = (unit) => unitsDefinition.find(i => i.name === unit.toLowerCase() || i.aliases.some(j => j === unit));

/**
 * @alias DurationParserModuleFunction
 * Parses strings containing time units into a time number.
 * @param {string} input Input string to parse time duration from.
 * @param {Object} [options]
 * @param {string} [options.target] Explicit target time unit - if not provided, milliseconds `"ms"` is used.
 * Full list of supported units can be found in `units.json`.
 * @param {boolean} [options.returnData] If true, return value type is altered from `number` to `DurationParserModuleResult`.
 * @param {boolean} [options.ignoreError] If true, method will return `undefined` instead of throwing on unit parse failure (see below).
 * @returns {number|DurationParserModuleResult}
 * @throws {TypeError} If the provided input is not a string.
 * @throws {Error} If an invalid unit is provided as `options.target`.
 * @throws {Error} If no time unit is found next to a stray number in the input string.
 */
module.exports = function parse (input, options = {}) {
	if (typeof input !== "string") {
		throw new TypeError("Argument input must be a string");
	}

	options.target = options.target || "ms";
	options.ignoreError = (typeof options.ignoreError === "boolean") ? options.ignoreError : true;

	const targetUnit = findUnit(options.target);
	if (!targetUnit) {
		throw new Error("Unrecognized target time unit: " + options.target);
	}

	const ranges = [];
	let time = 0;
	input.replace(/(\d),(\d)/g, "$1.$2").replace(durationRegex, (total, amount, unit, index) => {
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

/**
 * @typedef {Object} DurationParserModuleRange
 * @property {string} total Full string match of the time unit block.
 * @property {number} time Parsed value of the block, expressed in the provided time unit.
 * @property {number} start Start index of the time block in the original string.
 * @property {number} end End index
 */

/**
 * @typedef {Object} DurationParserModuleResult
 * @property {number} time Total sum of all block's parsed times.
 * @property {DurationParserModuleRange[]} ranges List of parsed time unit block ranges.
 */

/**
 * @typedef {Object} DurationParserModuleTimeUnit
 * @property {string} name Main name of the time unit.
 * @property {string[]} aliases All valid list of unit's aliases, including singular and plural - case sensitive. (!)
 * @property {number} value Value of time unit in seconds.
 */
