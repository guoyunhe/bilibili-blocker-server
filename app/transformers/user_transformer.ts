import type User from '#models/user'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class UserTransformer extends BaseTransformer<User> {
  toObject() {
    return this.pick(this.resource, ['id', 'name', 'email', 'createdAt', 'updatedAt', 'role'])
  }

  toAdmin() {
    return {
      id: this.resource.id,
      name: this.resource.name,
      email: this.resource.email,
      role: this.resource.role,
      voteCount: Number(this.resource.$extras.votes_count),
      createdAt: this.resource.createdAt.toISO(),
    }
  }

  toPublic() {
    return {
      id: this.resource.id,
      name: this.resource.name,
      createdAt: this.resource.createdAt.toISO(),
      voteCount: Number(this.resource.$extras.votes_count),
    }
  }
}
