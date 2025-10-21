// Type definitions for the Code Runner MVP

export enum RunnerMessageType {
  CODE = "code",
  INPUT = "input",
  STDOUT = "stdout",
  STDERR = "stderr",
  COMPILE_ERR = "compile_err",
  EXIT = "exit",
  ECHO = "echo",
}

export enum Language {
  PYTHON = "Python",
  JAVA = "Java",
  CPP = "C++",
  JAVASCRIPT = "JavaScript",
}

export interface RunnerMessage {
  type: RunnerMessageType;
  language?: Language;
  source?: string;
  data?: string;
  stderr?: string;
  return_code?: number;
}

export interface Config {
  RUNNER_BASE_URL: string;
  CONNECTION_TIME_LIMIT: number;
  MAX_OUTPUT_LENGTH: number;
}

export interface Template {
  language: Language;
  code: string;
}

export const config: Config = {
  RUNNER_BASE_URL: "ws://localhost:8080",
  CONNECTION_TIME_LIMIT: 180,
  MAX_OUTPUT_LENGTH: 100000,
};

export const defaultTemplates: Record<Language, string> = {
  [Language.PYTHON]: `# Python code
print("Hello, World!")

# Your code here
`,
  [Language.JAVA]: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");

        // Your code here
    }
}`,
  [Language.CPP]: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;

    // Your code here

    return 0;
}`,
  [Language.JAVASCRIPT]: `// JavaScript code
console.log("Hello, World!");

// Your code here
`,
};

// Utility functions
export function createRunnerMessage(
  type: RunnerMessageType,
  data: Partial<RunnerMessage> = {}
): RunnerMessage {
  return {
    type,
    ...data,
  };
}

export function createCompileMessage(
  source: string,
  language: Language
): RunnerMessage {
  return createRunnerMessage(RunnerMessageType.CODE, {
    language,
    source,
  });
}

export function createInputMessage(data: string): RunnerMessage {
  return createRunnerMessage(RunnerMessageType.INPUT, { data });
}

export function createExitMessage(): RunnerMessage {
  return createRunnerMessage(RunnerMessageType.EXIT);
}
