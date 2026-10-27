import FloatingPanel from './FloatingPanel.jsx'

export default function GenderPicker({ value, anchor, onChange, onDismiss }) {
  return <FloatingPanel className="gender-picker" anchor={anchor} labelledBy="gender-title" onDismiss={onDismiss}>
    {(dismiss) => <>
      <div className="picker-heading"><h2 id="gender-title">选择性别</h2><button type="button" onClick={dismiss}>取消</button></div>
      <div className="gender-options" role="group" aria-label="性别">
        {[['male', '男'], ['female', '女']].map(([key, label]) => <button type="button" key={key}
          aria-pressed={value === key} onClick={() => { onChange({ gender: key }); dismiss() }}>{label}</button>)}
      </div>
    </>}
  </FloatingPanel>
}
