const TYPES = {
  /**
   * Common
   */
  Slugify: Symbol.for('Slugify'),
  Hash: Symbol.for('Hash'),

  /**
   * Database
   */
  DataSource: Symbol.for('DataSource'),

  /**
   * Repositories
   */
  UserRepository: Symbol.for('UserRepository'),

  /**
   * Services
   */
  AuthService: Symbol.for('AuthService'),
};

export { TYPES };
