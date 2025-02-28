import mongoose from "mongoose";

const {Schema} = mongoose;

//Esquema para el usuario
const userSchema = new Schema ({
    name: {type: String, required: true},
    last_name: {type: String, required: true},
    password: {type: String, required: true}

});

const userModel = mongoose.model('User', userSchema);

export default userModel;