export default function promisify(fn: Function) {
    return (...args: any[]) => {
        const last = args[args.length - 1]

        if (typeof last === "function") {
            return fn.apply(null, args)
        }

        return new Promise((resolve, reject) => {
            const callback = (err: any, ret: any) => {
                if (err) {
                    return reject(err)
                }

                resolve(ret)
            }

            fn.apply(null, [...args, callback])
        })
    }
}