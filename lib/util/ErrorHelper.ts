interface DbHelperErrorConstructor {
    new(msg: string, ...args: any[]): Error;
    stackTraceLimit: number;
    captureStackTrace: (targetObject: object, constructorOpt?: Function) => void;
}

function makeDbHelperError(Base: new (...args: any[]) => Error): DbHelperErrorConstructor {
    class DbHelperError extends Base {
        constructor(msg: string, ...args: any[]) {
            super(msg, args);
            this.message = msg;
            if (Error.captureStackTrace) {
                Error.captureStackTrace(this, DbHelperError);
            }
        }

        // Adding the missing properties to satisfy the type
        static stackTraceLimit: number;
        static captureStackTrace: (targetObject: object, constructorOpt?: Function) => void;

        get name(): string {
            return `${super.name} [${this.message}]`;
        }
    }

    // Assigning static properties to satisfy the type
    DbHelperError.stackTraceLimit = Error.stackTraceLimit;
    DbHelperError.captureStackTrace = Error.captureStackTrace;

    return DbHelperError as DbHelperErrorConstructor;
}


export const DbHelperError = makeDbHelperError(Error);
export const DbHelperTypeError = makeDbHelperError(TypeError);
export const DbHelperRangeError = makeDbHelperError(RangeError);


