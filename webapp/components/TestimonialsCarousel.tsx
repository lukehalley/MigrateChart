"use client"

import * as React from "react"
import { motion } from "framer-motion"
import AutoScroll from "embla-carousel-auto-scroll"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { BadgeCheck } from "lucide-react"

interface Tweet {
  id: string
  author: string
  username: string
  content: string
  verified?: boolean
  url: string
  avatar?: string
}

const tweets: Tweet[] = [
  {
    id: "1",
    author: "jake",
    username: "Jakegallen",
    content: "This migration chart app by @Trenchooooor is so sickkk.\n\nSomething something migrations are bullish 🫡",
    verified: false,
    url: "https://x.com/Jakegallen/status/1996437736371401207",
    avatar: "https://pbs.twimg.com/profile_images/1965584061700997120/dwCXxb8C_400x400.jpg",
  },
  {
    id: "2",
    author: "conviccion",
    username: "convictionprtcl",
    content: "@Trenchooooor from @PayAINetwork community built it for free",
    verified: false,
    url: "https://x.com/convictionprtcl/status/1996306917002527115",
    avatar: "https://pbs.twimg.com/profile_images/1920978398458826752/p1aB9OWu_400x400.jpg",
  },
  {
    id: "3",
    author: "Notorious D.E.V.",
    username: "notorious_d_e_v",
    content: "🔥🔥 very nice work ser!\n\nI can see this being useful for all @MigrateFun migrations!",
    verified: true,
    url: "https://x.com/notorious_d_e_v/status/1996381224437457338",
    avatar: "https://pbs.twimg.com/profile_images/1964588626173628416/5_0LN7Bi_400x400.jpg",
  },
  {
    id: "4",
    author: "ZERA",
    username: "ZeraLabs",
    content: "Between moving LP to @MeteoraAG and migrating #M0N3Y → $ZERA earlier, the legacy and complete historical chart was lost.\n\nBut thankfully our awesome community stepped up: @Trenchooooor have assembled a web app for a complete journey-wide price view.\n\nWe appreciate the initiative and our community's support toward privacy for everyone! 🙏",
    verified: true,
    url: "https://x.com/ZeraLabs/status/1987243484089032773",
    avatar: "https://pbs.twimg.com/profile_images/1956178690649296901/6DmEWifl_400x400.jpg",
  },
  {
    id: "5",
    author: "crispy",
    username: "crispyycrispyy",
    content: "ah clean, i hate the post migration charts",
    verified: false,
    url: "https://x.com/crispyycrispyy/status/1995494794270036349",
    avatar: "https://pbs.twimg.com/profile_images/1987153960978030597/ibFUuv_W_400x400.jpg",
  },
  {
    id: "6",
    author: "DoKwonMike (zera mode)",
    username: "DoKwonMike",
    content: "Let's go!! ZERA HQ on the way!!\n\nYou are not ready!! 🚀\n\n$ZERA",
    verified: false,
    url: "https://x.com/DoKwonMike/status/1990796842096079047",
    avatar: "https://pbs.twimg.com/profile_images/1997397822191095808/N3D6LDS0_400x400.jpg",
  },
  {
    id: "7",
    author: "Costco Pizza",
    username: "MOON_BAGS69",
    content: "For the uninitiated, there's much more to the lore behind Zera. Here's the full chart for starters",
    verified: false,
    url: "https://x.com/MOON_BAGS69/status/1993641428308890024",
    avatar: "https://pbs.twimg.com/profile_images/1954860793733738496/F6ZYyXgo_400x400.jpg",
  },
  {
    id: "9",
    author: "TMXX",
    username: "tomaki_x",
    content: "$ZERA CHART",
    verified: false,
    url: "https://x.com/tomaki_x/status/1993582284297933023",
    avatar: "https://pbs.twimg.com/profile_images/1982696850541998080/TDBKce7__400x400.jpg",
  },
  {
    id: "10",
    author: "beatingthemarket",
    username: "beatingthemarkt",
    content: "BEST ZERA CHART",
    verified: false,
    url: "https://x.com/beatingthemarkt/status/1992091025033375868",
    avatar: "https://pbs.twimg.com/profile_images/1550446064729083904/r0ruSt-y_400x400.png",
  },
  {
    id: "11",
    author: "Papi",
    username: "PapiSOLnasty",
    content: "Yo fam, zera chart is fire! I love it.",
    verified: false,
    url: "https://x.com/PapiSOLnasty/status/1991539567149887579",
    avatar: "https://pbs.twimg.com/profile_images/1892260322641059840/A8emxARN_400x400.jpg",
  },
]

function TweetCard({ tweet }: { tweet: Tweet }) {
  return (
    <motion.a
      href={tweet.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative group h-full block"
    >
      {/* Main card - clickable area */}
      <div className="relative bg-transparent border border-[var(--border)] hover:border-[var(--primary)]/40 rounded-xl p-6 h-full transition-colors duration-300 backdrop-blur-sm overflow-hidden cursor-pointer">
        {/* Scan line effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--primary)]/30 to-transparent animate-scan-line" />
        </div>

        {/* Grid pattern background */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(to right, var(--primary) 1px, transparent 1px), linear-gradient(to bottom, var(--primary) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />

        {/* Header */}
        <div className="flex items-start gap-3 mb-4 relative z-10">
          {/* Avatar with glow */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-full border-2 border-[var(--primary)]/30 overflow-hidden">
              {tweet.avatar ? (
                <img
                  src={tweet.avatar}
                  alt={tweet.author}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[var(--surface)] flex items-center justify-center">
                  <span className="text-[var(--primary)] font-mono text-lg font-bold">
                    {tweet.author.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {/* Avatar glow */}
            <div className="absolute inset-0 rounded-full bg-[var(--primary)]/20 blur-md -z-10" />
          </div>

          {/* Author info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-[var(--text)] truncate" style={{ fontFamily: "'Syne', sans-serif" }}>{tweet.author}</span>
              {tweet.verified && (
                <BadgeCheck className="w-4 h-4 text-[var(--accent)] fill-[var(--accent)]/20 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm font-mono">
              <span className="truncate">@{tweet.username}</span>
            </div>
          </div>

          {/* Twitter X logo */}
          <div className="flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap text-[15px] font-mono">
            {tweet.content}
          </p>
        </div>
      </div>
    </motion.a>
  )
}

export default function TestimonialsCarousel() {
  const plugin = React.useRef(
    AutoScroll({
      playOnInit: true,
      speed: 1,
      stopOnInteraction: false,
      stopOnMouseEnter: false,
    })
  )

  return (
    <section className="testimonials-section">
      <style>{`
        .testimonials-section {
          padding: 8rem 2rem;
          position: relative;
          background: transparent;
        }

        .testimonials-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .testimonials-section {
            padding: 4rem 1.5rem;
          }
        }
      `}</style>

      <div className="testimonials-container">
        {/* Header */}
        <div className="section-header">
          <motion.div
            style={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="section-label">COMMUNITY VOICES</div>
            <h2 className="section-title">
              What The Community Is Saying
            </h2>
            <p className="section-description">
              Real Feedback From Holders Using The Platform.
            </p>
          </motion.div>
        </div>

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative mt-12"
        >
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[plugin.current]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {tweets.map((tweet, index) => (
                <CarouselItem key={tweet.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="h-full"
                  >
                    <TweetCard tweet={tweet} />
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </motion.div>
      </div>
    </section>
  )
}
