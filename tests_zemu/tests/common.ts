import { IDeviceModel, DEFAULT_START_OPTIONS, isTouchDevice } from '@zondax/zemu'

import { resolve } from 'path'

export const APP_SEED = 'course grief vintage slim tell hospital car maze model style elegant kitchen state purpose matrix gas grid enable frown road goddess glove canyon key'

const APP_PATH_S = resolve('../build/nanos/bin/app.elf')
const APP_PATH_X = resolve('../build/nanox/bin/app.elf')
const APP_PATH_SP = resolve('../build/nanos2/bin/app.elf')
const APP_PATH_ST = resolve('../build/stax/bin/app.elf')
const APP_PATH_FL = resolve('../build/flex/bin/app.elf')

export const models: IDeviceModel[] = [
  { name: 'nanos', prefix: 'S', path: APP_PATH_S },
  { name: 'nanox', prefix: 'X', path: APP_PATH_X },
  { name: 'nanosp', prefix: 'SP', path: APP_PATH_SP },
  { name: 'stax', prefix: 'ST', path: APP_PATH_ST },
  { name: 'flex', prefix: 'FL', path: APP_PATH_FL },
]

export const PATH = "m/44'/123'/0'/0/0"

export const defaultOptions = {
  ...DEFAULT_START_OPTIONS,
  logging: true,
  custom: `-s "${APP_SEED}"`,
  X11: false,
}