import { set, connect } from 'mongoose';
/**
 * 
 * Helper Methodes like MongooseHelper.connect 
 * 
 */
export default class MongooseHelper {
    public static async connectToDatabase() {
        set("strictQuery", true);
        await connect("mongodb+srv://antimention:nQ8hSBtDIu33rZgx@foniyx.8l5ft.mongodb.net/acronixDevelopment?retryWrites=true&w=majority")
            .catch((err) => {
                throw err;
            })
            .then(() =>
                console.log("Connected to Database"),
            );
    }
}