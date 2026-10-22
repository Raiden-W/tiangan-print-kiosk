import { emptyParticipant } from './participant.js'

export function initialSession() {
  return { page: 'welcome', participant: emptyParticipant(), result: null, errors: {} }
}

export function sessionReducer(state, action) {
  switch (action.type) {
    case 'start': return { ...initialSession(), page: 'discover' }
    case 'change': return { ...state, participant: { ...state.participant, ...action.fields }, errors: {} }
    case 'invalid': return { ...state, errors: action.errors }
    case 'result': return { ...state, page: 'result', result: action.result, errors: {} }
    case 'reset': return initialSession()
    default: return state
  }
}
