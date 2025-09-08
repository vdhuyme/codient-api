import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent } from 'typeorm'
import { Post } from '@entities/post'
import { nanoid } from 'nanoid'
import { generate } from '@utils/slugify'

@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<Post> {
  listenTo() {
    return Post
  }

  beforeInsert(event: InsertEvent<Post>) {
    if (event.entity.title) {
      const slugBase = generate(event.entity.title)
      const randomId = nanoid(10)
      event.entity.slug = `${slugBase}-${randomId}`
    }
  }

  beforeUpdate(event: UpdateEvent<Post>) {
    if (event.entity && event.entity.title) {
      const slugBase = generate(event.entity.title)
      const randomId = nanoid(10)
      event.entity.slug = `${slugBase}-${randomId}`
    }
  }
}
