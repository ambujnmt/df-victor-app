
import { Badge, SpiritSnack } from '../types';

export const QUOTES: { text: string; keywords: string[] }[] = [
    // --- FITNESS & HABITS ---
    { text: "Your body becomes what your habits believe.", keywords: ["habits", "believe"] },
    { text: "Consistency is the quietest but strongest muscle.", keywords: ["Consistency", "strongest"] },
    { text: "Fitness is a mindset before it's a movement.", keywords: ["mindset", "movement"] },
    { text: "Strong habits outlast strong feelings.", keywords: ["habits", "outlast"] },
    { text: "Every workout is a prayer of gratitude.", keywords: ["gratitude"] },
    { text: "Health is built in silence, one choice at a time.", keywords: ["Health", "silence"] },
    { text: "A strong mind builds a stronger body.", keywords: ["strong mind", "stronger body"] },
    { text: "The strongest habit is showing up.", keywords: ["habit", "showing up"] },
    { text: "What you measure, you master.", keywords: ["measure", "master"] },
    { text: "Do the work — especially on the days you don’t feel like it.", keywords: ["Do the work"] },
    { text: "Every rep is a vote for the future you.", keywords: ["rep", "future you"] },
    { text: "Pain is temporary; strength is permanent.", keywords: ["Pain", "strength"] },
    { text: "Excuses weigh more than dumbbells — drop them.", keywords: ["Excuses", "drop them"] },
    { text: "Your body is a gift — train it, don’t waste it.", keywords: ["body", "gift"] },
    { text: "Fitness is not punishment; it’s preparation for your calling.", keywords: ["Fitness", "calling"] },
    { text: "Atomic progress is built on atomic habits.", keywords: ["Atomic progress", "atomic habits"] },
    { text: "Sweat is trust in motion.", keywords: ["Sweat", "trust"] },
    { text: "Rest is part of the training, not the reward.", keywords: ["Rest", "training"] },
    { text: "Your body is a temple — train it with honor, discipline, and gratitude.", keywords: ["temple", "honor"] },

    // --- MINDSET & FAITH ---
    { text: "Mindset shapes your life; choose thoughts that build strength, not excuses.", keywords: ["Mindset", "strength"] },
    { text: "Faith fuels growth when your muscles are tired and your soul feels weak.", keywords: ["Faith", "growth"] },
    { text: "In every struggle there is a seed of wisdom waiting to grow.", keywords: ["struggle", "wisdom"] },
    { text: "When you doubt your path, faith gently whispers: keep stepping.", keywords: ["faith", "keep stepping"] },
    { text: "Mindset is the soil; habits are seeds; your life is the harvest.", keywords: ["Mindset", "habits", "harvest"] },
    { text: "Strength is never just physical — it’s spirit, mind, and body aligned.", keywords: ["Strength", "aligned"] },
    { text: "What you feed your mind shapes your tomorrow more than what you eat.", keywords: ["mind", "shapes"] },
    { text: "Surrender your fear, and your strength will rise in its place.", keywords: ["Surrender", "strength"] },
    { text: "Your identity is more than performance — it’s rooted in purpose.", keywords: ["identity", "purpose"] },
    { text: "Let your faith be bigger than your fear — watch doors open.", keywords: ["faith", "fear"] },
    { text: "Healthy living is honoring the gift of your body, mind, and spirit.", keywords: ["Healthy living", "honoring"] },
    { text: "Faith anchors you when storms come — keep your roots deep.", keywords: ["Faith", "roots deep"] },
    { text: "You build strength by doing what’s hard until it’s natural.", keywords: ["strength", "natural"] },
    { text: "Faith opens your eyes to see beauty even in the middle of pain.", keywords: ["Faith", "beauty"] },
    { text: "Peace isn’t the absence of noise but the presence of inner alignment.", keywords: ["Peace", "alignment"] },
    { text: "Every breath is a reminder: life is a gift, not a guarantee.", keywords: ["life", "gift"] },
    { text: "Transformation happens quietly — in patience, repetition, and surrender.", keywords: ["Transformation", "patience"] },
    { text: "Healing starts when you give yourself permission to rest, not quit.", keywords: ["Healing", "rest"] },
    { text: "Faith gives meaning to movement; you’re not just working out, you’re worshiping.", keywords: ["Faith", "worshiping"] },
    { text: "Kindness to yourself is not cornerstone — it’s strength expressed with wisdom.", keywords: ["Kindness", "strength"] },
    { text: "Let gratitude interrupt worry — it shifts your chemistry instantly.", keywords: ["gratitude", "shifts"] },
    { text: "Faith teaches you to breathe again when life feels too heavy to carry.", keywords: ["Faith", "breathe"] },
    { text: "Your growth may be invisible to others but undeniable to your spirit.", keywords: ["growth", "spirit"] },
    { text: "Change happens the moment you stop criticizing yourself and start showing compassion.", keywords: ["Change", "compassion"] },

    // --- LEADERSHIP & DISCIPLINE ---
    { text: "Discipline is stronger than mood; keep showing up.", keywords: ["Discipline", "showing up"] },
    { text: "Growth begins where comfort ends.", keywords: ["Growth", "comfort ends"] },
    { text: "Don’t stop when you’re tired, stop when you’re transformed.", keywords: ["tired", "transformed"] },
    { text: "Small habits build big victories — start today, not someday.", keywords: ["Small habits", "victories"] },
    { text: "Discipline is the bridge between who you are and who you want to be.", keywords: ["Discipline", "bridge"] },
    { text: "Teams win when individuals choose service over spotlight.", keywords: ["Teams", "service"] },
    { text: "True leadership is not titles, but taking responsibility for the next move.", keywords: ["leadership", "responsibility"] },
    { text: "The greatest strength is self-control — train your spirit as much as your muscles.", keywords: ["self-control", "spirit"] },
    { text: "Leadership begins the moment you choose to lift someone else up.", keywords: ["Leadership", "lift"] },
    { text: "Excellence is not a moment; it’s a mindset.", keywords: ["Excellence", "mindset"] },
    { text: "Teamwork is multiplying strength; alone you can go fast, together you can go far.", keywords: ["Teamwork", "together"] },
    { text: "You can’t lead others until you first lead yourself.", keywords: ["lead others", "lead yourself"] },
    { text: "Greatness is not in finishing first, but in refusing to quit.", keywords: ["Greatness", "refusing to quit"] },
    { text: "A leader inspires not by words alone, but by walking the path first.", keywords: ["leader", "walking the path"] },
    { text: "Success is not speed but alignment — with your purpose, not the crowd.", keywords: ["Success", "alignment", "purpose"] },
    { text: "Silence often heals faster than explanations; stillness rebuilds strength.", keywords: ["Silence", "stillness"] },
    { text: "Fear whispers stop; courage shouts keep going.", keywords: ["Fear", "courage"] },
    { text: "Leadership is not a position but a decision.", keywords: ["Leadership", "decision"] },
    { text: "Every failure is feedback; use it as fuel.", keywords: ["failure", "fuel"] },
    { text: "Integrity is the foundation of self-leadership.", keywords: ["Integrity", "foundation"] },
    { text: "The mirror is your first classroom; who you are alone is who you truly lead.", keywords: ["mirror", "truly lead"] },
    { text: "Wisdom is knowing when to push and when to pause.", keywords: ["Wisdom", "pause"] },
];

export const LATEST_MESSAGE = {
    title: "Welcome to Hey Life",
    videoId: "M7lc1UVf-VE",
    thumbnail: "https://i.ytimg.com/vi/M7lc1UVf-VE/hqdefault.jpg"
};

export const ALL_BADGES: Omit<Badge, 'dateEarned'>[] = [
    {
        id: 'foundation_graduate',
        name: 'Foundation Graduate',
        icon: 'GraduationCap',
        description: 'Completed all lessons in the "Foundations of Faith" course.',
    },
    {
        id: 'prayer_warrior',
        name: 'Prayer Warrior',
        icon: 'Shield',
        description: 'Prayed for 50 requests on the Prayer Wall.',
    },
    {
        id: 'challenge_champion',
        name: 'Challenge Champion',
        icon: 'Trophy',
        description: 'Successfully completed 10 challenges.',
    },
    {
        id: 'community_builder',
        name: 'Community Builder',
        icon: 'Users',
        description: 'Made 10 posts in the Community Feed.',
    },
    {
        id: 'hey_gym_regular',
        name: 'Heygym Regular',
        icon: 'Dumbbell',
        description: 'Completed 4 weeks of a Heygym workout plan.',
    },
     {
        id: 'first_step',
        name: 'First Step',
        icon: 'Footprints',
        description: 'Completed your first lesson in the Academy.',
    },
    {
        id: 'soul_scribe',
        name: 'Soul Scribe',
        icon: 'BookOpen',
        description: 'Maintained a 3-day journaling streak.',
    },
    {
        id: 'iron_will',
        name: 'Iron Will',
        icon: 'Dumbbell',
        description: 'Completed 5 workouts in your plan.',
    },
];

export const JOURNAL_PROMPTS = [
    'journal.prompt.energy_drain',
    'journal.prompt.positive_impact',
    'journal.prompt.courage',
    'journal.prompt.gratitude',
    'journal.prompt.anxiety',
    'journal.prompt.joy',
    'journal.prompt.gods_voice',
    'journal.prompt.learning',
];

// Helper to split long prayer text into animated lines
export const getPrayerLines = (fullText: string): string[] => {
    return fullText.match(/[^.!?]+[.!?]+/g)?.map(s => s.trim()) || [fullText];
};

/**
 * Calculates Easter Sunday for a given year using Gauss Algorithm
 */
const getEasterDate = (year: number): Date => {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
};

// --- REAL BIBLE REFERENCES ---
const BIBLE_REFS = [
    'Psalm 5:12', 'Philippians 4:19', 'Isaiah 26:3', 'Lamentations 3:22-23', 'Isaiah 40:31', 
    'Matthew 17:20', 'Psalm 23:1-2', 'Psalm 27:1', '1 Corinthians 15:57', 'Romans 8:28',
    'James 1:5', '2 Corinthians 12:9', 'Colossians 3:2', '1 Peter 1:3', 'John 3:16'
];

// --- DATA SOURCE ---
export const SPIRIT_SNACKS: SpiritSnack[] = [
    // Special Seasonal Snacks
    { id: 'C', season: 'Christmas', titleKey: 'snack.C.title', reference: 'Luke 2:11', verseKey: 'snack.C.verse', prayerKey: 'snack.C.prayer' },
    { id: 'E', season: 'Easter', titleKey: 'snack.E.title', reference: 'Matthew 28:6', verseKey: 'snack.E.verse', prayerKey: 'snack.E.prayer' },
    { id: 'P', season: 'Pentecost', titleKey: 'snack.P.title', reference: 'Acts 2:4', verseKey: 'snack.P.verse', prayerKey: 'snack.P.prayer' },
    
    // Day 1 to Day 365
    ...Array.from({ length: 365 }, (_, i) => ({
        id: (i + 1).toString(),
        season: 'General' as const,
        titleKey: `snack.${i + 1}.title`,
        // Use real reference from array if available, otherwise fallback
        reference: BIBLE_REFS[i] || 'Scripture Reference',
        verseKey: `snack.${i + 1}.verse`,
        prayerKey: `snack.${i + 1}.prayer`
    }))
];

/**
 * Returns a spirit snack based on the current date, checking for special holidays first.
 */
export const getDailySpiritSnack = (): SpiritSnack => {
    const now = new Date();
    const month = now.getMonth(); 
    const date = now.getDate();
    const year = now.getFullYear();

    if (month === 11 && (date === 24 || date === 25 || date === 26)) {
        return SPIRIT_SNACKS.find(s => s.id === 'C') || SPIRIT_SNACKS[0];
    }

    const easter = getEasterDate(year);
    if (now.toDateString() === easter.toDateString()) {
        return SPIRIT_SNACKS.find(s => s.id === 'E') || SPIRIT_SNACKS[0];
    }

    const pentecost = new Date(easter);
    pentecost.setDate(easter.getDate() + 49); 
    if (now.toDateString() === pentecost.toDateString()) {
        return SPIRIT_SNACKS.find(s => s.id === 'P') || SPIRIT_SNACKS[0];
    }

    const start = new Date(year, 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    const snack = SPIRIT_SNACKS.find(s => s.id === dayOfYear.toString());
    return snack || SPIRIT_SNACKS[dayOfYear % SPIRIT_SNACKS.length];
};
