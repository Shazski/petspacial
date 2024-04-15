var express = require('express');
const res = require('express/lib/response');
const async = require('hbs/lib/async');
const { response, render } = require('../app');
var router = express.Router();
var productHelper =  require('../helpers/product-helpers')
var userHelper = require ('../helpers/user-helpers');
const { route } = require('./admin');
const verifyLogin = (req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}
const hospitalverify = (req,res,next)=>{
  if(req.session.hospitalLogin){
    next()
  }else{
    res.redirect('/hospital-login')
  }
}


router.get('/',verifyLogin, async function(req, res, next) {
  let user = req.session.user
    res.render('user/index',{admin:false,user}); 
  
});

router.get('/login',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect('/')
    
  }else{
    res.render('user/user-login',{'loginerror':req.session.loginErr})
    req.session.loginErr = false
  }
    
})

router.get('/signup',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect('/')
  }else{
    res.render('user/user-signup')

  }
})

router.post('/signup',(req,res)=>{
  userHelper.doSignup(req.body).then((respo)=>{
    
    if(respo.status){
      emailExits="Email or Username already taken.Try different username or email"
      res.render('user/user-signup',{emailExits})
    }else{
      res.redirect('/login')
    }
  })
})
    
  


router.post('/login',(req,res)=>{
  userHelper.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn=true
      req.session.user = response.user
      res.redirect('/')
    }else{
      req.session.loginErr="Invalid username or password!please check it"
      res.redirect('/login')
    }
  })
})

router.get('/logout',(req,res)=>{
  req.session.user=null
  req.session.loggedIn=null
  res.redirect('/')
})

router.post('/hospitals',(req,res)=>{
  console.log(req.body);
  req.session.district = req.body.district
  res.redirect('hospitals')

})

router.get('/hospitals',verifyLogin,async(req,res)=>{
  let hospitals = await userHelper.getHospital(req.session.district)
  res.render('user/hospital',{hospitals,user:req.session.user})
})

router.get('/hospital-reg',(req,res)=>{
  res.render('admi/hospital-reg',{user:true})
})

router.post('/hospital-reg',(req,res)=>{
  productHelper.addHospital(req.body).then((respo)=>{
    if(respo.status){
      console.log("first",respo);
      emailExits="Email or Username already taken.Try different username or email"
      res.render('admi/hospital-reg',{emailExits})
    }else if(respo.reg){
      console.log('middle',respo);
      wrongAdmincode="Admincode is wrong please contact with admin"
            res.render('admi/hospital-reg',{wrongAdmincode})
    } else{
      let image = req.files.image
      image.mv('./public/images/'+respo+'.jpg')
      res.redirect('/hospital-login')
    }
  })
})


router.get('/hospital-login',(req,res)=>{
  res.render('user/hospital-login',{'loginerror':req.session.loginErr})
})

router.post('/hospital-login',(req,res)=>{
  userHelper.hospitalLogin(req.body).then((response)=>{
    if(response.status){
      req.session.hospitalLogin=true
      req.session.hospital = response.hospital
      hospital=req.session.hospital
      res.redirect('/hospital-index')
    }else{
      req.session.loginErr="Your college is not approved By admin"
      res.redirect('/hospital-login')
    }
  })
})

router.get('/hospital-index',hospitalverify,(req,res)=>{
  hospital = req.session.hospital
  res.render('user/hospital-index',{hospital})
  req.session.loginErr = false
})




router.get('/appoinment/:id',verifyLogin,async(req,res)=>{
  let hospitalId = req.params.id
  res.render('user/appoinment',{hospitalId})
})

router.post('/appoinment',(req,res)=>{
  userHelper.addAppoinment(req.body).then((response)=>{
    res.redirect('/appoinment-fixed')
  })
})

router.get('/appoinment-fixed',verifyLogin,(req,res)=>{
  res.render('user/appoinment-fixed')
})

router.get('/view-appoinmentreq',hospitalverify,async(req,res)=>{
  hospital = req.session.hospital
  let requests = await userHelper.getAppoinmentRequests(hospital._id)
  res.render('user/view-appoinmentreq',{hospital,requests })
})

router.get('/approve/',hospitalverify,(req,res)=>{
  userHelper.sentApproveMail(req.query.email,req.query.id).then((response)=>{
    res.redirect('/view-appoinmentreq')
  })
})
router.get('/reject/',hospitalverify,(req,res)=>{
  userHelper.sentRejectMail(req.query.email,req.query.id).then((response)=>{
    res.redirect('/view-appoinmentreq')
  })
})
router.get('/view-accepted-appoinment',hospitalverify,async(req,res)=>{
  hospital = req.session.hospital
  let appoinments = await userHelper.getAcceptedAppoinment(hospital._id)
  res.render('user/accepted-appoinment',{hospital,appoinments})
})

router.get('/delete-appoinment/:id',hospitalverify,(req,res)=>{
  userHelper.deleteAppoinment(req.params.id).then((response)=>{
    res.redirect('/view-accepted-appoinment')
  })
})


module.exports =router
