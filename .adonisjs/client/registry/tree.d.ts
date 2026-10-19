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
  }
  emailVerification: {
    send: typeof routes['email_verification.send']
    verify: typeof routes['email_verification.verify']
  }
  accountFlagVotes: {
    store: typeof routes['account_flag_votes.store']
  }
  admin: {
    flags: {
      index: typeof routes['admin.flags.index']
      store: typeof routes['admin.flags.store']
      show: typeof routes['admin.flags.show']
      update: typeof routes['admin.flags.update']
      destroy: typeof routes['admin.flags.destroy']
    }
    users: {
      index: typeof routes['admin.users.index']
      destroy: typeof routes['admin.users.destroy']
    }
    votes: {
      index: typeof routes['admin.votes.index']
    }
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
