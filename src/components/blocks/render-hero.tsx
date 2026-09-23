import type { Media, Page } from "@/payload-types";

import CmsLink from "@/components/shared/cms-link";
import ImageVideo from "@/components/shared/image-video";
import { RichText } from "@/components/ui";

type HeroProps = Page["hero"];

const HeroLinks = ({ links }: Pick<HeroProps, "links">) => {
  if (!links?.length) return null;

  return (
    <div className="mt-6 flex min-w-0 max-w-full flex-wrap justify-center gap-3">
      {links.map(({ link, id }, index) => (
        <CmsLink
          key={id ?? index}
          link={link}
          className="h-auto max-w-full whitespace-normal break-words py-2 text-center"
        />
      ))}
    </div>
  );
};

const HighImpactHero = ({ links, media, richText }: HeroProps) => (
  <section className="relative isolate flex min-h-[60svh] min-w-0 items-center justify-center overflow-hidden text-white sm:min-h-[65vh]">
    {media && typeof media === "object" ? (
      <ImageVideo
        resource={media as Media}
        fill
        priority
        className="absolute inset-0 z-0"
        imgClassName="object-cover"
        videoClassName="h-full w-full object-cover"
      />
    ) : null}
    <div className="absolute inset-0 z-[1] bg-black/55" />

    <div className="container relative z-10 min-w-0 px-4 py-14 sm:py-20 md:px-8">
      <div className="mx-auto min-w-0 max-w-3xl text-center">
        {richText ? (
          <RichText
            data={richText}
            disableIndent
            enableGutter={false}
            className="max-w-none prose-invert [&_h1]:text-3xl [&_h1]:leading-tight sm:[&_h1]:text-5xl [&_h2]:text-2xl [&_h2]:leading-tight sm:[&_h2]:text-4xl"
          />
        ) : null}
        <div className="flex justify-center">
          <HeroLinks links={links} />
        </div>
      </div>
    </div>
  </section>
);

const MediumImpactHero = ({ links, media, richText }: HeroProps) => (
  <section className="container grid min-w-0 items-center gap-8 px-4 py-10 sm:py-12 md:grid-cols-2 md:px-8 md:py-16">
    <div className="min-w-0">
      {richText ? (
        <RichText
          data={richText}
          disableIndent
          enableGutter={false}
          className="max-w-none [&_h1]:text-3xl [&_h1]:leading-tight sm:[&_h1]:text-4xl"
        />
      ) : null}
      <HeroLinks links={links} />
    </div>

    {media && typeof media === "object" ? (
      <ImageVideo
        resource={media as Media}
        className="relative min-w-0 aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100 sm:rounded-3xl dark:bg-neutral-900"
        fill
        priority
        imgClassName="object-cover"
        videoClassName="h-full w-full object-cover"
      />
    ) : null}
  </section>
);

const LowImpactHero = ({ links, richText }: HeroProps) => (
  <section className="container min-w-0 px-4 py-10 sm:py-12 md:px-8 md:py-16">
    <div className="mx-auto min-w-0 max-w-3xl text-center">
      {richText ? (
        <RichText
          data={richText}
          disableIndent
          enableGutter={false}
          className="max-w-none [&_h1]:text-3xl [&_h1]:leading-tight sm:[&_h1]:text-4xl"
        />
      ) : null}
      <div className="flex justify-center">
        <HeroLinks links={links} />
      </div>
    </div>
  </section>
);

export default function RenderHero(props: HeroProps) {
  switch (props.type) {
    case "highImpact":
      return <HighImpactHero {...props} />;
    case "mediumImpact":
      return <MediumImpactHero {...props} />;
    case "lowImpact":
      return <LowImpactHero {...props} />;
    case "none":
      return null;
  }
}
