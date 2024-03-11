import prompts, { PromptObject, PromptType, Answers } from 'prompts'

type Prompt<T, TT extends PromptType> = PromptObject<TT> & {
    resultObjectKey: T,
    validate: (para: Answers<TT>) => boolean
}

export default class PromptManager<T> {

    private prompts: Prompt<keyof T, PromptType>[] = [];
    private resultObject: T;

    public addPrompt<TT extends PromptType>(prompt: Prompt<keyof T, TT>): this {
        this.prompts.push(prompt);
        return this;
    }

    /**
     * run
     */
    public async run() {
        for (let index = 0; index < this.prompts.length; index++) {
            const element = this.prompts[index];
            Promise
                .allSettled([prompts(element)])
                .then(results => {
                    const allFullfilled = results.every(r => r.status === 'fulfilled');
                    if (!allFullfilled) {
                        return console.error('Some collections were not handled successfully.');
                    }

                    //@ts-expect-error
                    const promptResult = results[0].value;
                    const validationResult = element.validate(promptResult);
                    if (validationResult) {
                        this.resultObject[element.resultObjectKey] = promptResult[element.name]
                    }
                })
        }
    }
}