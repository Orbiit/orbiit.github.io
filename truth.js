/*
A function that returns an ASCII truth table. Dots represent true, nothing represents false.

EXAMPLES
truthTable(['Q->R','P->Q','PvT','T->S','~R'],'S');
truthTable(['T->Q','~TvR','~R'],'~Q');
truthTable(['~(PvQ)','PvR','T->R'],'T');
*/

function truthTable(premises,conclusion) {
  function makePerfect(molecular) {
    return molecular.replace(/[\s]/g,'').replace(/-*>/g,'→').replace(/<-*>/g,'↔').replace(/&/g,'^').replace(/~/g,'¬');
  }
  premises=premises.map(a=>makePerfect(a));
  conclusion=makePerfect(conclusion);
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
  var table='',tablelengths=[],div='';
  var i=0;
  for (var col of [...atomics.split(''),...premises,conclusion]) {
    tablelengths+=col.length;
    if (i===atomics.length+premises.length) table+='║',div+='╫';
    else if (i!==0) table+='┃',div+='╋';
    table+=col,div+='━'.repeat(col.length);
    i++;
  }
  table+='\n'+div;
  var combos=Math.pow(2,atomics.length),trues=[];
  for (var i=0;i<combos;i++) trues.push({});
  for (var i=0;i<atomics.length;i++) {
    var t=combos/Math.pow(2,i+1);
    for (var j=0,mode=false;j<combos;j++) {
      if (j%t===0) mode=!mode;
      trues[j][atomics[i]]=mode;
    }
  }
  for (var i=0;i<combos;i++) {
    var col=0,row='\n',results=[],conclu;
    for (var atomic of atomics) {
      row+=(trues[i][atomic]?'·':' ')+'┃';
      col++;
    }
    for (var premise of premises) {
      results.splice(0,0,isTrue(premise,trues[i]));
      row+=(results[0]?'•':' ')+' '.repeat(tablelengths[col]-1)+'┃';
      col++;
    }
    conclu=isTrue(conclusion,trues[i]);
    row=row.slice(0,-1)+'║'+(conclu?'·':'');
    if (~results.indexOf(false)) row=row.replace(/•/g,'·');
    else row+=(conclu?' ✔':'  ✖');
    table+=row;
  }
  return table;
}
