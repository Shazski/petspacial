var db = require ('../config/connection')
var nodemailer = require('nodemailer')
var collName = require("../config/collections") 
var promise = require("promise")
const { resolve, reject } = require('promise')
const { response } = require('express')
const bcrypt = require('bcrypt')
const async = require('hbs/lib/async')
var objectId = require('mongodb').ObjectId

module.exports ={

    getallHospital:()=>{
        return new promise(async(resolve,reject)=>{
            let product =await db.get().collection(collName.hospital_collection).find({permission:"false"}).toArray()
            resolve(product)
        })
    },
    deleteProduct:(proId)=>{
        return new promise((resolve,reject)=>{
            db.get().collection(collName.hospital_collection).deleteOne({_id:objectId(proId)}).then((response)=>{
                resolve(response)
            })
        })
    },
    productDetails:(proId)=>{
        return new promise((resolve,reject)=>{
            db.get().collection(collName.hospital_collection).findOne({_id:objectId(proId)}).then((products)=>{
                resolve(products)
            })
        })
    },
    updateProduct:(proId,proDetails)=>{
        return new promise((resolve,reject)=>{
            db.get().collection(collName.hospital_collection)
            .updateOne({_id:objectId(proId)},
            {$set:{
                name:proDetails.name,
                loginCode:proDetails.loginCode,
                description:proDetails.description,
            }}).then((response)=>{
                resolve(response)
            })
            
        })
    },

    getAllUsers:()=>{
        return new promise((resolve,reject)=>{
            db.get().collection(collName.user_collection).find().toArray().then((response)=>{
                resolve(response)
            })
        })
    },

    addHospital:(collegeData)=>{
        return new promise(async(resolve,reject)=>{
            let respo ={}
            collegeData.password =await bcrypt.hash(collegeData.password,10)
            db.get().collection(collName.hospital_collection).findOne({$or:[{email:collegeData.email},{name:collegeData.name}]}).then((status)=>{
                if(status){
                    respo.status=true
                    resolve(respo)
                }else if(collegeData.permission === 'false'){
                        
                        db.get().collection(collName.hospital_collection).insertOne(collegeData).then((response)=>{
                            resolve(response.insertedId)
                        })
                        
                    }else{
                        respo.reg="false"
                        resolve(respo)
                    }
                    
                
            })
                
            
            })
            
        
    },
    deleteReq:(collegeDeleteId)=>{
        return new promise((resolve,reject)=>{
            db.get().collection(collName.hospital_collection).updateOne({_id:objectId(collegeDeleteId)},{
                $set:{
                    permission:"rejected"
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    },
    approveReq:(collegeEmail,collegeId)=>{
       return new promise((resolve,reject)=>{
        var transporter = nodemailer.createTransport({
            secure: true,
            port: 465,
            service: 'gmail',
            auth: {
              user: "ecommerce1419@gmail.com",
              pass: "iqtyaldszzgoweap"
            }
          });
          
          var mailOptions = {
            from: 'ecommerce1419@gmail.com',
            to: collegeEmail,
            subject: 'College registration Approval',
            text: 'Your Hospital is approved by admin! Now you can login"'
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
              resolve('mail not sent')
            } else {
                console.log('Email sent: ' + info.response);
                db.get().collection(collName.hospital_collection).updateOne({_id:objectId(collegeId)},{
                    $set:{
                        permission:"true"
                    }
                }).then((response)=>{
                    resolve(response)
                })
            }
          });
          
       })
    },

    getAllHospitals:()=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collName.hospital_collection).find({permission:"true"}).toArray().then((response)=>{
                resolve(response)
            })
        });
    }
}