import {
    Award, Baby, BatteryLow, Briefcase, Calculator, CalendarClock, CalendarX, Clock, Compass, DoorOpen,
    EyeOff, Flower2, HandHeart, Heart, HeartHandshake, HeartPulse, Hourglass, Lightbulb, ListChecks,
    MessageSquareOff, Palette, PersonStanding, Repeat, Scale, Signpost, Smile, Sparkles, Split, Sprout,
    Sun, Target, UserRound, UserRoundSearch, Users, Zap
} from '@lucide/vue'

import infertilityHero from '@/assets/images/services/infertility-hero.webp'
import infertilityTherapy from '@/assets/images/services/infertility-therapy.webp'
import motherhoodHero from '@/assets/images/services/motherhood-hero.webp'
import motherhoodTherapy from '@/assets/images/services/motherhood-therapy.webp'
import careerHero from '@/assets/images/services/career-hero.webp'
import careerBecoming from '@/assets/images/services/career-becoming.webp'
import infertilityCard from '@/assets/images/home/infertility-card.webp'
import motherhoodCard from '@/assets/images/home/motherhood-card.webp'
import careerCard from '@/assets/images/home/career-card.webp'

// Copy lives in en.json under `services.<key>`; this file only describes each page's shape.
// `type: 'grid'` needs one icon per item in the matching en.json `items` array.
// `type: 'split'` is the photo section the hero's second button jumps to; one per page.
// `cardImage` is the home Areas card crop; `image` stays the service page hero.
export const services = [
    {
        id: 1,
        slug: 'infertilitate',
        key: 'infertility',
        icon: Flower2,
        image: infertilityHero,
        cardImage: infertilityCard,
        sections: [
            {
                key: 'recognise',
                type: 'grid',
                icons: [CalendarClock, Scale, CalendarX, Calculator, MessageSquareOff, UserRoundSearch]
            },
            { key: 'therapy', type: 'split', image: infertilityTherapy },
            {
                key: 'losses',
                type: 'grid',
                icons: [CalendarX, HeartPulse, HeartHandshake, Users, UserRound, Sun, Smile, Sprout]
            }
        ]
    },
    {
        id: 2,
        slug: 'maternitate',
        key: 'motherhood',
        icon: Baby,
        image: motherhoodHero,
        cardImage: motherhoodCard,
        sections: [
            {
                key: 'recognise',
                type: 'grid',
                icons: [BatteryLow, EyeOff, Hourglass, Scale, PersonStanding, HeartHandshake, MessageSquareOff]
            },
            {
                key: 'changes',
                type: 'grid',
                icons: [Clock, Sparkles, Compass, Heart, Users, UserRound, Smile, Sprout]
            },
            { key: 'therapy', type: 'split', image: motherhoodTherapy }
        ]
    },
    {
        id: 3,
        slug: 'cariera',
        key: 'career',
        icon: Briefcase,
        image: careerHero,
        cardImage: careerCard,
        sections: [
            {
                key: 'recognise',
                type: 'grid',
                icons: [BatteryLow, Repeat, ListChecks, Signpost, Target, Split, HandHeart, MessageSquareOff]
            },
            {
                key: 'losses',
                type: 'grid',
                icons: [Compass, Lightbulb, Zap, DoorOpen, Palette, Sparkles, Award, Sprout, Scale]
            },
            { key: 'becoming', type: 'split', image: careerBecoming }
        ]
    }
]
