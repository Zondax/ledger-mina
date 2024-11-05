import { IDeviceModel, DEFAULT_START_OPTIONS } from '@zondax/zemu'

import { resolve } from 'path'

export const APP_SEED = 'equip will roof matter pink blind book anxiety banner elbow sun young'

const APP_PATH_S = resolve('../build/nanos/bin/app.elf')
const APP_PATH_X = resolve('../build/nanox/bin/app.elf')
const APP_PATH_SP = resolve('../build/nanos2/bin/app.elf')
const APP_PATH_ST = resolve('../build/stax/bin/app.elf')
const APP_PATH_FL = resolve('../build/flex/bin/app.elf')

export const models: IDeviceModel[] = [
  //{ name: 'nanos', prefix: 'S', path: APP_PATH_S },
  //{ name: 'nanox', prefix: 'X', path: APP_PATH_X },
  { name: 'nanosp', prefix: 'SP', path: APP_PATH_SP },
  //{ name: 'stax', prefix: 'ST', path: APP_PATH_ST },
  //{ name: 'flex', prefix: 'FL', path: APP_PATH_FL },
]

export const PATH = "m/44'/123'/0'/0/0"

export const defaultOptions = {
  ...DEFAULT_START_OPTIONS,
  logging: true,
  custom: `-s "${APP_SEED}"`,
  X11: false,
}

export const txBlobExample =
  'e0030000ac00000000423632716d386e4c59647945724a6552337951514a7331505835367a646f59486f35644b71765962596f4655347a456f6b337757543734423632716963697059787945487537516a557153375176426970547335437a676b595a5a5a6b506f4b5659427536746e44556345395a7400000192906e4a00000000007735940000000010000425d448656c6c6f204d696e61210000000000000000000000000000000000000000000000'
