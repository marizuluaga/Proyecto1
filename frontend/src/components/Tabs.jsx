// pestañas simples, se le pasa la lista y cual esta activa
export default function Tabs({ pestañas, activa, onCambiar }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
      {pestañas.map((p) => (
        <button
          key={p.id}
          onClick={() => onCambiar(p.id)}
          className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition ${
            activa === p.id
              ? 'border-pocion-600 text-pocion-700 dark:text-pocion-100'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {p.titulo}
        </button>
      ))}
    </div>
  )
}
