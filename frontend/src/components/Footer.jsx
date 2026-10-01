const AÑO = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 py-6 text-center text-xs text-slate-500 dark:border-slate-800">
      Potion Lab · Proyecto 1 · Ingeniería Web {AÑO}
    </footer>
  )
}
