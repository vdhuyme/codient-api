import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent } from 'typeorm'
import { nanoid } from 'nanoid'
import { Category } from '@entities/category'
import { generate } from '@utils/slugify'

@EventSubscriber()
export class CategorySubscriber implements EntitySubscriberInterface<Category> {
  listenTo() {
    return Category
  }

  beforeInsert(event: InsertEvent<Category>) {
    if (event.entity.name) {
      const slugBase = generate(event.entity.name)
      const randomId = nanoid(15)
      event.entity.slug = `${slugBase}-${randomId}`
    }
  }

  beforeUpdate(event: UpdateEvent<Category>) {
    if (event.entity && event.entity.title) {
      const slugBase = generate(event.entity.title)
      const randomId = nanoid(10)
      event.entity.slug = `${slugBase}-${randomId}`
    }
  }
}
