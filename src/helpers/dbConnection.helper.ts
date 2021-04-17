import mongoose, { Connection } from 'mongoose';

export class DBConnectionHelper {

    public static initialize(): void {
        mongoose.connect('mongodb://127.0.0.1:27017/crypto_api', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(
            () => console.log('Database Connection Successful'),
            (err) => console.error('Database Connection Error!', err)
        );
    }
}
