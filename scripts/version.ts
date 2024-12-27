import { exec } from 'node:child_process'
import { promisify } from 'node:util'

export const getPatchVersion = promisify(exec)('git describe --tags --always')
  .then(({ stdout }) => JSON.stringify(stdout.trimEnd()))
  .catch(() => '""')
