import { build } from 'vite'

process.env.MPC_FIREFOX_BUILD = '1'
await build({ mode: 'production' })
