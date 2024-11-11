/**
 * config:
 * 
 * # debug,info,warn,error
 * logLevel = debug
 * logName = app
 * logDir = ./logs
 * logConsole = true
 * logMaxSize = 128m
 * logMaxFiles = 7d
 *
 * dependencies:
 * "winston": "^3.13.0",
 * "winston-daily-rotate-file": "^5.0.0",
 * "winston-error-format": "^3.0.1"
 *
 */

const winston = require('winston');
const path = require('path');
require('winston-daily-rotate-file');

require('dotenv').config()

let logLevel = process.env.logLevel
let logName = process.env.logName
let logDir = process.env.logDir
let consolePrint = true
let maxSize = process.env.logMaxSize
let maxFiles = process.env.logMaxFiles

if (logLevel == undefined) logLevel = 'debug'
if (logName == undefined) logName = 'app'
if (logDir == undefined) logDir = './logs'
if (maxSize == undefined) maxSize = '128m'
if (maxFiles == undefined) maxFiles = '7d' 
if (process.env.logConsole == 'false') consolePrint = false

const printFormat = winston.format.printf((info) => { 
  let level = info.level
  if (info.stack != undefined) {
    let i = info.stack.lastIndexOf('app.js')
    let j = info.stack.length
    if (i >= 0) {
      j = info.stack.indexOf('at', i)
    }
    let stack = info.stack.substr(0, j).trimEnd()
    return `${info.timestamp} ${level.toUpperCase()} ${info.message} - ${stack}`;
  }
  return `${info.timestamp} ${level.toUpperCase()} ${info.message}`;
})

const transportTrace = new winston.transports.DailyRotateFile({ 
    level: logLevel,
    filename: `${logName}_%DATE%.log`,
    dirname: logDir,
    datePattern: 'YYYY_MM_DD',
    maxSize: maxSize,
    maxFiles: maxFiles, 
})

const transportError = new winston.transports.DailyRotateFile({ 
    level: 'error',
    dirname: logDir,
    filename: `${logName}_error_%DATE%.log`,
    datePattern: 'YYYY_MM_DD',
    maxSize: maxSize,
    maxFiles: maxFiles, 
})
  
const log = winston.createLogger({
    level: logLevel,
    format: winston.format.combine(
        winston.format.errors({stack: true}),
        winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss.SSSZZ'}),  // local timezone
        // winston.format.timestamp(),     // UTC0
        winston.format.splat(),
        printFormat,
    ),
    transports: [ transportTrace, transportError,],
})

if (consolePrint) {
    log.add(new winston.transports.Console())
}

module.exports = log
