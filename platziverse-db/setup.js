'use strict'

const db = require('./')
const debug = require('debug')('platziverse:db:setup')
const inquirer = require('inquirer')
const chalk = require('chalk')

async function setup () {
  if (process.argv[2] !== '-y') {
    const prompt = inquirer.createPromptModule()

    const answer = await prompt([
      {
        type: 'confirm',
        name: 'setup',
        message: 'This will destroy your database, are you sure?'
      }
    ])

    if (!answer.setup) {
      return console.log('Nothing happened :)')
    }
  }

  const config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASS || 'root',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: s => debug(s),
    setup: true
  }

  await db(config).catch(err => {
    console.error(`${chalk.red('[Fatal error]')} ${err.message}`)
    console.error(err.stack)
    process.exit(1)
  })

  console.log('Success Setup!')

  process.exit(0)
}

setup()
