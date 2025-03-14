/**
 * Token used to register and retrieve the ConfigManager
 */
export const CONFIG_TOKEN = Symbol("PRO_DI_CONFIG");

/**
 * Options for configuring the ConfigManager
 */
export interface ConfigOptions {
  /**
   * Current environment (development, production, test, etc.)
   * Defaults to process.env.NODE_ENV if not provided
   */
  env?: string;

  /**
   * Configuration values organized in a hierarchical structure
   */
  values: Record<string, any>;
}

/**
 * ConfigManager provides a centralized way to manage application configuration
 * with support for environment-specific values and dot notation access
 */
export class ConfigManager {
  private config: Record<string, any>;
  private env: string;

  /**
   * Create a new ConfigManager instance
   * @param options Configuration options
   */
  constructor(options: ConfigOptions) {
    this.env = options.env || process.env.NODE_ENV || "development";
    this.config = options.values;
  }

  /**
   * Get a configuration value using dot notation
   * @param key Configuration key with dot notation (e.g., 'database.host')
   * @param defaultValue Default value to return if the key doesn't exist
   * @returns The configuration value or the default value
   */
  get<T>(key: string, defaultValue?: T): T {
    const parts = key.split(".");
    let current: any = this.config;

    for (const part of parts) {
      if (current === undefined || current === null) {
        return defaultValue as T;
      }
      current = current[part];
    }

    return (current === undefined ? defaultValue : current) as T;
  }

  /**
   * Get the current environment name
   * @returns Environment name string
   */
  getEnvironment(): string {
    return this.env;
  }

  /**
   * Check if current environment matches the given name
   * @param env Environment name to check
   * @returns true if current environment matches
   */
  isEnvironment(env: string): boolean {
    return this.env === env;
  }

  /**
   * Set a configuration value using dot notation
   * @param key Configuration key with dot notation
   * @param value Value to set
   */
  set(key: string, value: any): void {
    const parts = key.split(".");
    let current: any = this.config;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part] || typeof current[part] !== "object") {
        current[part] = {};
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
  }

  /**
   * Get all configuration values for a specific section
   * @param section Section name (top-level key)
   * @returns All values in the section or empty object
   */
  getSection<T extends Record<string, any>>(section: string): T {
    return (this.config[section] || {}) as T;
  }

  /**
   * Load environment variables with a specified prefix into the configuration
   * @param prefix Prefix for environment variables (e.g., 'APP_')
   * @param transform Optional transformation function for keys
   */
  loadFromEnv(prefix: string, transform?: (key: string) => string): void {
    Object.entries(process.env).forEach(([key, value]) => {
      if (key.startsWith(prefix)) {
        const configKey = transform
          ? transform(key.substring(prefix.length))
          : key.substring(prefix.length).toLowerCase().replace(/_/g, ".");

        this.set(configKey, value);
      }
    });
  }

  /**
   * Merge additional configuration values
   * @param values Values to merge into the current configuration
   * @param overwrite Whether to overwrite existing values (default: true)
   */
  merge(values: Record<string, any>, overwrite = true): void {
    this.mergeRecursive(this.config, values, overwrite);
  }

  /**
   * Helper method for recursively merging objects
   */
  private mergeRecursive(target: Record<string, any>, source: Record<string, any>, overwrite: boolean): void {
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (
          source[key] instanceof Object
          && key in target
          && target[key] instanceof Object
          && !(Array.isArray(source[key]))
        ) {
          this.mergeRecursive(target[key], source[key], overwrite);
        }
        else if (overwrite || !(key in target)) {
          target[key] = source[key];
        }
      }
    }
  }
}

// Helper function to create a new ConfigManager instance
export function createConfig(options: ConfigOptions): ConfigManager {
  return new ConfigManager(options);
}
