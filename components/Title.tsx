export default function Title({ title }: { title: string }) {
  return (
    <div className="flex items-center">
      <h1 className="text-3xl sm:text-5xl font-extrabold text-black">
        {title}
      </h1>
    </div>
  )
}