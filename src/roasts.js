'use strict';

/**
 * RipCode Roasts — embedded humor from the rip-on-shit actor
 * Static content, no API calls needed.
 */

const ROASTS = [
  // Observations
  "Every company that says they're 'disrupting' an industry is really just adding a subscription model to something that worked fine before.",
  "The phrase 'we're like a family here' is corporate for 'we will guilt you into unpaid overtime.'",
  "LinkedIn has somehow convinced millions of people that posting about their morning routines is a professional activity.",
  "The best part of 'agile development' is how it lets you do the same amount of work but with more meetings about the work.",
  "Thought leadership is just blogging for people who think blogging sounds too honest.",

  // One-liners
  "I have a lot of growing up to do. I realized that the other day inside my fort.",
  "The meeting to discuss why we have too many meetings has been rescheduled.",
  "My company has unlimited PTO, which is corporate for 'we've gamified not taking vacation.'",
  "I used to work at a startup. Well, I say 'work.' I attended standups.",
  "We pivoted. That's what you say when the first idea didn't work but you're not ready to get jobs yet.",

  // Tweets
  "Every productivity hack is just a longer way of saying 'do the thing instead of not doing the thing.'",
  "The confidence of a LinkedIn influencer posting 'hot take' before an opinion held by literally everyone.",
  "Hustle culture is a pyramid scheme but instead of money, you lose your personality.",

  // Slack messages
  "Just got out of a meeting about scheduling the meeting to plan the kickoff for the project we haven't defined yet. Productive Tuesday.",
  "Love how we say 'let's take this offline' in a meeting when what we mean is 'let's never speak of this again.'",
  "The all-hands is in 10 minutes. They're going to tell us how well the company is doing right before they announce the layoffs.",

  // Mixed
  "I used to think 'synergy' was a real thing. Then I attended a meeting.",
  "There's a special circle of hell reserved for people who reply-all to say 'thanks!'",
  "My calendar is a visual representation of how little control I have over my own life.",
  "Unpopular opinion: Most 'unpopular opinions' on LinkedIn are just regular opinions with a persecution complex.",
  "The blockchain will revolutionize everything we don't actually need revolutionized.",
];

const LONG_ROASTS = [
  // LinkedIn posts
  `I fired my top performer yesterday.

Not because of their work. Their work was flawless.

I fired them because they left at 5pm.

You see, culture isn't about results. It's about optics.

And optics matter more than your family, your health, or your actual job performance.

That's leadership.

Agree?`,

  `Unpopular opinion: Sleep is overrated.

I've been running on 4 hours a night for 6 years.

Do I have constant headaches? Yes.
Do I snap at my family? Often.
Can I remember what I had for breakfast? Rarely.

But my startup has raised 3 rounds of funding.

That's called winning.

What sacrifices have YOU made for success?`,

  `When I interview candidates, I ask one question:

'If you had to describe yourself as a kitchen appliance, what would you be and why?'

It tells me everything I need to know.

Last week, someone said 'toaster.'

I hired them on the spot.

That's intuition.

That's leadership.

That's probably illegal but HR hasn't said anything yet.`,

  // Spiraling list
  `7 Ways to Be a Better Team Player:

1. Show up on time. Reliability matters.
2. Communicate clearly. No one can read minds.
3. Offer to help when you see someone struggling.
4. Take notes in meetings so others don't have to.
5. Volunteer for the projects no one wants.
6. Answer Slack messages within 30 seconds, 24/7.
7. Sleep under your desk to maximize availability.
8. Legally change your name to the company name.
9. Donate your organs to the CEO's family.
10. Fake your own death so your ghost can attend meetings after hours.`,

  // Fake persona bio
  `Brent Synergy
Founder. Visionary. Chief Disruption Officer at DisruptCorp Industries.

Brent started his career by dropping out of three different business schools—not because he failed, but because they couldn't teach him fast enough. After pivoting through 14 startups (all pre-revenue by design), he founded DisruptCorp, a company that disrupts companies that disrupt other companies.

He is a frequent keynote speaker at conferences that haven't been invented yet and has been featured in publications that exist only in alternative timelines. His morning routine has been described as 'aggressive' and 'probably illegal in some states.'

Brent believes that if you're not failing, you're not trying. He has tried very, very hard.

Currently raising a Series Q round. Mission: To make the world a better place, or at least a more confusing one.`,

  // Kafkaesque nightmare
  `I called customer service to cancel my subscription. They transferred me to Retention. Retention transferred me to Loyalty. Loyalty transferred me to a department called 'Concerns.' Concerns put me on hold for 47 minutes, after which a pleasant voice explained I'd been transferred to the wrong Concerns—there are seven Concerns departments, organized by zodiac sign.

As a Virgo, I was routed to Concerns-6, where a representative named Brenda (or possibly a sophisticated voice algorithm) informed me that cancellation requires form 27-B, which must be notarized by a deceased relative. When I explained both my grandparents were unavailable, she suggested I try the Resurrection Services department.

Resurrection Services was closed for 'scheduled uncertainty.' I was offered a callback in 3-5 business eternities.

I'm still subscribed. The charges continue. Brenda sends me holiday cards. I've started to look forward to them.`,
];

function getRandomRoast() {
  return ROASTS[Math.floor(Math.random() * ROASTS.length)];
}

function getRandomLongRoast() {
  return LONG_ROASTS[Math.floor(Math.random() * LONG_ROASTS.length)];
}

module.exports = { ROASTS, LONG_ROASTS, getRandomRoast, getRandomLongRoast };
