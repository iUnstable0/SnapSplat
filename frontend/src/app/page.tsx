import Image from "next/image";
import Link from "next/link";

import styles from "./page.module.css";

import gql from "@/gql";

import EventCard from "./event-card";

import { InfiniteSlider } from "@/components/ui/infinite-slider";

import { Handshake } from "lucide-react";

import Header from "./header";

export default async function Home() {
  let user = null;

  try {
    user = (await gql.query.user()).user;
  } catch (error) {
    console.log("Not authenticated");
  }

  // Data for the event cards
  const events = [
    {
      eventId: 1,
      title: "May's 18th Birthday Party",
      location: "65 Westdale Dr, North York, ON M3K 1A7, Canada",
      date: "April 29, 2025",
      imageUrl: "https://picsum.photos/seed/picmultiply/400/600",
    },
    {
      eventId: 2,
      title: "Senior Prom Night",
      location: "44 Beacon St, Boston MA 02108, USA",
      date: "May 3, 2025",
      imageUrl: "https://picsum.photos/seed/picsubtract/400/600",
    },
    {
      eventId: 3,
      title: "Malaysia Trip with Friends",
      location: "Malaysia",
      date: "May 3-14, 2025",
      imageUrl: "https://picsum.photos/seed/picsquare/400/600",
    },
    {
      eventId: 4,
      title: "Shanghai Hackathon",
      location: "Shanghai, China",
      date: "May 14 2025",
      imageUrl: "https://picsum.photos/seed/picsqrt/400/600",
    },
    {
      eventId: 5,
      title: "PCT Hiking",
      location: "Pacific Crest Trail",
      date: "July 12-19, 2025",
      imageUrl: "https://picsum.photos/seed/picdivide/400/600",
    },
  ];

  return (
    <div className={styles.pageWrapper}>
      <Header />

      <main className={styles.mainContainer}>
        <section className={styles.mainContent}>
          <Image
            src="/snapsplat-transparent.png"
            alt="SnapSplat"
            width={320}
            height={320}
            className={styles.mainContentLogo}
          />
          <h1>Welcome to SnapSplat</h1>
          <p className={styles.subtitle}>
            Create a beautiful photo gallery for all your events. Anyone can
            join and contribute.
          </p>
          <Link href="/login" className={styles.ctaButton}>
            {user ? "Open App" : "Get Started"}
          </Link>
        </section>

        <section className={styles.eventGallery}>
          <InfiniteSlider
            speed={40}
            speedOnHover={20}
            gap={28}
            // className={styles.infiniteSlider}
          >
            {/* Cant use map here because of the infinite slider */}
            <EventCard index={0} event={events[0]} />
            <EventCard index={1} event={events[1]} />
            <EventCard index={2} event={events[2]} />
            <EventCard index={3} event={events[3]} />
            <EventCard index={4} event={events[4]} />
          </InfiniteSlider>
        </section>

        <footer className={styles.siteFooter}>
          <div className={styles.footerIcon}>
            <Handshake className={styles.footerIconSvg} />
          </div>
          <p className={styles.footerText}>
            SnapSplat allows anyone to create beautiful photo galleries for their
            events. Users can join events, contribute photos, and share memories
            with friends and family. Events are collaborative spaces where
            everyone can upload, view, and organize photos from shared
            experiences, making it easy to capture and relive special moments
            together.
          </p>
          <a href="#" className={styles.footerLink}>
            See how your data is managed...
          </a>
        </footer>
      </main>
    </div>
  );
}
