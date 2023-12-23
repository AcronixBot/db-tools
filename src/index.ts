declare global {
    namespace NodeJS {
        interface ProcessEnv {
            MONGO_TOKEN: string
        }
    }
}

export { };