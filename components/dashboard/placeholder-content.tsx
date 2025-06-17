interface PlaceholderContentProps {
  title: string
}

export function PlaceholderContent({ title }: PlaceholderContentProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <i className="fas fa-code text-primary text-xl"></i>
        </div>
        <h3 className="text-xl font-bold mb-2">{title} Section</h3>
        <p className="text-gray-500 text-center max-w-md">
          This section is under development. Content for {title.toLowerCase()} will be available soon.
        </p>
      </div>
    </div>
  )
}
