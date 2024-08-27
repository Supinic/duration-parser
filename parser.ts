import { units } from "./units.json";

const durationRegex = /(-?\d*\.?\d+(?:e[-+]?\d+)?)\s*([a-zμ]*)/ig;

declare type UnitDefinition = typeof units[number];
declare type Options = {
	target?: UnitDefinition["name"],
	ignoreError?: boolean;
	returnData?: boolean;
};
declare type Range = {
	string: string;
	time: number;
	start: number;
	end: number;
};
declare type Time = number;
declare type Result = {
	time: Time;
	ranges: Range[];
};

declare interface CommonOptions {
	target?: UnitDefinition["name"];
	returnData?: boolean;
	ignoreError?: boolean;
}
declare interface ResultOptions extends CommonOptions {
	returnData: true;
}
declare interface TimeOptions extends CommonOptions {
	returnData?: false | undefined;
}

const findUnit = (unit: UnitDefinition["name"]) => units.find(i => i.name === unit.toLowerCase() || i.aliases.some(j => j === unit));

/**
 * Parses strings containing time units into a time number.
 * @param input Input string to parse time duration from.
 * @param [options]
 * @param [options.target] Explicit target time unit - if not provided, milliseconds `"ms"` is used.
 * Full list of supported units can be found in `units.json`.
 * @param [options.returnData] If true, return value type is altered from `number` to `DurationParserModuleResult`.
 * @param [options.ignoreError] If true, method will return `undefined` instead of throwing on unit parse failure (see below).
 */
function parse (input: string, options?: TimeOptions): Time;
function parse (input: string, options: ResultOptions): Result;
function parse (input: string, options: Options = {}): Time | Result {
	const {
		target = "ms",
		ignoreError = true,
		returnData = false
	} = options;

	const targetUnit = findUnit(target);
	if (!targetUnit) {
		throw new Error("Unrecognized target time unit: " + target);
	}

	const cleanInput = input.replace(/(\d),(\d)/g, "$1.$2");
	const ranges: Range[] = [];
	let time = 0;

	for (const stuff of cleanInput.matchAll(durationRegex)) {
		const [total, amount, unit] = stuff;
		const { index } = stuff;

		const foundUnit = findUnit(unit);
		if (!foundUnit) {
			if (ignoreError) {
				continue;
			}
			else {
				throw new Error("Unrecognized input time unit: " + unit);
			}
		}

		const deltaTime = Number(amount) * foundUnit.value * (1 / targetUnit.value);
		ranges.push({
			string: total,
			time: deltaTime,
			start: index,
			end: index + total.length
		});

		time += deltaTime;
	}

	return (returnData)
		? { time, ranges }
		: time;
}

export = parse;
