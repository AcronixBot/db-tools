import prompts, { PromptObject, PromptType, Answers } from 'prompts'

type Prompt<T, TT extends PromptType> = PromptObject<TT> & {
    resultObjectKey: T,
    validateForFail?: (para: Answers<TT>) => boolean
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
            try {
                const result = await prompts(element);
                const validationResult = element.validateForFail === undefined ? true : element.validateForFail(result);
                if (validationResult) {
                    //@ts-expect-error
                    this.resultObject[element.resultObjectKey] = result[element.name];
                } else {
                    console.error('Validation failed for prompt:', element);
                    return; // Stop execution if validation fails
                }
            } catch (error) {
                console.error('An error occurred while handling prompt:', element);
                console.error(error);
                return; // Stop execution if an error occurs
            }
        }
        return this.resultObject;
    }
}