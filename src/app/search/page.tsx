import SearchPageClient from './SearchPageClient'

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; mode?: string }>
}) {
  return <SearchPageClient searchParams={searchParams} />
}
