import { Config } from './patch'

const trash_logs = [(args: any[]) => args && args.length > 0 && args[0] === 'got backend message']

const config: Config = {
  async after() {
    const originalLog = console.log
    console.log = (...args: any[]) => {
      for (const fn of trash_logs) if (fn(args)) return
      originalLog.apply(console, args)
    }
  },
}

export default config
