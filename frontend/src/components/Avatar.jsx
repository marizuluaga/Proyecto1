// muestra la foto o las iniciales si no tiene
export default function Avatar({ nombre = '?', url, tamaño = 'h-9 w-9' }) {
  const iniciales = nombre
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()

  if (url) return <img src={url} alt={nombre} className={`${tamaño} rounded-full object-cover`} />
  return (
    <div
      className={`${tamaño} flex shrink-0 items-center justify-center rounded-full bg-pocion-100 text-xs font-bold text-pocion-700 dark:bg-pocion-900 dark:text-pocion-100`}
    >
      {iniciales}
    </div>
  )
}
