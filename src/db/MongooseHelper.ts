import { set, connect } from 'mongoose';
/**
 * 
 * Helper Methodes like MongooseHelper.connect 
 * 
 */
export default class MongooseHelper {
    public static async connectToDatabase(uri: string) {
        set("strictQuery", true);
        await connect(uri)
            .catch((err) => {
                throw err;
            })
            .then(() =>
                console.log("Connected to Database"),
            );
    }
}