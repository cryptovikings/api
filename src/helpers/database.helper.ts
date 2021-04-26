import mongoose from 'mongoose';

/**
 * Database Connection Helper, centralising database connection management concerns
 */
export class DatabaseHelper {

    /**
     * Name of the Database to connect to, copied over from the environment
     */
    private static readonly DATABASE_NAME = process.env.DATABASE_NAME!;

    /**
     * Initialize by connecting to the Database. Designed to be called on Server 'listening', with error handling for connection failure
     *
     * @returns the default Mongoose database connection
     */
    public static initialize(): Promise<typeof mongoose> {
        return mongoose.connect(`mongodb://127.0.0.1:27017/${DatabaseHelper.DATABASE_NAME}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
    }
}
