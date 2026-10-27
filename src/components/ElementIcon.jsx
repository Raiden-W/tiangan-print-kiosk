const keys = { 木: 'wood', 火: 'fire', 土: 'earth', 金: 'metal', 水: 'water' }

export default function ElementIcon({ element, className = '' }) {
  return <img className={`element-icon ${className}`} data-element={keys[element]}
    src={`./ui/elements/${keys[element]} icon.png`} alt={`${element}元素`} draggable="false" />
}
