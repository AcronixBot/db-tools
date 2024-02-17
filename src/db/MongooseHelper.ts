import { set, connect } from 'mongoose';
/**
 * 
 * Helper Methodes like MongooseHelper.connect 
 * 
 */
export default class MongooseHelper {
    public static async connectToDatabase(uri: string) {
        set("strictQuery", true);
        return await connect(uri);
    }
}