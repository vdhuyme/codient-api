export const ROLES_PERMISSIONS: Record<string, string[]> = {
  admin: [
    'user.read',
    'user.update',
    'post.create',
    'post.update',
    'post.delete',
    'post.read',
    'tag.create',
    'tag.update',
    'tag.delete',
    'tag.read',
    'category.create',
    'category.update',
    'category.delete',
    'category.read',
    'comment.update',
    'comment.delete',
    'comment.read',
    'file.upload',
    'stats.ga4'
  ],
  user: []
}
