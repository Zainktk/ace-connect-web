export interface User {
    id: number;
    email: string;
    role: 'player' | 'organizer' | 'admin';
    is_verified: boolean;
    profile_completed: boolean;
    stripe_account_id?: string;
    stripe_onboarding_complete?: boolean;
    // Profile fields merged from backend
    name?: string;
    bio?: string;
    location?: string;
    ntrpRating?: number;
    photoUrl?: string;
    latitude?: number;
    longitude?: number;
    xp?: number;
    level?: number;
    streak?: number;
    achievements?: any[];
}

export interface Profile {
    user_id: number;
    name: string;
    gender: 'male' | 'female' | 'other';
    skill_level: string; // e.g. "Intermediate"
    ntrp_rating: number;
    years_experience: number;
    bio?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    photo_url?: string;
    phone_number?: string;
    xp?: number;
    level?: number;
    streak?: number;
    achievements?: any[];
}

export interface MatchRequest {
    id: number;
    user_id: number;
    match_type: 'singles' | 'doubles';
    preferred_date?: string;
    preferred_time?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    skill_level_min?: number;
    skill_level_max?: number;
    court_type?: 'hard' | 'clay' | 'grass' | 'indoor' | 'any';
    preferred_time_range?: string;
    notes?: string;
    status: 'open' | 'closed' | 'expired';
    created_at: string;
    // Joined fields
    name?: string;
    ntrp_rating?: number;
    user_location?: string;
    distance?: number;
    compatibility_score?: number;
    invitation_sent?: boolean;
}

export interface Event {
    id: number;
    organizer_id: number;
    title: string;
    description: string;
    event_date: string;
    location: string;
    latitude?: number;
    longitude?: number;
    price: number;
    max_participants: number;
    skill_level_min?: number;
    skill_level_max?: number;
    image_url?: string;
    created_at: string;
    organizer_name?: string;
    participant_count?: number;
    is_joined?: boolean;
}
