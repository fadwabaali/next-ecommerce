export default function Skeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          <td colSpan={8} className="px-4 py-3">
            <div className="h-4 bg-gray-100 rounded animate-pulse w-full" />
          </td>
        </tr>
      ))}
    </>
  )
}