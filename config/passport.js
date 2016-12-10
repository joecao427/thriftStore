var passport=require("passport");
var User=require("../models/user");
var LocalStrategy=require("passport-local").Strategy;

passport.serializeUser(function(user,done){
    done(null,user.id);
});

passport.deserializeUser(function (id,done) {
    User.findById(id,function(err,user){
        done(err,user);
    });
});

passport.use("local.signup",new LocalStrategy({
    usernameField:"email",
    passwordField:"password",
    passReqToCallback:true
},

    function (req,email,password,done) {
    req.checkBody("email","Invalid Email").notEmpty().isEmail();
    req.checkBody("password","Invalid Password").notEmpty().isLength({min:4});
    var errors=req.validationErrors();
    if(errors){
        var messages=[];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        // return done(null,false,req.flash("error",messages));
        return done(null,false,req.flash("signupMessage",messages));
    }
    User.findOne({"email":email},function(err,user){
        if(err){
            return done(err);
        }
        if(user){
            return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
        }
        var newUser=new User();
        newUser.email=email;
        newUser.password=newUser.encryptPassword(password);
        newUser.save(function (err,result) {
            if(err){
                return done(err);
            }
            return done(null,newUser);
        });
    });
}));

passport.use("local.signin",new LocalStrategy({
    usernameField:"email",
    passwordField:"password",
    passReqToCallback:true
}, function(req,email,password,done) {
    req.checkBody("email","Invalid Email").notEmpty();
    req.checkBody("password","Invalid Password").notEmpty();
    var errors=req.validationErrors();
    if(errors){
        var messages=[];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        // return done(null,false,req.flash("error",messages));
        return done(null,false,req.flash("signinMessage",messages));
    }
    User.findOne({"email":email},function(err,user){
        if(err){
            return done(err);
        }
        if(!user){
            // return done(null,false,{message:"No User Found!!"});
        return done(null, false, req.flash('signinMessage', 'No user found.')); //  set flashdata
        }

        if(!user.validPassword(password)){
            return done(null,false,req.flash("signinMessage","Incorrect Password!"));
            // return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
        }
        return done(null,user);
    });
}));