export declare type Time = number;
export declare type Range = {
    string: string;
    time: number;
    start: number;
    end: number;
};
export declare type Result = {
    time: Time;
    ranges: Range[];
};
export declare type Unit = {
    name: string;
    aliases: string[];
    value: number;
};

export declare interface CommonOptions {
    target?: Unit["name"];
    returnData?: boolean;
    ignoreError?: boolean;
}

declare interface ResultOptions extends CommonOptions {
    returnData: true;
}
declare interface TimeOptions extends CommonOptions {
    returnData: false | undefined;
}

export declare function parse (input: string, options: ResultOptions): Result;
export declare function parse (input: string, options: TimeOptions): Time;
export declare function parse (input: string): Time;
