const db = require('./');
const inquirer = require('inquirer');
const chalk = require('chalk');
const config = require('./config');

//Object promt request users questions
const prompt = inquirer.createPromptModule();

(async function setup(){
  if (process.argv.pop() !== ('--y' || '-y' || '--yes' || '-yes' )) {
    const answer = await prompt([
      {
        type: 'confirm',
        name: 'setup',
        message: 'This will destroy your database, are you sure?'
      }
    ]);

    if (!answer.setup) {
      return console.log(`${chalk.blue('Nothing happend :)')}`);
    }
  }
  await db(config).catch(handleFatalError)

  console.log('Success!')
  process.exit(0)
})()

function handleFatalError(err) {
  console.log(`${chalk.red('[fatal error]')} ${err.message}`);
  console.log(err.stack);
  process.exit(1);
}
