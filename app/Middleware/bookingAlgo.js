var styler = require('../Model/stylers');


function calculateAmount(stylerId ,serviceId, adult , child, cb ){
  return  styler.findOne({_id:stylerId} , {services:{$elemMatch: {serviceId:serviceId}}}).exec(( err , data) =>{
    
       if(data){
           var maps = data.services
           var object = Object.assign({}, ...maps)
           var adultTotal = object._doc.adult
           var childTotal = object._doc.child
           var TotalPrice = (adult * adultTotal) + (child * childTotal)
           console.log(TotalPrice , '-------------!!!!!!!!!!')
           cb(TotalPrice);
       }else{
           return err;
       }
    })
}

exports.calculateAmount = calculateAmount;