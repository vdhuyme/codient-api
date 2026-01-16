const TYPES = {
  Slugify: Symbol.for('Slugify'),

  CategoryRepository: Symbol.for('CategoryRepository'),
  CategoryService: Symbol.for('CategoryService'),
  DataSource: Symbol.for('DataSource'),

  TagRepository: Symbol.for('TagRepository'),
  UserRepository: Symbol.for('UserRepository'),
  PostRepository: Symbol.for('PostRepository'),
  CommentRepository: Symbol.for('CommentRepository'),

  TagService: Symbol.for('TagService'),
  AuthService: Symbol.for('AuthService'),
  ImagekitService: Symbol.for('ImagekitService'),
  StatsService: Symbol.for('StatsService'),
  PostService: Symbol.for('PostService'),
  CommentService: Symbol.for('CommentService'),
  UserService: Symbol.for('UserService')
}

export { TYPES }
