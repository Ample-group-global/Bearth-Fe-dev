"use client";
import { XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import BearthBadge from "../BearthBadge";
import Heading from "../Heading";
import Paragraph from "../Paragraph";

const items = [
  {
    id: 1,
    number: "1",
    title: (
      <>
        Vision
        <br className="md:hidden" /> & Value
      </>
    ),
    contentTitle: "Vision & Value",
    desktop2Line: true,
    image: "/assets/mindmap-vision-and-value.png",
    content: (
      <div className="flex flex-col">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            <Heading type="h4" as="h2">
              Our Vision
            </Heading>
            <Paragraph type="normal2">
              Create a healing universe where loss transforms into creation, and
              every being finds their place among the stars.
            </Paragraph>
            <Heading type="h4" as="h2">
              Our Values
            </Heading>
            <Paragraph type="normal2">
              The Bearth universe is guided by a core set of values, rooted in
              the story of the Bear Tribe:
            </Paragraph>
          </div>

          <div className="flex flex-col gap-1">
            <Heading
              type="h5"
              as="h3"
              className="w-fit px-1 text-white bg-primary"
            >
              Sustainability in action
            </Heading>
            <Paragraph type="normal2">
              Sustainability isn't just a slogan—it's a commitment woven into
              every decision. From eco-friendly materials to responsible
              production, our actions speak louder than words.
            </Paragraph>
          </div>

          <div className="flex flex-col gap-1">
            <Heading
              type="h5"
              as="h3"
              className="w-fit px-1 text-white bg-primary"
            >
              Healing First
            </Heading>
            <Paragraph type="normal2">
              Bearth began with a story of loss and rebirth. We believe art and
              creation can heal hearts, allowing precious memories to live on in
              new forms.
            </Paragraph>
          </div>

          <div className="flex flex-col gap-1">
            <Heading
              type="h5"
              as="h3"
              className="w-fit px-1 text-white bg-primary"
            >
              Coexistence over competition
            </Heading>
            <Paragraph type="normal2">
              Like the Bear Tribe's laid-back philosophy, we believe the best
              future isn't about fighting for space, but finding a planet where
              everyone can rest comfortably.
            </Paragraph>
          </div>

          <div className="flex flex-col gap-1">
            <Heading
              type="h5"
              as="h3"
              className="w-fit px-1 text-white bg-primary"
            >
              Thoughtfully Crafted
            </Heading>
            <Paragraph type="normal2">
              Inspired by architectural thinking, every detail of Bearth is
              designed with careful consideration. We pursue meaning, not speed.
            </Paragraph>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    number: "2",
    title: "Community",
    desktop2Line: true,
    image: "/assets/mindmap-community.png",
    content: (
      <div className="flex flex-col gap-2">
        <div>
          <Paragraph type="normal2">
            We are travelers of the universe, navigating between loss and
            creation, solitude and belonging. We influence web3 culture through
            warmth, not noise.
          </Paragraph>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <Heading
              type="h5"
              as="h3"
              className="w-fit px-1 text-white bg-primary"
            >
              Creator Empowerment
            </Heading>
            <Paragraph type="normal2">
              We empower creators from within, building infrastructure that
              helps artists, storytellers, musicians, and dreamers of all kinds
              rise and thrive.
            </Paragraph>
          </div>

          <div className="flex flex-col gap-1">
            <Heading
              type="h5"
              as="h3"
              className="w-fit px-1 text-white bg-primary"
            >
              Value Alignment
            </Heading>
            <Paragraph type="normal2">
              Our community supports healing, coexistence, and intentional
              creation. We lead and support movements that share our vision,
              building a kinder, more thoughtful web3.
            </Paragraph>
          </div>

          <div className="flex flex-col gap-1">
            <Heading
              type="h5"
              as="h3"
              className="w-fit px-1 text-white bg-primary"
            >
              Growing Together
            </Heading>
            <Paragraph type="normal2">
              We're recruiting global ambassadors and establishing governance
              structures that let the community shape Bearth's future. But we
              won't rush—we trust the process.
            </Paragraph>
          </div>

          <div className="flex flex-col gap-1">
            <Heading
              type="h5"
              as="h3"
              className="w-fit px-1 text-white bg-primary"
            >
              Decentralized Governance (DAO)
            </Heading>
            <Paragraph type="normal2">
              As our community matures, we're moving toward a DAO structure,
              enabling holders to shape Bearth's future through collective
              decision-making.
            </Paragraph>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    number: "3",
    title: "Expansion",
    desktop2Line: true,
    image: "/assets/mindmap-expansion.png",
    content: (
      <div className="flex flex-col gap-2">
        <div>
          <Paragraph type="normal2">
            Growth isn't about rushing—it's about finding the right rhythm. Just
            as the Fibonacci sequence guides our minting phases, Bearth expands
            organically, one thoughtful step at a time.
          </Paragraph>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <Heading type="h5" as="h3">
              NFT Collection{" "}
              <BearthBadge color="green">In Progress</BearthBadge>
            </Heading>
            <Paragraph type="normal2">
              The first entry into the Bearth universe is through our genesis
              NFT collection. These 9,999 digital collectibles serve as your
              identity and key within our world. The collection will be released
              in seven phases, following the Fibonacci sequence: 303, 303, 606,
              909, 1515, 2424, 3939.
            </Paragraph>
          </div>

          <div className="flex flex-col gap-1">
            <Heading type="h5" as="h3">
              Partnerships <BearthBadge color="green">In Progress</BearthBadge>
            </Heading>
            <Paragraph type="normal2">
              We're exploring collaborations with artists, brands, and projects
              that share our values, helping us reach new audiences while
              staying true to our mission.
            </Paragraph>
          </div>

          <div className="flex flex-col gap-1">
            <Heading type="h5" as="h3">
              Ambassador Program{" "}
              <BearthBadge color="yellow">Exploring</BearthBadge>
            </Heading>
            <Paragraph type="normal2" as="div">
              Ambassadors are co-creators and community builders who help Bearth
              find home worldwide. We're seeking:
              <ul className="list-disc pl-8 [&>li::marker]:text-xs">
                <li>
                  Community Builders - Organize local meet-ups and gatherings
                </li>
                <li>
                  Story Tellers - Create content and share personal journeys
                </li>
                <li>
                  Brand Advocates - Represent Bearth authentically on social
                  media
                </li>
              </ul>
            </Paragraph>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    number: "4",
    title: "Digital",
    desktop2Line: false,
    image: "/assets/mindmap-digital.png",
    content: (
      <div className="flex flex-col gap-2">
        <div>
          <Paragraph type="normal2">
            The digital realm is the native home of the Bearth IP, where our
            community gathers and the world comes to life.
          </Paragraph>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <Heading type="h5" as="h3">
              The City <BearthBadge color="green">In Progress</BearthBadge>
            </Heading>
            <Paragraph type="normal2">
              A web-based metaverse, similar to Azuki's Hilumia platform, that
              will become our community's digital home.
            </Paragraph>
          </div>

          <div className="flex flex-col gap-1">
            <Heading type="h5" as="h3">
              3D Characters <BearthBadge color="yellow">Exploring</BearthBadge>
            </Heading>
            <Paragraph type="normal2">
              We'll create 3D versions of every bear following OTHERSIDE
              specifications. Your bear is a traveler, free to explore anywhere
              on the journey, just like you.
            </Paragraph>
          </div>

          <div className="flex flex-col gap-1">
            <Heading type="h5" as="h3">
              Digital Experiences{" "}
              <BearthBadge color="yellow">Exploring</BearthBadge>
            </Heading>
            <Paragraph type="normal2">
              We're exploring interactive experiences, mini-games, and
              storytelling formats that make the digital universe feel alive.
            </Paragraph>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    number: "5",
    title: "Physical",
    desktop2Line: false,
    image: "/assets/mindmap-physical.png",
    content: (
      <div className="flex flex-col gap-2">
        <div>
          <Paragraph type="normal2">
            The Bearth IP extends into the physical world, bringing the universe
            to life in your hands. These products are tangible extensions of our
            story, not just merchandise.
          </Paragraph>
        </div>

        <div className="flex flex-col gap-2">
          <div>
            <Heading type="h5" as="h3">
              Toys & Collectibles{" "}
              <BearthBadge color="yellow">Exploring</BearthBadge>
            </Heading>
            <Paragraph type="normal2">
              We're creating high-quality Bear Tribe toys and collectibles that
              bring joy and comfort. These aren't just merchandise—they're
              companions that make the universe tangible.
            </Paragraph>
          </div>

          <div>
            <Heading type="h5" as="h3">
              Sustainable Production{" "}
              <BearthBadge color="yellow">Exploring</BearthBadge>
            </Heading>
            <Paragraph type="normal2">
              Every product uses eco-friendly materials and ethical
              manufacturing. Our values aren't just digital.
            </Paragraph>
          </div>

          <div>
            <Heading type="h5" as="h3">
              Apparel <BearthBadge color="yellow">Exploring</BearthBadge>
            </Heading>
            <Paragraph type="normal2">
              We're exploring clothing that brings Bearth into everyday life.
            </Paragraph>
          </div>

          <div>
            <Heading type="h5" as="h3">
              Others <BearthBadge color="yellow">Exploring</BearthBadge>
            </Heading>
            <Paragraph type="normal2">
              We're exploring art prints, home goods, and other merchandise that
              bring Bearth into daily life.{" "}
            </Paragraph>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 6,
    number: "6",
    title: "Hybrid",
    desktop2Line: false,
    image: "/assets/mindmap-hybrid.png",
    content: (
      <div className="flex flex-col gap-2">
        <div>
          <Paragraph type="normal2">
            At the heart of the Bearth IP is the fusion of physical and digital
            experiences. We experiment with new media and interactive formats
            that blur the boundaries, creating a truly immersive universe.
          </Paragraph>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <Heading type="h5" as="h3">
              Interactive Storytelling{" "}
              <BearthBadge color="yellow">Exploring</BearthBadge>
            </Heading>
            <Paragraph type="normal2">
              Imagine RPG games where the community shapes the storyline, or
              animated shorts where your Bear plays a role.
            </Paragraph>
          </div>

          <div className="flex flex-col gap-1">
            <Heading type="h5" as="h3">
              Phygital Technology{" "}
              <BearthBadge color="yellow">Exploring</BearthBadge>
            </Heading>
            <Paragraph type="normal2">
              We're creating products that seamlessly blend physical and
              digital, collectibles that exist in both worlds and unlock
              experiences in each.
            </Paragraph>
          </div>

          <div className="flex flex-col gap-1">
            <Heading type="h5" as="h3">
              IP Licensing & Monetization{" "}
              <BearthBadge color="yellow">Exploring</BearthBadge>
            </Heading>
            <Paragraph type="normal2">
              Enabling holders to license their NFTs to brands, transforming
              digital ownership into real commercial value and revenue.
            </Paragraph>
          </div>
        </div>
      </div>
    ),
  },
];

export default function MindmapGrid() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const expandedItem = items.find((i) => i.id === expandedId);

  const getGridClasses = (index: number): string => {
    const tabletPositions = [
      "md:[grid-column:1/7] md:[grid-row:1]",
      "md:[grid-column:1/4] md:[grid-row:2]",
      "md:[grid-column:4/7] md:[grid-row:2]",
      "md:[grid-column:1/3] md:[grid-row:3]",
      "md:[grid-column:3/5] md:[grid-row:3]",
      "md:[grid-column:5/7] md:[grid-row:3]",
    ];
    return `${tabletPositions[index]}` || "";
  };

  return (
    <div className="relative grow h-full flex flex-col">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-6 md:grid-rows-3 grow">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            layoutId={`card-${item.id}`}
            className={`relative cursor-pointer overflow-hidden rounded-xl aspect-square md:aspect-auto z-0 bg-[#EBE7E0] shadow-[3px_3px_4px_0px_#00000040_inset] ${getGridClasses(index)}`}
            onClick={() => setExpandedId(item.id)}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="absolute top-0 right-0 z-10 h-full max-w-full aspect-square mix-blend-darken opacity-60">
              <Image
                src={item.image}
                alt={item.contentTitle ?? item.title}
                fill
                sizes="190px"
                className="h-full w-full object-contain"
              ></Image>
            </div>
            <div
              className={cn(
                "relative flex h-full w-full p-4 md:p-8 justify-between flex-col",
              )}
            >
              <motion.div
                layoutId={`number-${item.id}`}
                className="text-[40px] font-semibold text-[#2d3748] md:hidden"
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              >
                {item.number}
              </motion.div>
              <motion.h2
                layoutId={`title-${item.id}`}
                className="text-[20px] font-semibold text-[#2d3748] text-right md:text-left md:text-[40px]"
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              >
                {item.title}
              </motion.h2>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {expandedId !== null && expandedItem && (
          <motion.div
            layoutId={`card-${expandedId}`}
            className="absolute inset-0 overflow-hidden rounded-2xl flex flex-row bg-[#EBE7E0] z-10"
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="absolute top-4 right-4 text-black cursor-pointer z-1"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedId(null);
              }}
            >
              <XIcon className="size-12" />
            </motion.button>
            <div className="relative flex h-full w-full flex-col p-6 lg:p-8">
              <motion.h1
                layoutId={`title-${expandedId}`}
                className="mb-4 whitespace-pre-line text-[40px] text-secondary pb-2 border-b border-black font-semibold"
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              >
                {expandedItem.contentTitle ?? expandedItem.title}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="text-black overflow-y-auto max-w-[800px]"
              >
                {expandedItem.content}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
