import inquirer from "inquirer";


const passwordQuestions = [{
    type: 'password',
    name: 'PASSWORD',
    mask: "*",
    message: "Enter password:",
  },{
    type: 'password',
    name: 'repeatedPassword',
    mask: "*",
    message: "Repeat password:",
    validate: (input:string, answers:{[key:string]: string}) => {
        if (input === answers.PASSWORD) {
          return true;
        }
        return 'Passwords do not match. Please try again.';
        
      },
  }]

  const portQuestion = [{
    type: 'input',
    name: 'PORT',
    message: "Indicate port on which server will run:",
    
    validate: (input:string) => {
        const regExp = /^\d{4}$/
        if (input.match(regExp)) {
          return true;
        }
        return 'Port must contain 4 digits. Please try again.';
        
      }
      
  }]


  const persistenciaQuestions = [
        
    {
      type: 'list',
      name: 'PERSISTENCIA',
      message: "Choose place of data persistencia:",
      choices: ['file', 'mongoDatabase']

    },
    {
        type: 'input',
        name: 'DATABASE_URL',
        message: 'Enter url to Mongo Atlas:',
        when: (answers: {[key:string]:string}) => answers.PERSISTENCIA === 'mongoDatabase',
      }]



const questions = [...portQuestion, ...persistenciaQuestions, ...passwordQuestions]


export async function collectUserData(): Promise<{[key:string]:string}> {
    return inquirer
      .prompt(questions)
      .then((answers) => {
          return answers
          
      })
      .catch((error) => {
        if (error.isTtyError) {
          console.log(error);
          return Promise.reject()
        } else {
          console.log(error);
          return Promise.reject()
        }
      });
  }