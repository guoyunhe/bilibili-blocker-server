const ADD_RULE_UIDS_MESSAGE_TYPE = 'ADD_RULE_UIDS'

export function sendAddRuleUidsMessage(code: string, uids: string[]) {
  window.postMessage(
    {
      type: ADD_RULE_UIDS_MESSAGE_TYPE,
      code,
      uids,
    },
    window.location.origin
  )
}
