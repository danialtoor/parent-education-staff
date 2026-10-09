import {Check, ClipboardList, FileCheck2, ReceiptText, Send, type LucideIcon} from 'lucide-react';
import {type Data, eligible, queues, roster} from '@/lib/domain';

interface Task {
  id: string;
  icon: LucideIcon;
  pending: boolean;
  title: string;
  description: string;
  action: string;
  href: string;
}

function TaskRow({task}: {task: Task}) {
  const Icon = task.pending ? task.icon : Check;
  return <li className={`task-row${task.pending ? '' : ' task-complete'}`}>
    <Icon className="task-icon" size={28} strokeWidth={1.6} aria-hidden="true"/>
    <div className="task-copy">
      <h3>{task.title}</h3>
      <p>{task.description}</p>
    </div>
    {task.pending && <a className="btn task-action" href={task.href}>{task.action}</a>}
  </li>;
}

export function TaskList({data}: {data: Data}) {
  const q = queues(data);
  const unmarked = q.attendance.reduce((n, c) => n + roster(data, c.id).filter(e => e.attendance === 'Unmarked').length, 0);
  const ready = q.certify.reduce((n, c) => n + roster(data, c.id).filter(e => eligible(data, e)).length, 0);
  const tasks: Task[] = [
    {
      id: 'attendance', icon: ClipboardList, pending: q.attendance.length > 0,
      title: q.attendance.length ? `Record attendance for ${q.attendance.length} ${q.attendance.length === 1 ? 'class' : 'classes'}` : 'Attendance is up to date',
      description: unmarked ? `${unmarked} attendance ${unmarked === 1 ? 'record is' : 'records are'} still unmarked. Open the roster to record who attended.` : 'All ended, active classes have their attendance recorded.',
      action: 'Review attendance', href: '#/classes?filter=attendance',
    },
    {
      id: 'payment', icon: ReceiptText, pending: q.unpaid.length > 0,
      title: q.unpaid.length ? `Resolve payment for ${q.unpaid.length} ${q.unpaid.length === 1 ? 'parent' : 'parents'}` : 'No payments are holding up certification',
      description: q.unpaid.length ? 'Record a payment or fee waiver for parents who attended before issuing their certificates.' : 'Attendees awaiting certification have a recorded payment or fee waiver.',
      action: 'Review payments', href: '#/cases?filter=unpaid',
    },
    {
      id: 'certification', icon: FileCheck2, pending: ready > 0,
      title: ready ? `Prepare certificates for ${ready} eligible ${ready === 1 ? 'attendee' : 'attendees'}` : 'No certificates are waiting to be issued',
      description: ready ? 'Attendance and payment requirements are complete. Review the eligible attendees before issuing.' : 'Attendees will appear here when their attendance and payment requirements are complete.',
      action: 'Review certification', href: '#/classes?filter=certify',
    },
    {
      id: 'delivery', icon: Send, pending: q.failures.length > 0,
      title: q.failures.length ? `Resolve ${q.failures.length} failed certificate ${q.failures.length === 1 ? 'delivery' : 'deliveries'}` : 'No certificate deliveries need attention',
      description: q.failures.length ? 'These parents are already certified. Review the sending error and retry delivery to the court service.' : 'There are no unresolved sending failures. Odyssey acceptance feedback is unavailable.',
      action: 'Review deliveries', href: '#/odyssey',
    },
  ];
  return <ul className="task-list" aria-label="Outstanding work">{tasks.map(task => <TaskRow key={task.id} task={task}/>)}</ul>;
}
