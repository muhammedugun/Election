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


/////////////////////////
// functions
/////////////////////////
function sha256(block, chain) {
  // calculate a SHA256 hash of the contents of the block
  return CryptoJS.SHA256(getText(block, chain));  //getText metodu blockchain.pug dosyasında bulunan bir metottur.
}


function updateState(block, chain) {
  // set the well background red or green for this block
  if ($('#block'+block+'chain'+chain+'hash').val().substr(0, patternLen) <= pattern) {
      $('#block'+block+'chain'+chain+'well').removeClass('well-error').addClass('well-success');
  }
  else {
      $('#block'+block+'chain'+chain+'well').removeClass('well-success').addClass('well-error');
  }
}

function updateHash(block, chain) {
  // update the SHA256 hash value for this block
  $('#block'+block+'chain'+chain+'hash').val(sha256(block, chain));
  updateState(block, chain);
}

function updateChain(block, chain) {
  // update all blocks walking the chain from this block to the end
  for (var x = block; x <= 5; x++) {
    if (x > 1) {
      $('#block'+x+'chain'+chain+'previous').val($('#block'+(x-1).toString()+'chain'+chain+'hash').val());
    }
    updateHash(x, chain);
  }
}

// Nonce ve ardından hash hesaplama işlemi yapılır
function mine(block, chain, isChain) {
  for (var x = 0; x <= maximumNonce; x++) {
    $('#block'+block+'chain'+chain+'nonce').val(x);
    $('#block'+block+'chain'+chain+'hash').val(sha256(block, chain));
    if ($('#block'+block+'chain'+chain+'hash').val().substr(0, patternLen) <= pattern) { //hash değerinin ilk 5 karakteri, 0000f değerinden küçük eşitse
      if (isChain) {
        updateChain(block, chain);
      }
      else {
        updateState(block, chain);
      }
      break;
    }
  }
}





function getTextVote(block) {
  return block.id + block.nonce + block.previous + block.tc + block.vote + block.data;
}


function sha256Vote(block) {
  // calculate a SHA256 hash of the contents of the block
  return Crypto.CryptoJS.SHA256(getTextVote(block));  //getText metodu blockchain.pug dosyasında bulunan bir metottur.
}

function sha256Single(text) {
  // calculate a SHA256 hash of the contents of the block
  return Crypto.CryptoJS.SHA256(text);  //getText metodu blockchain.pug dosyasında bulunan bir metottur.
}

function updateHashVote(words) {
  //blocks[index+1].hash = sha256Vote(blocks[index+1]);

  var myHash = words.map(function(word) {
    if (word < 0) {
        word = 0xFFFFFFFF ^ Math.abs(word) + 1;
    }
    return ('00000000' + (word >>> 0).toString(16)).slice(-8);
  }).join('');
  return myHash;
}

function updateChainVote(blocks, index) {
  // i 2, x 3
  for (var x = blocks[index].id; x <= blocks.length; x++) {
    if (x > 1) {
      console.log(x);
      blocks[x-1].previous = blocks[x-2].hash;
    }
    else
    {
      blocks[x-1].previous = '0000000000000000000000000000000000000000000000000000000000000000';
    }
    var myHash = updateHashVote(sha256Vote(blocks[x-1]).words);
    blocks[x-1].hash = myHash;
  }
}

// Nonce ve ardından hash hesaplama işlemi yapılır
function mineVote(blocks, index) {
  for (var x = 0; x <= maximumNonce; x++) {
    blocks[index].nonce = x;

    var myHash = updateHashVote(sha256Single(blocks[index].data).words);
    blocks[index].data = myHash;

    var myHash = updateHashVote(sha256Vote(blocks[index]).words);
    blocks[index].hash = myHash;
    
    if (blocks[index].hash.substr(0, patternLen) <= pattern) { //hash değerinin ilk 5 karakteri, 0000f değerinden küçük eşitse
      updateChainVote(blocks, index);
      break;
    }
  }
  return blocks;
}


module.exports = {
  mineVote,
  updateChainVote,
  updateHashVote,
  sha256Vote,
  getTextVote
};