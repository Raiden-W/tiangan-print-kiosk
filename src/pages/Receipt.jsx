import FortuneTicket from '../components/FortuneTicket.jsx'

const messages = {
  idle: '准备小票…',
  preparing: '正在准备小票…',
  submitting: '正在提交打印任务，请稍候…',
  submitted: '',
  failed: '任务提交失败，请联系现场工作人员。',
  unknown: '打印结果不明，请检查纸张和队列，不要直接重复打印。',
  error: '小票准备失败，可返回结果页重试。',
  'printer-missing': '未找到 POS58 Printer，请检查连接后返回结果页重试。',
  'printer-unavailable': '暂时无法读取 Windows 打印机列表，请检查打印服务后重试。',
  preview: '',
  prepared: '小票已准备。',
}

export default function Receipt({ ticket, status, printing, onFinish }) {
  return <section className="receipt-page page" aria-label="小票与打印状态">
    <div className="printer-placeholder" aria-hidden="true"><div /></div>
    <div className="receipt-viewport"><div className="receipt-paper"><FortuneTicket ticket={ticket} /></div></div>
    <div className="receipt-controls">
      {status !== 'submitted' && <p className="print-status" role="status">{messages[status] ?? messages.unknown}</p>}
      <div><button className="text-button" disabled={printing} onClick={onFinish}>返回首页</button></div>
    </div>
  </section>
}
