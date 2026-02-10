export default function Title({ title }: { title: string }) {
  return (
    <div className="flex items-center">
      <h1 className="text-5xl font-extrabold text-black">
        {title}
      </h1>
    </div>
  )
}