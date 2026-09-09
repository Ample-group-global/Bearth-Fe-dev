import BearthBackgroundImage from "../BearthBackgroundImage";
import Heading from "../Heading";
import MaxWidthConstraintedLayout from "../MaxWidthConstraintedLayout";
import Paragraph from "../Paragraph";

export default function SectionLast() {
  return (
    <MaxWidthConstraintedLayout
      as="section"
      className="px-4 py-16 md:py-24 text-white flex flex-col min-h-dvh justify-between"
      outerDivClassName="relative"
      slotOutside={
        <BearthBackgroundImage
          src="/assets/about-bg-bottom.webp"
          absolute
          containerClassName="z-26"
        />
      }
    >
      <div className="flex flex-col items-center justify-center text-center z-27">
        <Heading
          type="h1"
          className="uppercase text-primary title-stroke title-strokecolor-white"
        >
          Find Your Place <br /> in the Stars
        </Heading>
        <Paragraph type="large2">
          The bears are searching for their perfect planet. <br />
          <span className="font-bold">Maybe you're searching too.</span>
        </Paragraph>
      </div>

      <div className="flex flex-col items-center justify-center text-center gap-6 z-27">
        <div className="mt-4 flex flex-col items-center justify-center gap-2 lg:gap-0">
          <Paragraph
            type="large2"
            className="font-bold text-primary title-stroke-smblack4"
          >
            Welcome home, fellow traveler.
            <br />
            Your perfect nap spot is waiting.
          </Paragraph>
        </div>
      </div>
    </MaxWidthConstraintedLayout>
  );
}
