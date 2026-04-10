export type MarkerType = 'default' | 'red' | 'green' | 'purple' | 'orange' | 'cat_photo'

export type Profile = {
  id: string
  username: string | null
  is_premium: boolean
  premium_since: string | null
  stripe_customer_id: string | null
  marker_type: MarkerType
  marker_photo_url: string | null
  title: string | null
  created_at: string
}

export type Spot = {
  id: string
  user_id: string
  name: string
  description: string | null
  photo_url: string | null
  lat: number
  lng: number
  is_sponsored: boolean
  created_at: string
  profiles?: Profile
  cats?: Cat[]
  comments?: Comment[]
}

export type Cat = {
  id: string
  spot_id: string
  user_id: string
  name: string | null
  personality: string | null
  photo_url: string | null
  created_at: string
}

export type Comment = {
  id: string
  spot_id: string
  user_id: string
  body: string
  photo_url: string | null
  created_at: string
  profiles?: Profile
}

export type RegionalScore = {
  id: string
  user_id: string
  region: string
  spots_count: number
  cats_count: number
  comments_count: number
  total_score: number
  updated_at: string
  profiles?: Profile
}
