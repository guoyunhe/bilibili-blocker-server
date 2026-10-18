/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  drive: {
    fs: {
      serve: typeof routes['drive.fs.serve']
    }
  }
  flags: {
    index: typeof routes['flags.index']
  }
  accounts: {
    show: typeof routes['accounts.show']
  }
  users: {
    show: typeof routes['users.show']
    index: typeof routes['users.index']
    destroy: typeof routes['users.destroy']
  }
  accountFlagVotes: {
    store: typeof routes['account_flag_votes.store']
  }
  votes: {
    index: typeof routes['votes.index']
  }
  auth: {
    auth: {
      register: typeof routes['auth.auth.register']
      login: typeof routes['auth.auth.login']
      logout: typeof routes['auth.auth.logout']
      user: typeof routes['auth.auth.user']
    }
  }
}
