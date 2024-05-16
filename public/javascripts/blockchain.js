const Crypto = require('./lib/sha256');

/////////////////////////
// global variable setup
/////////////////////////

// number of zeros required at front of hash
var difficultyMajor = 4;

// 0-15, maximum (decimal) value of the hex digit after the front
// 15 means any hex character is allowed next
// 7  means next bit must be 0 (because 0x7=0111),
//    (so the bit-strength is doubled)
// 0  means only 0x0 can be next
//    (equivalent to one more difficultyMajor)
var difficultyMinor = 15;  

var maximumNonce = 8;  // limit the nonce so we don't mine too long
var pattern = '';
for (var x=0; x<difficultyMajor; x++) {
  pattern += '0';     // every additional required 0
  maximumNonce *= 16; // takes 16x longer to mine
}
// at this point in the setup, difficultyMajor=4
// yields pattern '0000' and maximumNonce 8*16^4=524288

// add one more hex-char for the minor difficulty
pattern += difficultyMinor.toString(16);
var patternLen = pattern.length; // == difficultyMajor+1

if      (difficultyMinor == 0) { maximumNonce *= 16; } // 0000 require 4 more 0 bits
else if (difficultyMinor == 1) { maximumNonce *= 8;  } // 0001 require 3 more 0 bits
else if (difficultyMinor <= 3) { maximumNonce *= 4;  } // 0011 require 2 more 0 bits
else if (difficultyMinor <= 7) { maximumNonce *= 2;  } // 0111 require 1 more 0 bit
// else don't bother increasing maximumNonce, it already started with 8x padding


function getText(block) {
  return block.id + block.nonce + block.previous + block.tc + block.vote + block.data;
}


function sha256(block) {
  return Crypto.CryptoJS.SHA256(getText(block));  
}

function sha256Single(text) {
  return Crypto.CryptoJS.SHA256(text);
}

// gönderilen bloğun hash değeri patterni sağlayıp sağlamadığına göre bloğu kırmızı ya da yeşil olarak renklendirir
function updateState(blocks, index) {
  var pattern = 0x0000f;
  var hashValue = parseInt(blocks[index].hash.substr(0, 5), 16); // Hexadecimal olarak parse ediyoruz
  console.log(hashValue);
  if (hashValue <= pattern) {
      $('#block'+blocks[index].id+'chain'+1+'well').removeClass('well-error').addClass('well-success');
  }
  else {
   console.log("else");
      $('#block'+blocks[index].id+'chain'+1+'well').removeClass('well-success').addClass('well-error');
  }
}

function updateHash(words) {
  //blocks[index+1].hash = sha256Vote(blocks[index+1]);

  var myHash = words.map(function(word) {
    if (word < 0) {
        word = 0xFFFFFFFF ^ Math.abs(word) + 1;
    }
    return ('00000000' + (word >>> 0).toString(16)).slice(-8);
  }).join('');
  return myHash;
}

function updateChain(blocks, index) {

  for ( ; index < blocks.length; index++) {

    if(index==0)
    {
      blocks[index].previous = '0000000000000000000000000000000000000000000000000000000000000000';
    }
    else{
      blocks[index].previous = blocks[index-1].hash;
    }

  
    var myHash = updateHash(sha256(blocks[index]).words);
    blocks[index].hash = myHash;
  }
  return blocks;
}

// Nonce ve ardından hash hesaplama işlemi yapılır
function mine(blocks, index) {

  if(index==0)
  {
    blocks[index].previous = '0000000000000000000000000000000000000000000000000000000000000000';
  }
  else
  {
    blocks[index].previous = blocks[index-1].hash;
  }
  // data hashi hesaplanıyor
  var myHash = updateHash(sha256Single(blocks[index].data).words);
  blocks[index].data = myHash;

  for (var x = 0; x <= maximumNonce; x++) {
    blocks[index].nonce = x;

    var myHash = updateHash(sha256(blocks[index]).words);
    blocks[index].hash = myHash;
    
    // patternLen: 5, pattern: 0000f
    if (blocks[index].hash.substr(0, patternLen) <= pattern) { //hash değerinin ilk 5 karakteri, 0000f değerinden küçük eşitse      
      break;
    }
  }
  return blocks;
}


module.exports = {
  mine: mine,
  updateChain: updateChain,
  updateHash: updateHash,
  sha256: sha256,
  getText: getText
};