type Props = {
  size?: 'sm' | 'md'
}

export default function PremiumBadge({ size = 'sm' }: Props) {
  const sizeClass = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1'
  return (
    <span
      className={`inline-flex items-center ${sizeClass} bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 rounded-full font-medium border border-amber-200`}
    >
      &#9733;
    </span>
  )
}
