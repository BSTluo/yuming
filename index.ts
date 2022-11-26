import { App } from "@yakumoran/core";
import * as fs from 'fs'
import word from './function/word'

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'))
const app = new App(config)

app.loadPlugin('word', word)
