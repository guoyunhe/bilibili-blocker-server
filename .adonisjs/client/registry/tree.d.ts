/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  accounts: {
    show: typeof routes['accounts.show']
  }
  accountFlagVotes: {
    store: typeof routes['account_flag_votes.store']
  }
  accountFlagStatus: {
    update: typeof routes['account_flag_status.update']
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
