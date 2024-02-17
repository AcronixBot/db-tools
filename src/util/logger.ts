import picocolors from 'picocolors';

export function green(input: string | number) {
    return picocolors.green(`[SUCCESS] :: ` + input)
}

export function yellow(input: string | number) {
    return picocolors.yellow(`[WARN] :: ` + input)
}

export function blue(input: string | number) {
    return picocolors.blue(`[INFO] :: ` + input)
}

export function red(input: string | number) {
    return picocolors.red(`[ERROR] :: ` + input)
}