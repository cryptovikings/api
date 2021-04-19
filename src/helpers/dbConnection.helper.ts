import mongoose from 'mongoose';

/**
 * Database Connection Helper, centralising database connection management concerns
 */
export class DBConnectionHelper {

    /**
     * Name of the Database to use
     */
    private static readonly DB_NAME = 'crypto_api';

    /**
     * Initialize by connecting to the Database. Designed to be called on Server 'listening', with error handling for connection failure
     *
     * @returns the default Mongoose database connection
     */
    public static initialize(): Promise<typeof mongoose> {
        return mongoose.connect(`mongodb://127.0.0.1:27017/${DBConnectionHelper.DB_NAME}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
    }
}
