let res = []
let tmp = {date: '24-Mar', slot:6}
let tmp2 = {date: '24-Mar', slot:7}
let tmp3 = {date: '25-Mar', slot:7}
function addSlot(res, tmp){
  let exist = res.find(el => el.date===tmp.date)
  if(exist){
    if(exist.slots.includes(tmp.slot)){
      //remove
      let index = exist.slots.indexOf(tmp.slot)
      console.log(index)
      exist.slots.splice(index,1)
    } else {
      exist.slots.push(tmp.slot)
    }
  }
  if(!exist)
    res.push({date: tmp.date, slots: [tmp.slot]})
}
addSlot(res, tmp)
addSlot(res, tmp2)
addSlot(res, tmp3)
console.log(res)
