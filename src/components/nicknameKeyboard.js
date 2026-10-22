import chinese from 'simple-keyboard-layouts/build/layouts/chinese.js'

// Import only the Chinese dictionary, never the module containing all world layouts.
const dictionary = chinese.layoutCandidates
const syllables = Object.keys(dictionary)

export function pinyinCandidates(pinyin) {
  return dictionary[pinyin]?.split(' ') ?? []
}

export function isPinyinPrefix(pinyin) {
  return syllables.some((syllable) => syllable.startsWith(pinyin))
}

export const nicknameLayouts = {
  default: [
    'q w e r t y u i o p',
    'a s d f g h j k l',
    '{shift} z x c v b n m {bksp}',
    '{numbers} {left} {space} {right} {clear}',
  ],
  shift: [
    'Q W E R T Y U I O P',
    'A S D F G H J K L',
    '{shift} Z X C V B N M {bksp}',
    '{numbers} {left} {space} {right} {clear}',
  ],
  numbers: [
    '1 2 3 4 5 6 7 8 9 0',
    '@ # $ % & * ( ) _ -',
    '. , ! ? : ; \' " {bksp}',
    '{letters} {left} {space} {right} {clear}',
  ],
}
