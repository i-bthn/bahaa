const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
    name:{
        type: String,
        requireed: true
    }, 
    
    email:{
        type: String,
        unique: true,
        requireed: true
    }, 
    password:{
        type: String,
        requireed: true,
        

    }, 
    major:{
        type: String,
        requireed: true
    },
    experience:{
        type: String,
        requireed: true
    },
    facebook:{
        type: String,
        requireed: true
    },
    twitter:{
        type: String,
        requireed: true
    },
    linkedin:{
        type: String,
        requireed: true
    },
    appointment:[
        {
            pname: {type: String,
                requireed: true},
            time: {type: Date,
                requireed: true},
            pemail: {type: String,
                requireed: true},
        }
    ] 
    

})

const user = mongoose.models.users || mongoose.model("users",usersSchema);
module.exports = user;