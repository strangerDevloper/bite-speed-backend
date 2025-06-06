import { config } from 'dotenv';
import { DataSourceOptions, DataSource, createConnection } from 'typeorm';
import ormconfig from '../../ormconfig';

config();

class DbManager {
  private connection: DataSource | undefined;

  async connect(): Promise<void> {
    try {
      this.connection = await createConnection(ormconfig as DataSourceOptions);
      console.log('Database connection established');
    } catch (error) {
      console.error('Error connecting to the database:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      console.log('Database connection closed');
    }
  }

  getConnection(): DataSource {
    if (!this.connection) {
      throw new Error('Database connection not established');
    }
    return this.connection;
  }

  async reconnect(): Promise<void> {
    await this.close();
    await this.connect();
  }

  async isConnected(): Promise<boolean> {
    console.log('this.connection', !this.connection);
    if (!this.connection) {
      return false;
    }
    return this.connection.isConnected;
  }
}

export const dbManager = new DbManager();
export const AppDataSource = new DataSource(ormconfig as DataSourceOptions);
