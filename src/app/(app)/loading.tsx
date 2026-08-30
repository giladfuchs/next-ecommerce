export default function Loading() {
  return (
    <main className="animate-pulse">
      <section className="container px-4 py-10 md:px-8 md:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 h-12 w-2/3 rounded-md bg-neutral-200 dark:bg-neutral-800" />
          <div className="mb-3 h-5 w-full rounded-md bg-neutral-200 dark:bg-neutral-800" />
          <div className="mb-3 h-5 w-11/12 rounded-md bg-neutral-200 dark:bg-neutral-800" />
          <div className="mb-8 h-5 w-8/12 rounded-md bg-neutral-200 dark:bg-neutral-800" />

          <div className="flex flex-wrap gap-3">
            <div className="h-11 w-40 rounded-md bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-11 w-32 rounded-md bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>
      </section>

      <section className="container px-4 py-6 md:px-8 md:py-10">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          <div className="aspect-[16/10] rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
          <div className="flex flex-col justify-center gap-4">
            <div className="h-8 w-40 rounded-md bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-4 w-full rounded-md bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-4 w-10/12 rounded-md bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-4 w-9/12 rounded-md bg-neutral-200 dark:bg-neutral-800" />
            <div className="mt-2 h-10 w-36 rounded-md bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>
      </section>
    </main>
  );
}
