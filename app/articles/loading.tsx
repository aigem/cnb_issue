import { Skeleton } from "@/components/ui/skeleton"

export default function ArticlesLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-10 w-48 mb-4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filters skeleton */}
        <div className="md:col-span-1">
          <div className="space-y-6">
            <div>
              <Skeleton className="h-6 w-20 mb-3" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-6 w-16 mb-3" />
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            </div>
            <div>
              <Skeleton className="h-6 w-20 mb-3" />
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Articles skeleton */}
        <div className="md:col-span-3">
          <div className="grid gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border rounded-lg p-6">
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
