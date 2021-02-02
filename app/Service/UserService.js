var BaseRepository = require("../Repository/BaseRepository");
var User = require("../Model/user");
var mailer = require("../Middleware/mailer");
var jwt = require("jsonwebtoken");
var sms = require("../Middleware/sms");
var bcrypt = require("bcryptjs");
var mailer = require("../Middleware/mailer");
var UserRepo = new BaseRepository(User);
var secret = process.env.Secret;
var mongoose = require("mongoose");
const notify = require('../Service/OneSignalService');
const stylerService = require("../Service/StylersService");

exports.RegisterUser = Options => {
  return new Promise(async(resolve, reject) => {
    var gen = Math.floor(1000 + Math.random() * 9000);
    let hash = bcrypt.hashSync(Options.password, 10);

    var Option = {
      publicId: mongoose.Types.ObjectId(),
      statusCode: gen,
      password: hash,
      status: false,
      CreatedAt: new Date(),
      passwordToken: 1111,
      phoneNumber:Options.phoneNumber,
      email:Options.email,
      name:Options.name
    };
    let newN;
    User.findOne({ $or: [{email: Options.email, }, { phoneNumber:Options.phoneNumber, }] })
      .then(exists => {
        if (exists) {
          reject({ success: false, message: "Sorry user already exists" });
        } else {
          UserRepo.add(Option).then(created => {
            if (created) {
              getUserDetail(created).then(userdetail => {
                generateToken(userdetail)
                  .then(token => {
                    sms.sendToken(Options.phoneNumber, gen).then(done => {
                      if (done.SMSMessageData.Message == "Sent to 1/1 Total Cost: 0 done status") {
                        resolve({
                          success: true,
                          data: { user: created, token: token },
                          message: "Registration Successful"
                        });
                      } else {
                     
                       mailer.signupMail(Options.email,gen)
                            resolve({ success: true, data: { user: created, token: token }, message: "Registration Successful" })
                             }
                   }).catch(err => reject(err))
                  })
                  .catch(err => {
                    reject({
                      success: false,
                      data: err,
                      message: "could not authenticate user"
                    });
                  });
              }).catch(err => {
                reject(err);
              })
            } else {
              resolve({
                success: false,
                message: "User SignUp was not successfull"
              });
            }
          }).catch(err => {
            reject(err);
          });
        }
      })
      .catch(err => {
        reject(err);
      });
  });
};



exports.resendToken = email => {
  return new Promise((resolve, reject) => {
    UserRepo.getSingleBy({ email, })
      .then(user => {
        if (user) {
          mailer.signupMail(email, user.statusCode)
          resolve({ success: true, data: { resent: true, }, message: "Registration Successful (Token resend)" })
        }
        else {
          reject({ success: false, message: "No user found with the email," });
        }
      })
      .catch(err => reject(err))
  })
}

function authenticateuser(email, password) {
  return new Promise((resolve, reject) => {
    console.log("i reach here", email);
    if (email.length == 0 || password.length == 0) {
      reject({
        success: false,
        message: "authentication credentials incomplete"
      });
    } else {
      UserRepo.getSingleBy({ email: email }, "")
        .then(user => {
          if (!user) {
            return resolve({ success: false, message: "Incorrect email or password" });
          } else {
            var validPassword = bcrypt.compareSync(password, user.password);
            if (validPassword) {
              if (user.status == false) {
                mailer.signupMail(email, user.statusCode)
                resolve({
                  status: false,
                  message: "Please Verify your account",
                  role: user.role,
                });
              } else {
                getUserDetail(user).then(userdetail => {
                  generateToken(userdetail)
                    .then(token => {
                      resolve({ success: true, data: { user, token: token }, message: "authentication successful" });
                    })
                    .catch(err => {
                      resolve({ success: false, data: err, message: "could not authenticate user" });
                    });
                });
              }
            } else {
              resolve({ success: false, message: "Incorrect email or password" });
            }
          }
        })
        .catch(err => {
          reject(err);
        });
    }
  });
}
exports.authenticateuser = authenticateuser;

exports.forgotPasswordToken = data => {
  return new Promise((resolve, reject) => {
    User.findOne({ email: data.email })
      .then(found => {
        console.log(found , 'see user ')
        if (found) {
          mailer.forgortPasswordMailer(data.email, data.passwordToken)
              User.updateOne(
                { email: found.email },
                { passwordToken: data.passwordToken },
                function (err, updated) {
                  if (err) reject(err);
                  if (updated) {
                    resolve({ success: true, message: "Please check your email for verification code" });
                  } else {
                    resolve({ success: true, message: "Error sending verification code!!! " });
                  }
                }
              );
        } else {
          reject({ success: false, message: "Could not find user" });
        }
      })
      .catch(err => {
        reject(err);
      });
  });
};


exports.changeforgotPassword = Options => {
  return new Promise((resolve, reject) => {
    User.findOne({ passwordToken: Options.passwordToken })
      .then(found => {
        if (found) {
          let hash = bcrypt.hashSync(Options.password, 10);
          User.updateOne({ email: found.email }, { password: hash })
            .then(updated => {
              if (updated) {
                resolve({
                  success: true,
                  message: "User password updated Successfully!!!"
                });
              } else {
                reject({
                  success: false,
                  message: "Unable to update user password!!!"
                });
              }
            })
            .catch(err => {
              reject(err);
            });
        } else {
          reject({ success: false, message: "Invalid token inserted " });
        }
      })
      .catch(err => {
        reject(err);
      });
  });
};

exports.changepassword = (data) => {
  return new Promise((resolve, reject) => {
    User.findOne({ email: data.email }).then(found => {
      if (found) {
        var IsValid = bcrypt.compareSync(data.oldPassword, found.password)
        if (IsValid == true) {
          var newpassword = data.newPassword
          var hashNewPassword = bcrypt.hashSync(newpassword, 10)
          User.updateOne({ email: data.email }, { password: hashNewPassword }).then(updated => {
            if (updated) {
              resolve({ success: true, message: 'password has been changed successfully !!' })
            } else {
              resolve({ success: false, message: 'Error encountered while updating password ' })
            }
          }).catch(err => {
            reject(err);
          })
        }
        else {
          reject({ success: false, message: 'Old password does not match' })
        }
      }
    }).catch(err => {
      reject(err);
    })
  })
}

exports.verifyAccount = (email, Token, key) => {
  return new Promise((resolve, reject) => {
    User.findOne({ $and: [{ [key]: email }, { statusCode: Token }] })
      .then(data => {
        if (data) {
          var userId = data._id;
          return User.findByIdAndUpdate(
            { _id: userId },
            { status: true },
            function (err, updated) {
              if (err)
                resolve({ status: false, message: "Error Verifying User" });
              getUserDetail(updated).then(userDetail => {
                generateToken(userDetail)
                  .then(token => {
                    // resolve({ status: true, message: 'User has been verified', data: { user: updated, token: token } })
                    resolve({
                      success: true,
                      data: { user: userDetail, token: token },
                      message: "authentication successful"
                    });
                  })
                  .catch(err => {
                    reject({
                      success: false,
                      data: err,
                      message: "could not authenticate user"
                    });
                  });
              });
            }
          );
        }
        resolve({ status: false, message: "Invalid token supplied" });
      })
      .catch(err => {
        reject(err);
      });
  });
};

exports.verifySocial = id => {
  return new Promise((resolve, reject) => {
    User.findOne({ socialId: id })
      .then((user, err) => {
        if (user) {
          if (user.type === "social-login") {
            if (user.status == false) {
              resolve({
                status: false,
                message: "Please Verify your account "
              });
            } else {
              getUserDetail(user).then(userdetail => {
                generateToken(userdetail)
                  .then(token => {
                    resolve({
                      success: true,
                      data: { user, token: token },
                      message: "authentication successful"
                    });
                  })
                  .catch(err => {
                    reject({
                      success: false,
                      data: err,
                      message: "could not authenticate user"
                    });
                  });
              });
            }
          } else {
            resolve({
              success: false,
              message: "Sorry, user account was not created with social media"
            });
          }
        } else {
          if (err) resolve({ success: false, message: "Error Verifying User" });
          reject({
            socialAccount: false,
            message: "Sorry, user account does not exist"
          });
        }
      })
      .catch(err => {
        reject(err);
      });
  });
};

exports.updateProfile = function (id, data) {
  // console.log(data)
  return new Promise((resolve, reject) => {
    UserRepo.updateByQuery({ publicId: id }, data).then(updated => {
      console.log(data)
      if (updated) {
        UserRepo.getById(updated._id)
          .then(user => resolve({ success: true, data: user, message: "your profile was updated successfully" }))
          .catch(err => resolve({ success: false, data: err, message: "unable to update user Profile" }))
      }
    }).catch(err => {
      reject({ success: false, data: err, message: "could not update profile" });
    });
  });
};

exports.updateOneSignalId = function (id, data) {
  return new Promise((resolve, reject) => {
    UserRepo.updateByQuery({ publicId: id }, { $addToSet: data }).then(updated => {
      if (updated) {
        UserRepo.getById(updated._id)
          .then(user => resolve({ success: true, data: user, message: "one signal ID updated successfully" }))
          .catch(err => reject({ success: false, data: err, message: "unable to update one signal ID" }))
      }
    }).catch(err => {
      reject({ success: false, data: err, message: "could not update profile" });
    });
  });
};

exports.removeOneSignalId = function (id, data) {
  return new Promise((resolve, reject) => {
    UserRepo.updateByQuery({ publicId: id }, { $pull: { oneSignalUserId: { $in: [data] } } }).then(updated => {
      if (updated) {
        UserRepo.getById(updated._id)
          .then(user => resolve({ success: true, data: user, message: "one signal ID removed successfully" }))
          .catch(err => reject({ success: false, data: err, message: "unable to remove one signal ID" }))
      }
    }).catch(err => {
      reject({ success: false, data: err, message: "could not update profile" });
    });
  });
};

exports.removeCard = function (id, cardId) {
  return new Promise((resolve, reject) => {
    UserRepo.updateByQuery({ publicId: id }, { $pull: { cards: { _id: cardId, } } }).then(updated => {
      if (updated) {
        UserRepo.getById(updated._id)
          .then(user => resolve({ success: true, data: user, message: "card removed successfully" }))
          .catch(err => reject({ success: false, data: err, message: "unable to remove card" }))
      }
    }).catch(err => {
      reject({ success: false, data: err, message: "could not remove card" });
    });
  });
};

function getUserDetail(user) {
  return new Promise((resolve, reject) => {
    if (user) {
      var obj = {
        email: user.email,
        name: user.name,
        phone: user.phoneNumber,
        publicId: user.publicId,
        role: user.role
      };
      resolve(obj);
    } else {
      reject("user not found")
    }
  });
}

function generateToken(data = {}) {
  return new Promise((resolve, reject) => {
    jwt.sign({ ...data }, secret, function (err, token) {
      if (err) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
}

exports.generateToken = generateToken;

function verifyToken(token = "") {
  return new Promise((resolve, reject) => {
    jwt.verify(token.replace("Bearer", ""), secret, function (
      err,
      decodedToken
    ) {
      if (err) {
        reject(err);
      } else {
        return UserRepo.getSingleBy({ publicId: decodedToken.publicId, })
          .then(user => {
            resolve(Object.assign(decodedToken, { name: user.name, email: user.email, }));
          })
      }
    });
  });
}

exports.getUserData = function (Id) {
  return new Promise((resolve, reject) => {
    UserRepo.getSingleBy({ publicId: Id }, { _id: 0, __v: 0 })
      .then(user =>
        resolve({ success: true, data: user, message: "user details" })
      )
      .catch(err =>
        reject({
          success: false,
          data: err,
          message: "unable to fetch user details"
        })
      );
  });
};

exports.fetchCards = function (Id) {
  return new Promise((resolve, reject) => {
    UserRepo.getById(Id)
      .then(user =>
        resolve({
          success: true,
          data: user.cards,
          message: "user saved cards"
        })
      )
      .catch(err =>
        reject({
          success: false,
          data: err,
          message: "unable to fetch user cards"
        })
      );
  });
};


exports.getUsers = (pagenumber = 1, pagesize = 20) => {

  return new Promise((resolve, reject) => {
    User.find({role:'user'}).skip((parseInt(pagenumber - 1) * parseInt(pagesize))).limit(parseInt(pagesize))
          .exec((err, users) => {
              if (err) reject(err);
              if (users) {
                  resolve({ success: true, message: 'users found', data: users })
              } else {
                  resolve({ success: false, message: 'Unable to find what you searched for !!' })
              }
          });
  });
}

exports.getBalance = function (Id) {
  return new Promise((resolve, reject) => {
    UserRepo.getById(Id)
      .then(user =>
        resolve({
          success: true,
          data: parseInt(user.balance) || 0,
          message: "user saved cards"
        })
      )
      .catch(err =>
        reject({
          success: false,
          data: err,
          message: "unable to fetch user cards"
        })
      );
  });
};

exports.verifyToken = verifyToken;


exports.adminLogin = (email , password)=>{
  return new Promise((resolve , reject)=>{

    User.findOne({email:email}).exec((err , found)=>{
      console.log(found , 'hmmmm')
      if(err)reject({success:false , err:err});
      if(found){
        let unharshPassword = bcrypt.compareSync(password , found.password)
        if(!unharshPassword){
          resolve({success:false , message:"Inavlid email or password"})
        }else{
          if(found.role === "admin"){
            generateToken(found).then(token =>{
              resolve({success:true , message:"authentication successfull!!!" , data:found , token:token})
            })
          }else{
            resolve({success:false , message:"unauthorized access!!"})
          }
        }
      }else{
        resolve({success:false , message:"User not found!!"})
      }
    })
  })
}

                        // mailer.MailSender(u.email,u.statusCode).then(sent =>{
                        //   if(sent){
                        //     resolve({
                        //               success: true,
                        //               data: { user: created, token: token },
                        //               message: "Registration Successful"
                        //             });
                        //   }else{
                        //     resolve({
                        //               success: false,
                        //               message: "Error occured while registering user !!"
                        //             });
                        //   }
                        // }).catch(err =>{
                        //   reject(err);
                        // })