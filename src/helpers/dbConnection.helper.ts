import mongoose from 'mongoose';

export class DBConnectionHelper {

    private static readonly DB_NAME = 'crypto_api';

    public static initialize(): Promise<typeof mongoose> {
        return mongoose.connect(`mongodb://127.0.0.1:27017/${DBConnectionHelper.DB_NAME}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
    }
}
