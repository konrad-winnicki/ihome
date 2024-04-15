import inquirer from "inquirer";

const passwordQuestions = [
  {
    type: "password",
    name: "PASSWORD",
    mask: "*",
    message: "Enter password:",
  },
  {
    type: "password",
    name: "repeatedPassword",
    mask: "*",
    message: "Repeat password:",
    validate: (input: string, answers: { [key: string]: string }) => {
      if (input === answers.PASSWORD) {
        return true;
      }
      return "Passwords do not match. Please try again.";
    },
  },
];

const portQuestion = [
  {
    type: "input",
    name: "PORT",
    message: "Press enter or indicate port on which server will run:",
    default: "4000",
    validate: (input: string) => {
      const regExp = /^\d{3,4}$/;
      if (!input) {
        return true;
      }
      if (input.match(regExp)) {
        return true;
      }
      return "Port must contain 3 or 4 digits. Please try again.";
    },
  },
];

const persistenciaQuestions = [
  {
    type: "list",
    name: "PERSISTENCIA",
    message: "Choose place of data persistencia:",
    choices: ["FILE", "DATABASE"],
  },
  {
    type: "input",
    name: "DATABASE_URL",
    message: "Enter url to Mongo Atlas:",
    when: (answers: { [key: string]: string }) =>
      answers.PERSISTENCIA === "DATABASE",
  },
];

const serverTypeQuestions = [
  {
    type: "list",
    name: "SERVER_TYPE",
    message: "Choose place of data persistencia:",
    choices: ["http", "https"],
  },
];

const questions = [
  ...serverTypeQuestions,
  ...portQuestion,
  ...persistenciaQuestions,
  ...passwordQuestions,
];

const changeProperties = [
  {
    type: "confirm",
    name: "PROPERTY_CHANGE_CONFIRMATION",
    message:
      "Property file is valid. Do you want to change all existing properties:",
  },
];

export async function changeExistingProperties(): Promise<{
  [key: string]: string;
}> {
  return inquirer
    .prompt(changeProperties)
    .then((answers) => {
      return answers;
    })
    .catch((error) => {
      if (error.isTtyError) {
        console.log(error);
        return Promise.reject();
      } else {
        console.log(error);
        return Promise.reject();
      }
    });
}

export async function collectUserData(): Promise<{ [key: string]: string }> {
  return inquirer
    .prompt(questions)
    .then((answers) => {
      return answers;
    })
    .catch((error) => {
      if (error.isTtyError) {
        console.log(error);
        return Promise.reject();
      } else {
        console.log(error);
        return Promise.reject();
      }
    });
}
