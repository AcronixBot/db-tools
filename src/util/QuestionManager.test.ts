import QuestionManager from './QuestionManager';

interface TestResultObject {
    test: boolean,
    anotherTest: string
}

const questionManager = new QuestionManager<TestResultObject>()
    .addPrompt({
        name: 'text',
        type: 'text',
        message: 'Das ist eine Test Message',
        resultObjectKey: 'anotherTest',
        validate: (para: any) => {
            return typeof para === 'string';
        }
    })
    .addPrompt({
        name: 'confirm',
        type: 'confirm',
        message: 'Das ist ein Test Confirm',
        resultObjectKey: 'test',
        validate: (para: any) => {
            return typeof para === 'boolean';
        }
    });

const result = questionManager.run();
console.log(Promise.allSettled([result]).then((d) => console.log(d[0])))