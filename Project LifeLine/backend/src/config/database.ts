import dotenv from 'dotenv';
dotenv.config();
import { Sequelize } from 'sequelize';
import path from 'path';

const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

let sequelize: Sequelize;

if (dbHost && dbUser) {
  console.log(`Connecting to remote MySQL Database ${dbName} at ${dbHost}:${dbPort}...`);
  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: parseInt(dbPort),
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      underscored: true,
      timestamps: true,
    },
  });
} else {
  console.log('No MySQL production parameters configured. Creating isolated file-based SQLite database for sandbox...');
  const storagePath = path.join(process.cwd(), 'lifelink.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false,
    define: {
      underscored: true,
      timestamps: true,
    },
  });
}

export default sequelize;
export { sequelize };
