function truthTable(premises,conclusion) {
  premises=premises.map(a=>a.replace(/[\s]/g,'').replace(/-*>/g,'→').replace(/<-*>/g,'↔').replace(/&/g,'^').replace(/~/g,'¬'));
  var atomics='';
  for (var atomic of premises.join('').replace(/[^A-Z]/g,'')) if (!~atomics.indexOf(atomic)) atomics+=atomic;
  function isTrue(molecular,atomics) {
    function addTruth(op,dep,val) {
      if (operations.length&&op.depth===dep) {
        var t=op.negateNext?!val:!!val;
        op.negateNext=false;
        if (op.arg1!==undefined) op.arg2=t;
        else op.arg1=t;
      } else operations.splice(0,0,{
        depth:dep,
        arg1:!!val
      });
    }
    molecular=`(${molecular})`;
    var depth=0,operations=[];
    for (var i=0;i<molecular.length;i++) {
      if (molecular[i]==='(') depth++;
      else if (molecular[i]===')') {
        if (operations.length&&operations[0].depth===depth) {
          var result;
          switch (operations[0].type) {
            case "DISJUNCTION":result=operations[0].arg1||operations[0].arg2;break;
            case "CONJUNCTION":result=operations[0].arg1&&operations[0].arg2;break;
            case "CONDITIONAL":result=!operations[0].arg1||operations[0].arg2;break;
            case "BICONDITIONAL":result=operations[0].arg1===operations[0].arg2;break;
            default:result=operations[0].arg1;
          }
          operations.splice(0,1);
          addTruth(operations[0],depth-1,result);
        }
        depth--;
      } else if (/[A-Z]/.test(molecular[i])) {
        addTruth(operations[0],depth,atomics[molecular[i]]);
      } else switch (molecular[i]) {
        case "v":operations[0].type="DISJUNCTION";break;
        case "^":operations[0].type="CONJUNCTION";break;
        case "→":operations[0].type="CONDITIONAL";break;
        case "↔":operations[0].type="BICONDITIONAL";break;
        case "¬":
          if (operations.length&&operations[0].depth===depth) operations[0].negateNext=true;
          else operations.splice(0,0,{
            depth:depth,
            negateNext:true
          });
          break;
      }
    }
    return operations[0].arg1;
  }
  var table=`${atomics.split('').join('|')}| ${premises.join(' | ')} || ${conclusion}`;
  console.log(table);
}
truthTable(['A->B','C','C^BvA'],'B');
