import { emptyParticipant } from './participant.js'

export function initialSession() {
  return { page: 'welcome', participant: emptyParticipant(), result: null, resultId: null, requestId: null, status: 'idle', errors: {} }
}

export function sessionReducer(state, action) {
  switch (action.type) {
    case 'start': return { ...initialSession(), page: 'discover' }
    case 'change': return state.status === 'pending' ? state : { ...state, participant: { ...state.participant, ...action.fields }, errors: {} }
    case 'invalid': return { ...state, errors: action.errors }
    case 'request': return { ...state, requestId: action.requestId, status: 'pending', errors: {} }
    case 'result': return state.requestId !== action.requestId || state.status !== 'pending' ? state :
      { ...state, page: 'result', result: action.result, resultId: action.resultId, status: 'ready', errors: {} }
    case 'failure': return state.requestId !== action.requestId ? state : { ...state, status: 'idle', errors: { form: action.message } }
    case 'receipt': return state.result ? { ...state, page: 'receipt' } : state
    case 'back-result': return state.result ? { ...state, page: 'result' } : state
    case 'reset': return initialSession()
    default: return state
  }
}
