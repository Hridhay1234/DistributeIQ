import Icon from './Icon'
import './splash.css'

export default function Splash({ label = 'Loading your store…' }: { label?: string }) {
  return (
    <div className="splash">
      <div className="splash-mark">
        <Icon name="store" size={30} strokeWidth={2.2} />
      </div>
      <div className="splash-spinner" />
      <p>{label}</p>
    </div>
  )
}
