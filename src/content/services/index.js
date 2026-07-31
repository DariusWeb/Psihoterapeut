import {
    Award, CalendarDays, Clock, Compass, DoorOpen, FlaskConical, Heart, Lightbulb,
    Palette, Scale, Smile, Sparkles, Sprout, Sun, UserRound, Users, UsersRound, Zap
} from '@lucide/vue'

import infertilityHero from '@/assets/images/services/infertility-hero.webp'
import infertilityRecognise from '@/assets/images/services/infertility-recognise.webp'
import infertilityTherapy from '@/assets/images/services/infertility-therapy.webp'
import infertilityLosses from '@/assets/images/services/infertility-losses.webp'
import motherhoodHero from '@/assets/images/services/motherhood-hero.webp'
import motherhoodRecognise from '@/assets/images/services/motherhood-recognise.webp'
import motherhoodChanges from '@/assets/images/services/motherhood-changes.webp'
import motherhoodTherapy from '@/assets/images/services/motherhood-therapy.webp'
import careerHero from '@/assets/images/services/career-hero.webp'
import careerRecognise from '@/assets/images/services/career-recognise.webp'
import careerLosses from '@/assets/images/services/career-losses.webp'
import careerBecoming from '@/assets/images/services/career-becoming.webp'

// Copy lives in en.json under `services.<key>`; this file only describes each page's shape.
// `type: 'grid'` needs one icon per item in the matching en.json `items` array.
export const services = [
    {
        id: 1,
        slug: 'infertilitate',
        key: 'infertility',
        image: infertilityHero,
        sections: [
            { key: 'recognise', type: 'list', image: infertilityRecognise },
            { key: 'therapy', type: 'list', image: infertilityTherapy },
            {
                key: 'losses',
                type: 'grid',
                image: infertilityLosses,
                icons: [CalendarDays, Heart, Users, UsersRound, Sprout, Sun, Heart, FlaskConical]
            }
        ]
    },
    {
        id: 2,
        slug: 'maternitate',
        key: 'motherhood',
        image: motherhoodHero,
        sections: [
            { key: 'recognise', type: 'list', image: motherhoodRecognise },
            {
                key: 'changes',
                type: 'grid',
                image: motherhoodChanges,
                icons: [Clock, Sparkles, Compass, Heart, Users, UserRound, Smile, Sprout]
            },
            { key: 'therapy', type: 'prose', image: motherhoodTherapy }
        ]
    },
    {
        id: 3,
        slug: 'cariera',
        key: 'career',
        image: careerHero,
        sections: [
            { key: 'recognise', type: 'list', image: careerRecognise },
            {
                key: 'losses',
                type: 'grid',
                image: careerLosses,
                icons: [Compass, Lightbulb, Zap, DoorOpen, Palette, Sparkles, Award, Sprout, Scale]
            },
            { key: 'becoming', type: 'prose', image: careerBecoming }
        ]
    }
]
